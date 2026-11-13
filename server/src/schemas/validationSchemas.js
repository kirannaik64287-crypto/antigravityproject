import { z } from 'zod';

export const cropRecommendationSchema = z.object({
  soilType: z.string().min(1, 'Soil type is required'),
  soilPh: z.coerce.number().min(3.0).max(11.0).optional().nullable(),
  nitrogen: z.coerce.number().min(0).max(1500).optional().nullable(),
  phosphorus: z.coerce.number().min(0).max(500).optional().nullable(),
  potassium: z.coerce.number().min(0).max(1000).optional().nullable(),
  organicCarbon: z.coerce.number().min(0).max(10).optional().nullable(),
  soilMoisture: z.coerce.number().min(0).max(100).optional().nullable(),
  location: z.string().min(1, 'Location is required'),
  season: z.string().min(1, 'Season is required'),
  temperature: z.coerce.number().optional().nullable(),
  rainfall: z.coerce.number().optional().nullable(),
  irrigationStatus: z.string().default('irrigated'),
  waterAvailability: z.string().default('sufficient'),
  landArea: z.coerce.number().positive('Land area must be greater than 0').default(1),
  areaUnit: z.enum(['acres', 'hectares', 'guntas']).default('acres'),
  previousCrop: z.string().optional().nullable(),
  farmingPreferences: z.string().optional().nullable(),
  expectedDuration: z.string().optional().nullable(),
  farmId: z.string().uuid().optional().nullable()
});

export const soilAnalysisSchema = z.object({
  soilPh: z.coerce.number().min(3.0).max(11.0, 'Soil pH must be between 3.0 and 11.0'),
  nitrogen: z.coerce.number().min(0, 'Nitrogen must be positive'),
  phosphorus: z.coerce.number().min(0, 'Phosphorus must be positive'),
  potassium: z.coerce.number().min(0, 'Potassium must be positive'),
  organicCarbon: z.coerce.number().min(0).max(10).optional().nullable(),
  soilMoisture: z.coerce.number().min(0).max(100).optional().nullable(),
  soilType: z.string().min(1, 'Soil type is required'),
  farmId: z.string().uuid().optional().nullable(),
  isLaboratoryVerified: z.boolean().default(false)
});

export const fertilizerAdvisorySchema = z.object({
  cropName: z.string().min(1, 'Crop name is required'),
  growthStage: z.string().min(1, 'Growth stage is required'),
  soilType: z.string().optional().nullable(),
  landArea: z.coerce.number().positive('Land area must be greater than 0').default(1),
  areaUnit: z.enum(['acres', 'hectares', 'guntas']).default('acres'),
  nitrogen: z.coerce.number().optional().nullable(),
  phosphorus: z.coerce.number().optional().nullable(),
  potassium: z.coerce.number().optional().nullable(),
  farmId: z.string().uuid().optional().nullable()
});

export const irrigationAdvisorySchema = z.object({
  cropName: z.string().min(1, 'Crop name is required'),
  growthStage: z.string().min(1, 'Growth stage is required'),
  soilType: z.string().min(1, 'Soil type is required'),
  irrigationMethod: z.string().min(1, 'Irrigation method is required'),
  waterAvailability: z.string().min(1, 'Water availability is required'),
  soilMoisture: z.coerce.number().optional().nullable(),
  temperature: z.coerce.number().optional().nullable(),
  rainfallForecast: z.coerce.number().optional().nullable(),
  farmId: z.string().uuid().optional().nullable()
});

export const diseaseDetectionSchema = z.object({
  cropName: z.string().optional().nullable(),
  reportedSymptoms: z.string().optional().nullable(),
  farmId: z.string().uuid().optional().nullable()
});

export const farmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  village: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  totalArea: z.coerce.number().positive('Total area must be greater than 0'),
  areaUnit: z.enum(['acres', 'hectares', 'guntas']).default('acres'),
  soilType: z.string().min(1, 'Soil type is required'),
  irrigationSource: z.string().min(1, 'Irrigation source is required'),
  waterAvailability: z.enum(['abundant', 'sufficient', 'moderate', 'scarce']).default('sufficient'),
  farmingMethod: z.enum(['conventional', 'organic', 'natural_farming', 'integrated']).default('conventional'),
  currentCultivationStatus: z.enum(['fallow', 'standing_crop', 'harvested', 'land_preparation']).default('fallow'),
  notes: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false)
});

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name cannot be blank').optional(),
  phone: z.string().optional().nullable(),
  preferredLanguage: z.string().default('en'),
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  village: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  farmingExperience: z.coerce.number().min(0).max(80).optional().nullable(),
  farmingType: z.string().optional().nullable(),
  totalLandArea: z.coerce.number().min(0).optional().nullable(),
  preferredUnits: z.enum(['acres', 'hectares', 'guntas']).default('acres')
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().uuid().optional().nullable(),
  farmId: z.string().uuid().optional().nullable(),
  preferredLanguage: z.string().default('en'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional().default([])
});

export const calendarSchema = z.object({
  cropName: z.string().min(1, 'Crop name is required'),
  variety: z.string().optional().nullable(),
  sowingDate: z.string().min(1, 'Sowing date is required'),
  farmId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const calendarTaskUpdateSchema = z.object({
  isCompleted: z.boolean()
});
