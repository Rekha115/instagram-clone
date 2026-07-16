import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = (buffer, options = {}) => {
  const isPlaceholder = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('your_cloudinary');

  if (isPlaceholder) {
    return new Promise((resolve) => {
      const isVideo = options.resource_type === 'video';
      const mimetype = isVideo ? 'video/mp4' : 'image/jpeg';
      const base64Data = buffer.toString('base64');
      resolve({
        secure_url: `data:${mimetype};base64,${base64Data}`,
        public_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      });
    });
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'instagram-clone',
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes an asset from Cloudinary by its public_id.
 * @param {string} publicId
 * @param {string} resourceType - 'image' | 'video'
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  const isPlaceholder = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('your_cloudinary');
  if (isPlaceholder) {
    console.log(`[Local Mode] Bypassed deletion of asset: ${publicId}`);
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}: ${error.message}`);
  }
};

export default cloudinary;
