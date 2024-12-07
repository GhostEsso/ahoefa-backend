import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { CloudinaryResponse } from '../types';

export class UploadService {
  static async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'properties',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          format: 'webp'
        },
        (error, result: CloudinaryResponse | undefined) => {
          if (error) reject(error);
          else resolve(result?.secure_url || '');
        }
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }
} 