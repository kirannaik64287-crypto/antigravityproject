import express from 'express';
import { DatabaseService } from '../services/supabaseService.js';
import { validateRequest } from '../middleware/validate.js';
import { farmSchema } from '../schemas/validationSchemas.js';

const router = express.Router();

// GET /api/farms - Get all farms for current farmer
router.get('/', async (req, res, next) => {
  try {
    const farms = await DatabaseService.getFarms(req.user.id);
    res.json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/farms - Create a new farm
router.post('/', validateRequest(farmSchema), async (req, res, next) => {
  try {
    const newFarm = await DatabaseService.createFarm(req.user.id, req.validatedData);
    res.status(201).json({
      success: true,
      message: 'Farm registered successfully',
      data: newFarm
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/farms/:id - Update an existing farm
router.put('/:id', validateRequest(farmSchema), async (req, res, next) => {
  try {
    const updated = await DatabaseService.updateFarm(req.params.id, req.user.id, req.validatedData);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    res.json({
      success: true,
      message: 'Farm updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/farms/:id - Delete a farm
router.delete('/:id', async (req, res, next) => {
  try {
    await DatabaseService.deleteFarm(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Farm removed successfully'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
