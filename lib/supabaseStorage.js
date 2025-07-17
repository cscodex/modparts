const { supabaseAdmin } = require('./supabase')
const crypto = require('crypto')

/**
 * Supabase Storage Service for handling file uploads
 * This replaces filesystem storage to prevent image loss during redeployments
 */
class SupabaseStorageService {
  constructor() {
    this.bucketName = 'product-images'
    this.maxFileSize = 5 * 1024 * 1024 // 5MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ]
  }

  /**
   * Initialize storage bucket if it doesn't exist
   */
  async initializeBucket() {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
      
      if (listError) {
        console.error('Error listing buckets:', listError)
        throw listError
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName)

      if (!bucketExists) {
        console.log(`Creating bucket: ${this.bucketName}`)
        
        const { data, error } = await supabaseAdmin.storage.createBucket(this.bucketName, {
          public: true, // Make bucket public for easy access
          allowedMimeTypes: this.allowedMimeTypes,
          fileSizeLimit: this.maxFileSize
        })

        if (error) {
          console.error('Error creating bucket:', error)
          throw error
        }

        console.log('✅ Bucket created successfully:', data)
      } else {
        console.log('✅ Bucket already exists:', this.bucketName)
      }

      return true
    } catch (error) {
      console.error('❌ Error initializing bucket:', error)
      throw error
    }
  }

  /**
   * Upload file to Supabase Storage
   * @param {Buffer} fileBuffer - File buffer data
   * @param {string} originalFilename - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} userId - User ID for organizing files
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadFile(fileBuffer, originalFilename, mimeType, userId = 'anonymous') {
    try {
      // Validate file type
      if (!this.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`Invalid file type: ${mimeType}. Allowed types: ${this.allowedMimeTypes.join(', ')}`)
      }

      // Validate file size
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error(`File too large: ${fileBuffer.length} bytes. Maximum size: ${this.maxFileSize} bytes`)
      }

      // Generate unique filename
      const fileExtension = this.getFileExtension(originalFilename)
      const timestamp = Date.now()
      const randomId = crypto.randomBytes(8).toString('hex')
      const uniqueFilename = `${userId}/${timestamp}_${randomId}${fileExtension}`

      console.log('📤 Uploading file to Supabase Storage:', {
        bucket: this.bucketName,
        path: uniqueFilename,
        size: fileBuffer.length,
        mimeType
      })

      // Ensure bucket exists
      await this.initializeBucket()

      // Upload file to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(uniqueFilename, fileBuffer, {
          contentType: mimeType,
          upsert: false // Don't overwrite existing files
        })

      if (error) {
        console.error('❌ Upload error:', error)
        throw error
      }

      console.log('✅ File uploaded successfully:', data)

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(this.bucketName)
        .getPublicUrl(uniqueFilename)

      const publicUrl = urlData.publicUrl

      console.log('🔗 Public URL generated:', publicUrl)

      return {
        url: publicUrl,
        path: uniqueFilename,
        bucket: this.bucketName,
        size: fileBuffer.length,
        mimeType
      }

    } catch (error) {
      console.error('❌ Error uploading file:', error)
      throw error
    }
  }

  /**
   * Delete file from Supabase Storage
   * @param {string} filePath - File path in storage
   * @returns {Promise<boolean>}
   */
  async deleteFile(filePath) {
    try {
      console.log('🗑️ Deleting file from Supabase Storage:', filePath)

      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove([filePath])

      if (error) {
        console.error('❌ Delete error:', error)
        throw error
      }

      console.log('✅ File deleted successfully:', data)
      return true

    } catch (error) {
      console.error('❌ Error deleting file:', error)
      throw error
    }
  }

  /**
   * Get file extension from filename
   * @param {string} filename 
   * @returns {string}
   */
  getFileExtension(filename) {
    const lastDot = filename.lastIndexOf('.')
    return lastDot !== -1 ? filename.substring(lastDot) : ''
  }

  /**
   * Extract file path from Supabase Storage URL
   * @param {string} url - Supabase Storage URL
   * @returns {string|null} - File path or null if not a valid Supabase URL
   */
  extractFilePathFromUrl(url) {
    try {
      if (!url || !url.includes('supabase')) {
        return null
      }

      // Extract path from URL like: https://project.supabase.co/storage/v1/object/public/bucket/path
      const urlParts = url.split('/storage/v1/object/public/')
      if (urlParts.length !== 2) {
        return null
      }

      const pathWithBucket = urlParts[1]
      const bucketPrefix = `${this.bucketName}/`
      
      if (pathWithBucket.startsWith(bucketPrefix)) {
        return pathWithBucket.substring(bucketPrefix.length)
      }

      return null
    } catch (error) {
      console.error('Error extracting file path from URL:', error)
      return null
    }
  }

  /**
   * List files in bucket (for admin purposes)
   * @param {string} folder - Folder path (optional)
   * @returns {Promise<Array>}
   */
  async listFiles(folder = '') {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .list(folder)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('❌ Error listing files:', error)
      throw error
    }
  }
}

module.exports = new SupabaseStorageService()
