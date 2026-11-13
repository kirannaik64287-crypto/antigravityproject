import express from 'express';
import { GeminiService } from '../services/geminiService.js';
import { DatabaseService } from '../services/supabaseService.js';
import { validateRequest } from '../middleware/validate.js';
import { chatMessageSchema } from '../schemas/validationSchemas.js';

const router = express.Router();

// POST /api/chat
router.post('/', validateRequest(chatMessageSchema), async (req, res, next) => {
  try {
    const { message, conversationId, farmId, preferredLanguage, history } = req.validatedData;

    // Retrieve active farm context if provided
    let farmContext = null;
    if (farmId) {
      const farms = await DatabaseService.getFarms(req.user.id);
      farmContext = farms.find(f => f.id === farmId) || null;
    }

    // Retrieve farmer profile
    const farmerProfile = await DatabaseService.getProfile(req.user.id);

    const fullMessages = [
      ...(history || []),
      { role: 'user', content: message }
    ];

    const chatResponse = await GeminiService.generateChatResponse(
      fullMessages,
      farmContext,
      farmerProfile,
      preferredLanguage || farmerProfile?.preferredLanguage || 'en'
    );

    res.json({
      success: true,
      data: {
        reply: chatResponse.reply,
        aiGenerated: chatResponse.aiGenerated,
        conversationId: conversationId || `conv-${Date.now()}`
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
