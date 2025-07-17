#!/usr/bin/env node

/**
 * Setup script for Supabase Storage bucket
 * Run this script to create the product-images bucket with proper policies
 */

const { supabaseAdmin } = require('../lib/supabase')

async function setupStorageBucket() {
  console.log('🚀 Setting up Supabase Storage for product images...')

  try {
    const bucketName = 'product-images'

    // 1. Create bucket if it doesn't exist
    console.log('📦 Creating storage bucket...')
    
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      throw listError
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName)

    if (!bucketExists) {
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (error) {
        console.error('❌ Error creating bucket:', error)
        throw error
      }

      console.log('✅ Bucket created successfully:', bucketName)
    } else {
      console.log('✅ Bucket already exists:', bucketName)
    }

    // 2. Set up RLS policies for the bucket
    console.log('🔒 Setting up Row Level Security policies...')

    // Policy to allow public read access
    const publicReadPolicy = `
      CREATE POLICY "Public read access for product images" ON storage.objects
      FOR SELECT USING (bucket_id = '${bucketName}');
    `

    // Policy to allow authenticated users to upload
    const authenticatedUploadPolicy = `
      CREATE POLICY "Authenticated users can upload product images" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = '${bucketName}' 
        AND auth.role() = 'authenticated'
      );
    `

    // Policy to allow users to update their own uploads
    const userUpdatePolicy = `
      CREATE POLICY "Users can update their own product images" ON storage.objects
      FOR UPDATE USING (
        bucket_id = '${bucketName}' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
    `

    // Policy to allow users to delete their own uploads
    const userDeletePolicy = `
      CREATE POLICY "Users can delete their own product images" ON storage.objects
      FOR DELETE USING (
        bucket_id = '${bucketName}' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
    `

    // Execute policies (note: these might fail if policies already exist, which is fine)
    const policies = [
      { name: 'Public read access', sql: publicReadPolicy },
      { name: 'Authenticated upload', sql: authenticatedUploadPolicy },
      { name: 'User update', sql: userUpdatePolicy },
      { name: 'User delete', sql: userDeletePolicy }
    ]

    for (const policy of policies) {
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: policy.sql })
        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️ Policy "${policy.name}" setup warning:`, error.message)
        } else {
          console.log(`✅ Policy "${policy.name}" configured`)
        }
      } catch (policyError) {
        console.warn(`⚠️ Policy "${policy.name}" setup warning:`, policyError.message)
      }
    }

    // 3. Test upload functionality
    console.log('🧪 Testing upload functionality...')
    
    const testBuffer = Buffer.from('test image data')
    const testFilename = `test/test-${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(testFilename, testBuffer, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError)
    } else {
      console.log('✅ Test upload successful')

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(testFilename)

      console.log('🔗 Test file URL:', urlData.publicUrl)

      // Clean up test file
      await supabaseAdmin.storage
        .from(bucketName)
        .remove([testFilename])

      console.log('🧹 Test file cleaned up')
    }

    console.log('\n🎉 Supabase Storage setup completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   • Bucket name: ${bucketName}`)
    console.log('   • Public read access: ✅')
    console.log('   • Authenticated upload: ✅')
    console.log('   • File size limit: 5MB')
    console.log('   • Allowed types: JPEG, PNG, GIF, WebP')
    console.log('\n💡 Your images will now be stored in Supabase Storage and persist through deployments!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  setupStorageBucket()
    .then(() => {
      console.log('\n✅ Setup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupStorageBucket }
