import express from 'express';
import { GeminiService } from '../services/geminiService.js';
import { DatabaseService } from '../services/supabaseService.js';
import { validateRequest } from '../middleware/validate.js';
import { calendarSchema, calendarTaskUpdateSchema } from '../schemas/validationSchemas.js';

const router = express.Router();

// GET /api/calendar - List all calendars
router.get('/', async (req, res, next) => {
  try {
    const calendars = await DatabaseService.getFarmingCalendars(req.user.id);
    res.json({
      success: true,
      data: calendars
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/calendar - Generate and save a farming calendar
router.post('/', validateRequest(calendarSchema), async (req, res, next) => {
  try {
    const inputParams = req.validatedData;
    const generated = await GeminiService.generateFarmingCalendar(inputParams);

    const savedCalendar = await DatabaseService.saveFarmingCalendar(
      req.user.id,
      {
        ...inputParams,
        ...generated
      }
    );

    res.status(201).json({
      success: true,
      data: savedCalendar
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/calendar/:calendarId/tasks/:taskId - Update task completion
router.patch('/:calendarId/tasks/:taskId', validateRequest(calendarTaskUpdateSchema), async (req, res, next) => {
  try {
    const { calendarId, taskId } = req.params;
    const { isCompleted } = req.validatedData;

    const updatedTask = await DatabaseService.toggleCalendarTask(calendarId, taskId, isCompleted);
    if (!updatedTask) {
      return res.status(404).json({ success: false, error: 'Task or calendar not found' });
    }

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
});

export default router;
