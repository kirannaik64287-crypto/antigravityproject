import express from 'express';
import { GeminiService } from '../services/geminiService.js';
import { DatabaseService } from '../services/supabaseService.js';
import { validateRequest } from '../middleware/validate.js';
import { soilAnalysisSchema } from '../schemas/validationSchemas.js';

const router = express.Router();

// POST /api/soil-analysis
router.post('/', validateRequest(soilAnalysisSchema), async (req, res, next) => {
  try {
    const inputParams = req.validatedData;
    const analysisResult = await GeminiService.analyzeSoil(inputParams);

    const savedRecord = await DatabaseService.saveSoilAnalysis(
      req.user.id,
      inputParams,
      analysisResult
    );

    res.json({
      success: true,
      data: {
        id: savedRecord.id,
        ...analysisResult
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/soil-analysis/history
router.get('/history', async (req, res, next) => {
  try {
    const history = await DatabaseService.getAllHistory(req.user.id);
    res.json({
      success: true,
      data: history.soil
    });
  } catch (err) {
    next(err);
  }
});

export default router;
