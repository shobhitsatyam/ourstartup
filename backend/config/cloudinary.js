import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an in-memory buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Target Cloudinary folder (defaults to ocean_jewel/products)
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadStreamToCloudinary = (buffer, folder = 'ocean_jewel/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export default cloudinary;
