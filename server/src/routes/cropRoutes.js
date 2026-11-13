import express from 'express';
import { GeminiService } from '../services/geminiService.js';
import { DatabaseService } from '../services/supabaseService.js';
import { validateRequest } from '../middleware/validate.js';
import { cropRecommendationSchema } from '../schemas/validationSchemas.js';

const router = express.Router();

// POST /api/crop-recommendation
router.post('/', validateRequest(cropRecommendationSchema), async (req, res, next) => {
  try {
    const inputParams = req.validatedData;
    const recommendationResult = await GeminiService.recommendCrops(inputParams);

    // Persist recommendation to database / history
    const savedRecord = await DatabaseService.saveCropAdvisory(
      req.user.id,
      inputParams,
      recommendationResult.recommendations,
      {
        aiConfidenceLevel: recommendationResult.confidenceLevel || 'High',
        missingFactors: recommendationResult.missingFactors || []
      }
    );

    res.json({
      success: true,
      data: {
        id: savedRecord.id,
        recommendations: recommendationResult.recommendations,
        overallAssessment: recommendationResult.overallAssessment,
        missingFactors: recommendationResult.missingFactors,
        disclaimer: recommendationResult.disclaimer,
        aiGenerated: recommendationResult.aiGenerated
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/crop-recommendation/history
router.get('/history', async (req, res, next) => {
  try {
    const history = await DatabaseService.getAllHistory(req.user.id);
    res.json({
      success: true,
      data: history.crops
    });
  } catch (err) {
    next(err);
  }
});

export default router;
