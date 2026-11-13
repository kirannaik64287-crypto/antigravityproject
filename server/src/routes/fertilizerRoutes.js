import express from 'express';
import { GeminiService } from '../services/geminiService.js';
import { DatabaseService } from '../services/supabaseService.js';
import { validateRequest } from '../middleware/validate.js';
import { fertilizerAdvisorySchema } from '../schemas/validationSchemas.js';

const router = express.Router();

// POST /api/fertilizer
router.post('/', validateRequest(fertilizerAdvisorySchema), async (req, res, next) => {
  try {
    const inputParams = req.validatedData;
    const advisoryResult = await GeminiService.recommendFertilizer(inputParams);

    const savedRecord = await DatabaseService.saveFertilizerAdvisory(
      req.user.id,
      inputParams,
      advisoryResult
    );

    res.json({
      success: true,
      data: {
        id: savedRecord.id,
        ...advisoryResult
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/fertilizer/history
router.get('/history', async (req, res, next) => {
  try {
    const history = await DatabaseService.getAllHistory(req.user.id);
    res.json({
      success: true,
      data: history.fertilizer
    });
  } catch (err) {
    next(err);
  }
});

export default router;
