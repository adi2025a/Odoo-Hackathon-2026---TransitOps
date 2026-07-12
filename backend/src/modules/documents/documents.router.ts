import { Router } from 'express';
import multer from 'multer';
import {
  listDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  getExpiringDocuments
} from './documents.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

export const documentsRouter = Router();

// Configure multer in memory with Zod/mime-type validations
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG and DOCX are allowed.'));
    }
  },
});

documentsRouter.get('/', authenticate, listDocuments);
documentsRouter.get('/expiring', authenticate, getExpiringDocuments);
documentsRouter.get('/:id', authenticate, getDocumentById);
documentsRouter.post('/upload', authenticate, authorize('Super Admin', 'Fleet Manager', 'Safety Officer'), upload.single('file'), uploadDocument);
documentsRouter.delete('/:id', authenticate, authorize('Super Admin'), deleteDocument);

export default documentsRouter;
