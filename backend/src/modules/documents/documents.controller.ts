import { Request, Response, NextFunction } from 'express';
import DocumentModel from '../../models/Document';
import { uploadFileToStorage } from '../../utils/s3';
import { sendSuccess, sendError } from '../../utils/response';

export const listDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, vehicleId, driverId } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;

    const documents = await DocumentModel.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, documents, 'Documents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findById(id);

    if (!document) {
      sendError(res, 'DOCUMENT_NOT_FOUND', 'Document not found', 404);
      return;
    }

    sendSuccess(res, document, 'Document retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      sendError(res, 'FILE_REQUIRED', 'Please upload a file', 400);
      return;
    }

    const { id, name, category, vehicleId, driverId, expiryDate } = req.body;

    const fileUrl = await uploadFileToStorage(file);

    const docId = id || `DOC-${Math.floor(100000 + Math.random() * 900000)}`;

    const document = await DocumentModel.create({
      _id: docId,
      name: name || file.originalname,
      category: category || 'OTHER',
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      vehicleId: vehicleId || null,
      driverId: driverId || null,
      uploadedBy: req.user?.userId || 'system',
      expiryDate: expiryDate || null,
    });

    sendSuccess(res, document, 'Document uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findByIdAndDelete(id);

    if (!document) {
      sendError(res, 'DOCUMENT_NOT_FOUND', 'Document not found', 404);
      return;
    }

    sendSuccess(res, null, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getExpiringDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

    const documents = await DocumentModel.find({
      expiryDate: {
        $gte: todayStr,
        $lte: thirtyDaysLaterStr,
      },
    }).sort({ expiryDate: 1 });

    sendSuccess(res, documents, 'Expiring documents retrieved successfully');
  } catch (error) {
    next(error);
  }
};
