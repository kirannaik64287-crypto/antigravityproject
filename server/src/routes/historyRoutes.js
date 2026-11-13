import express from 'express';
import { DatabaseService } from '../services/supabaseService.js';

const router = express.Router();

// GET /api/history - Unified history for all advisory modules
router.get('/', async (req, res, next) => {
  try {
    const history = await DatabaseService.getAllHistory(req.user.id);
    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
});

export default router;
