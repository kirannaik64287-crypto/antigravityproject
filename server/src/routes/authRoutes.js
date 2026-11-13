import express from 'express';
import { DatabaseService } from '../services/supabaseService.js';
import { validateRequest } from '../middleware/validate.js';
import { profileSchema } from '../schemas/validationSchemas.js';
import { env } from '../config/env.js';
import { geminiClient } from '../config/gemini.js';
import { supabaseClient } from '../config/supabase.js';

const router = express.Router();

// GET /api/auth/profile
router.get('/profile', async (req, res, next) => {
  try {
    const profile = await DatabaseService.getProfile(req.user.id);
    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile
router.put('/profile', validateRequest(profileSchema), async (req, res, next) => {
  try {
    const updated = await DatabaseService.updateProfile(req.user.id, req.validatedData);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/status (diagnostic endpoint)
router.get('/status', async (req, res) => {
  res.json({
    success: true,
    services: {
      supabase: {
        configured: Boolean(supabaseClient),
        url: env.SUPABASE_URL ? `${env.SUPABASE_URL.substring(0, 15)}...` : 'Not configured'
      },
      gemini: {
        configured: Boolean(geminiClient),
        model: env.GEMINI_MODEL
      },
      weather: {
        provider: env.OPENWEATHER_API_KEY ? 'OpenWeatherMap + Open-Meteo' : 'Open-Meteo (Real-Time Global Weather)'
      }
    },
    user: req.user
  });
});

export default router;
