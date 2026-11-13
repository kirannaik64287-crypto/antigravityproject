import express from 'express';
import { WeatherService } from '../services/weatherService.js';

const router = express.Router();

// GET /api/weather
router.get('/', async (req, res, next) => {
  try {
    let { lat, lon, location } = req.query;

    if (!lat || !lon) {
      if (location) {
        const geo = await WeatherService.geocodeLocation(location);
        lat = geo.latitude;
        lon = geo.longitude;
        location = `${geo.name}, ${geo.state}`;
      } else {
        // Default to central agricultural zone
        lat = 21.1458;
        lon = 79.0882;
        location = 'Central Agro Zone (Maharashtra)';
      }
    }

    const weatherData = await WeatherService.getAgriculturalWeather(lat, lon, location);
    res.json({
      success: true,
      data: weatherData
    });
  } catch (err) {
    next(err);
  }
});

export default router;
