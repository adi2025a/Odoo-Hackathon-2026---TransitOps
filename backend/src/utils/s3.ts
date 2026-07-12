import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

// Graceful file saver helper
// In real production, this would use AWS.S3 upload.
// For developers without active AWS credentials in .env, it defaults to a local public upload storage.
export const uploadFileToStorage = async (
  file: Express.Multer.File
): Promise<string> => {
  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET) {
    // Mock S3 upload returning a schema bucket URL
    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/documents/${Date.now()}_${file.originalname}`;
  } else {
    // Local storage fallback
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    
    return `http://localhost:${env.PORT}/uploads/${fileName}`;
  }
};
