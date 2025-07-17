#!/usr/bin/env node

/**
 * Migration script to move existing filesystem images to Supabase Storage
 * This script will:
 * 1. Find all products with filesystem image URLs
 * 2. Download the images from the filesystem
 * 3. Upload them to Supabase Storage
 * 4. Update the product records with new URLs
 */

const fs = require('fs')
const path = require('path')
const { supabaseAdmin } = require('../lib/supabase')
const supabaseStorage = require('../lib/supabaseStorage')

async function migrateImagesToSupabase() {
  console.log('🚀 Starting image migration to Supabase Storage...')

  try {
    // 1. Get all products with image URLs
    console.log('📋 Fetching products with images...')
    
    const { data: products, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name, image_url')
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError)
      throw fetchError
    }

    console.log(`📦 Found ${products.length} products with images`)

    if (products.length === 0) {
      console.log('✅ No images to migrate!')
      return
    }

    // 2. Filter products that need migration (not already on Supabase Storage)
    const productsToMigrate = products.filter(product => {
      const imageUrl = product.image_url
      // Skip if already on Supabase Storage
      if (imageUrl.includes('supabase.co/storage/v1/object/public/')) {
        return false
      }
      // Skip if it's a placeholder or external URL
      if (imageUrl.includes('placeholder') || imageUrl.startsWith('http') && !imageUrl.includes('localhost')) {
        return false
      }
      return true
    })

    console.log(`🔄 ${productsToMigrate.length} products need migration`)

    if (productsToMigrate.length === 0) {
      console.log('✅ All images are already migrated or external!')
      return
    }

    // 3. Migrate each image
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (let i = 0; i < productsToMigrate.length; i++) {
      const product = productsToMigrate[i]
      console.log(`\n📸 [${i + 1}/${productsToMigrate.length}] Migrating: ${product.name}`)
      console.log(`   Current URL: ${product.image_url}`)

      try {
        // Determine the file path
        let filePath
        if (product.image_url.startsWith('/uploads/')) {
          filePath = path.join(process.cwd(), 'public', product.image_url)
        } else if (product.image_url.startsWith('uploads/')) {
          filePath = path.join(process.cwd(), 'public', product.image_url)
        } else if (product.image_url.startsWith('/')) {
          filePath = path.join(process.cwd(), 'public', product.image_url)
        } else {
          filePath = path.join(process.cwd(), 'public', 'uploads', product.image_url)
        }

        console.log(`   File path: ${filePath}`)

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.log(`   ⚠️ File not found, skipping...`)
          continue
        }

        // Read the file
        const fileBuffer = fs.readFileSync(filePath)
        const fileStats = fs.statSync(filePath)
        
        // Determine MIME type from extension
        const ext = path.extname(filePath).toLowerCase()
        let mimeType = 'image/jpeg' // default
        switch (ext) {
          case '.png': mimeType = 'image/png'; break
          case '.gif': mimeType = 'image/gif'; break
          case '.webp': mimeType = 'image/webp'; break
          case '.jpg':
          case '.jpeg': mimeType = 'image/jpeg'; break
        }

        const filename = path.basename(filePath)
        console.log(`   Size: ${fileStats.size} bytes, Type: ${mimeType}`)

        // Upload to Supabase Storage
        const uploadResult = await supabaseStorage.uploadFile(
          fileBuffer,
          filename,
          mimeType,
          'migration'
        )

        console.log(`   ✅ Uploaded to: ${uploadResult.url}`)

        // Update product record
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ image_url: uploadResult.url })
          .eq('id', product.id)

        if (updateError) {
          console.error(`   ❌ Failed to update product record:`, updateError)
          errors.push({ product: product.name, error: updateError.message })
          errorCount++
        } else {
          console.log(`   ✅ Product record updated`)
          successCount++
        }

      } catch (error) {
        console.error(`   ❌ Migration failed:`, error.message)
        errors.push({ product: product.name, error: error.message })
        errorCount++
      }
    }

    // 4. Summary
    console.log('\n📊 Migration Summary:')
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📦 Total processed: ${productsToMigrate.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.product}: ${error.error}`)
      })
    }

    if (successCount > 0) {
      console.log('\n🎉 Migration completed! Your images are now stored in Supabase Storage.')
      console.log('💡 These images will persist through deployments and redeployments.')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Dry run function to preview what would be migrated
async function dryRunMigration() {
  console.log('🔍 Dry run: Checking what images would be migrated...')

  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, image_url')
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')

    if (error) throw error

    console.log(`📦 Total products with images: ${products.length}`)

    const productsToMigrate = products.filter(product => {
      const imageUrl = product.image_url
      if (imageUrl.includes('supabase.co/storage/v1/object/public/')) {
        return false
      }
      if (imageUrl.includes('placeholder') || imageUrl.startsWith('http') && !imageUrl.includes('localhost')) {
        return false
      }
      return true
    })

    console.log(`🔄 Products that would be migrated: ${productsToMigrate.length}`)

    if (productsToMigrate.length > 0) {
      console.log('\n📋 Products to migrate:')
      productsToMigrate.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.image_url}`)
      })
    }

    const alreadyMigrated = products.filter(product => 
      product.image_url.includes('supabase.co/storage/v1/object/public/')
    )

    if (alreadyMigrated.length > 0) {
      console.log(`\n✅ Already migrated: ${alreadyMigrated.length} products`)
    }

  } catch (error) {
    console.error('❌ Dry run failed:', error)
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--dry-run')) {
    dryRunMigration()
      .then(() => process.exit(0))
      .catch(() => process.exit(1))
  } else {
    migrateImagesToSupabase()
      .then(() => {
        console.log('\n✅ Migration completed successfully!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('\n❌ Migration failed:', error)
        process.exit(1)
      })
  }
}

module.exports = { migrateImagesToSupabase, dryRunMigration }
