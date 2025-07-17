#!/usr/bin/env node

/**
 * Script to fix products with "nan" image_url values
 * This script will find all products with invalid image URLs and set them to NULL
 */

const { supabaseAdmin } = require('../lib/supabase')

async function fixNanImageUrls() {
  console.log('🔧 Starting to fix "nan" image URLs in products...')

  try {
    // 1. Find all products with "nan" or invalid image URLs
    console.log('📋 Fetching products with invalid image URLs...')
    
    const { data: products, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name, image_url')
      .or('image_url.eq.nan,image_url.eq.undefined,image_url.eq.null,image_url.eq.NULL')

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError)
      throw fetchError
    }

    console.log(`📦 Found ${products.length} products with invalid image URLs`)

    if (products.length === 0) {
      console.log('✅ No products with invalid image URLs found!')
      return
    }

    // 2. Show what will be fixed
    console.log('\n📋 Products to fix:')
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - Current URL: "${product.image_url}"`)
    })

    // 3. Update all invalid image URLs to NULL
    console.log('\n🔄 Updating invalid image URLs to NULL...')
    
    const productIds = products.map(p => p.id)
    
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('products')
      .update({ image_url: null })
      .in('id', productIds)

    if (updateError) {
      console.error('❌ Error updating products:', updateError)
      throw updateError
    }

    console.log(`✅ Successfully updated ${products.length} products`)

    // 4. Verify the fix
    console.log('\n🔍 Verifying the fix...')
    
    const { data: verifyProducts, error: verifyError } = await supabaseAdmin
      .from('products')
      .select('id, name, image_url')
      .in('id', productIds)

    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError)
      throw verifyError
    }

    console.log('📋 Updated products:')
    verifyProducts.forEach((product, index) => {
      const status = product.image_url === null ? '✅ NULL' : `❌ Still: "${product.image_url}"`
      console.log(`   ${index + 1}. ${product.name} - ${status}`)
    })

    // 5. Summary
    const fixedCount = verifyProducts.filter(p => p.image_url === null).length
    const stillBrokenCount = verifyProducts.filter(p => p.image_url !== null).length

    console.log('\n📊 Summary:')
    console.log(`   ✅ Fixed: ${fixedCount}`)
    console.log(`   ❌ Still broken: ${stillBrokenCount}`)
    console.log(`   📦 Total processed: ${products.length}`)

    if (stillBrokenCount === 0) {
      console.log('\n🎉 All invalid image URLs have been fixed!')
      console.log('💡 Products with NULL image_url will now show placeholder images.')
    } else {
      console.log('\n⚠️ Some products still have invalid image URLs. Manual review may be needed.')
    }

  } catch (error) {
    console.error('❌ Fix failed:', error)
    throw error
  }
}

// Also fix other common invalid values
async function fixAllInvalidImageUrls() {
  console.log('🔧 Starting comprehensive fix for all invalid image URLs...')

  try {
    // Find products with various invalid values
    const invalidValues = ['nan', 'undefined', 'null', 'NULL', '', ' ']
    
    for (const invalidValue of invalidValues) {
      console.log(`\n🔍 Checking for products with image_url = "${invalidValue}"...`)
      
      const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('id, name, image_url')
        .eq('image_url', invalidValue)

      if (error) {
        console.error(`❌ Error checking for "${invalidValue}":`, error)
        continue
      }

      if (products.length > 0) {
        console.log(`📦 Found ${products.length} products with "${invalidValue}"`)
        
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ image_url: null })
          .eq('image_url', invalidValue)

        if (updateError) {
          console.error(`❌ Error updating "${invalidValue}":`, updateError)
        } else {
          console.log(`✅ Fixed ${products.length} products with "${invalidValue}"`)
        }
      } else {
        console.log(`✅ No products found with "${invalidValue}"`)
      }
    }

    console.log('\n🎉 Comprehensive fix completed!')

  } catch (error) {
    console.error('❌ Comprehensive fix failed:', error)
    throw error
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--comprehensive')) {
    fixAllInvalidImageUrls()
      .then(() => {
        console.log('\n✅ Comprehensive fix completed successfully!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('\n❌ Comprehensive fix failed:', error)
        process.exit(1)
      })
  } else {
    fixNanImageUrls()
      .then(() => {
        console.log('\n✅ Fix completed successfully!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('\n❌ Fix failed:', error)
        process.exit(1)
      })
  }
}

module.exports = { fixNanImageUrls, fixAllInvalidImageUrls }
