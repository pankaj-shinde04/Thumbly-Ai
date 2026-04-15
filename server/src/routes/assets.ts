import { Router } from 'express';
import multer from 'multer';
import { 
  uploadAsset, 
  getAsset, 
  downloadAsset,
  deleteAsset
} from '../controllers/assetController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All asset routes require authentication
router.use(authenticate);

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Routes
router.post('/upload', upload.single('file'), uploadAsset);
router.get('/:id', getAsset);
router.get('/:id/download', downloadAsset);
router.delete('/:id', deleteAsset);

export default router;
