# 📁 Supabase Storage Integration

This document explains how to set up and use Supabase Storage for product images, replacing filesystem storage to prevent image loss during redeployments.

## 🎯 Benefits

- **✅ Persistent Storage**: Images survive redeployments and server restarts
- **🌐 CDN Performance**: Fast global image delivery via Supabase CDN
- **🔒 Security**: Built-in access controls and policies
- **📈 Scalability**: No server disk space limitations
- **💰 Cost Effective**: Pay only for what you use

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
npm run setup-storage
```

This will:
- Create the `product-images` bucket in Supabase Storage
- Set up proper access policies
- Test upload functionality

### 2. Migrate Existing Images (Optional)

If you have existing images in the filesystem:

```bash
# Preview what will be migrated
npm run migrate-images:dry-run

# Perform the actual migration
npm run migrate-images
```

### 3. Start Using Supabase Storage

New image uploads will automatically use Supabase Storage. No code changes needed!

## 📋 How It Works

### Upload Process

1. **Frontend**: User selects image in admin panel
2. **API**: Image is uploaded to `/api/upload`
3. **Storage**: Image is saved to Supabase Storage bucket
4. **Database**: Product record is updated with Supabase Storage URL
5. **Display**: Image is served from Supabase CDN

### File Organization

Images are organized by user ID:
```
product-images/
├── user123/
│   ├── 1642123456789_abc123def.jpg
│   └── 1642123456790_def456ghi.png
├── migration/
│   ├── migrated_image1.jpg
│   └── migrated_image2.png
└── anonymous/
    └── temp_uploads.jpg
```

## 🔧 Technical Details

### Storage Configuration

- **Bucket Name**: `product-images`
- **Public Access**: Yes (for product display)
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **CDN**: Automatic via Supabase

### Security Policies

1. **Public Read**: Anyone can view product images
2. **Authenticated Upload**: Only logged-in users can upload
3. **User Management**: Users can update/delete their own uploads
4. **Admin Override**: Admins have full access

### URL Format

Supabase Storage URLs follow this pattern:
```
https://[project-id].supabase.co/storage/v1/object/public/product-images/[user-id]/[filename]
```

Example:
```
https://uwizdypmlvfvegklnogq.supabase.co/storage/v1/object/public/product-images/user123/1642123456789_abc123def.jpg
```

## 🛠️ Manual Setup (Alternative)

If you prefer manual setup:

### 1. Create Bucket in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `product-images`
4. Set it as public

### 2. Set Up Policies

Run these SQL commands in the Supabase SQL editor:

```sql
-- Allow public read access
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔍 Troubleshooting

### Common Issues

**1. "Bucket not found" error**
```bash
# Run the setup script
npm run setup-storage
```

**2. "Permission denied" error**
- Check that your Supabase service role key is correct
- Verify the bucket policies are set up properly

**3. Images not displaying**
- Check that the bucket is set to public
- Verify the URL format is correct
- Check browser console for CORS errors

**4. Upload fails**
- Check file size (max 5MB)
- Verify file type is allowed (JPEG, PNG, GIF, WebP)
- Check Supabase project quotas

### Debug Commands

```bash
# Check what images would be migrated
npm run migrate-images:dry-run

# Test storage setup
npm run setup-storage

# Check logs
tail -f logs/upload.log
```

## 📊 Monitoring

### Storage Usage

Monitor your storage usage in the Supabase dashboard:
- Go to Settings → Usage
- Check Storage section
- Set up billing alerts if needed

### Performance

Supabase Storage provides:
- Global CDN distribution
- Automatic image optimization
- Fast upload/download speeds
- 99.9% uptime SLA

## 🔄 Migration from Filesystem

The migration script will:

1. **Scan**: Find all products with filesystem image URLs
2. **Filter**: Skip already migrated or external images
3. **Upload**: Move images to Supabase Storage
4. **Update**: Change database URLs to Supabase URLs
5. **Verify**: Ensure all migrations completed successfully

### Migration Safety

- ✅ Non-destructive (original files remain)
- ✅ Rollback possible
- ✅ Dry-run available
- ✅ Progress tracking
- ✅ Error handling

## 🎉 Benefits After Migration

- **No more image loss** during deployments
- **Faster image loading** via CDN
- **Better scalability** for high traffic
- **Reduced server storage** requirements
- **Professional image URLs** for SEO

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase Storage documentation
3. Check project logs and console errors
4. Verify environment variables are set correctly

---

**🚀 Ready to go!** Your images are now stored safely in Supabase Storage and will persist through all deployments.
