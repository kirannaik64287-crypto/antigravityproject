import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GeminiService } from '../services/geminiService.js';
import { DatabaseService } from '../services/supabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are supported.'));
    }
  }
});

const router = express.Router();

// POST /api/disease-detection
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const cropName = req.body.cropName || '';
    const reportedSymptoms = req.body.reportedSymptoms || '';
    const farmId = req.body.farmId || null;

    let imageBuffer = null;
    let mimeType = 'image/jpeg';
    let savedImageUrl = null;

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;

      // Save a copy locally for viewing in history
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `crop-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filePath, imageBuffer);
      savedImageUrl = `/uploads/${filename}`;
    }

    const diagnosisResult = await GeminiService.analyzeCropDiseaseImage(
      imageBuffer,
      mimeType,
      cropName,
      reportedSymptoms
    );

    const savedRecord = await DatabaseService.saveDiseaseAnalysis(
      req.user.id,
      { cropName, reportedSymptoms, farmId },
      diagnosisResult,
      savedImageUrl
    );

    res.json({
      success: true,
      data: {
        id: savedRecord.id,
        imageUrl: savedImageUrl,
        ...diagnosisResult
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/disease-detection/history
router.get('/history', async (req, res, next) => {
  try {
    const history = await DatabaseService.getAllHistory(req.user.id);
    res.json({
      success: true,
      data: history.diseases
    });
  } catch (err) {
    next(err);
  }
});

export default router;
