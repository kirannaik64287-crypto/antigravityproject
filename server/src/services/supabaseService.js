import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { supabaseAdmin, supabaseClient } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists for fallback persistence
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial memory / file store
let localStore = {
  profiles: {
    '00000000-0000-0000-0000-000000000001': {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Rajesh Patel',
      email: 'farmer@agrisahayak.local',
      phone: '+91 98765 43210',
      preferredLanguage: 'en',
      state: 'Maharashtra',
      district: 'Nagpur',
      village: 'Kalmeshwar',
      postalCode: '441501',
      farmingExperience: 12,
      farmingType: 'conventional',
      totalLandArea: 5.5,
      preferredUnits: 'acres',
      createdAt: new Date().toISOString()
    }
  },
  farms: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      userId: '00000000-0000-0000-0000-000000000001',
      name: 'Krishna River Plot',
      state: 'Maharashtra',
      district: 'Nagpur',
      village: 'Kalmeshwar',
      latitude: 21.2333,
      longitude: 78.9167,
      totalArea: 3.5,
      areaUnit: 'acres',
      soilType: 'black',
      irrigationSource: 'borewell',
      waterAvailability: 'sufficient',
      farmingMethod: 'conventional',
      currentCultivationStatus: 'standing_crop',
      notes: 'Black cotton soil with high moisture retention capacity.',
      isPrimary: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      userId: '00000000-0000-0000-0000-000000000001',
      name: 'North Canal Orchard',
      state: 'Maharashtra',
      district: 'Nagpur',
      village: 'Mohpa',
      latitude: 21.3167,
      longitude: 78.8167,
      totalArea: 2.0,
      areaUnit: 'acres',
      soilType: 'alluvial',
      irrigationSource: 'canal',
      waterAvailability: 'abundant',
      farmingMethod: 'organic',
      currentCultivationStatus: 'land_preparation',
      notes: 'Light loamy soil near canal distributary.',
      isPrimary: false,
      createdAt: new Date().toISOString()
    }
  ],
  cropAdvisories: [],
  soilAnalyses: [],
  fertilizerAdvisories: [],
  irrigationAdvisories: [],
  diseaseAnalyses: [],
  chatConversations: [],
  chatMessages: [],
  farmingCalendars: [],
  calendarTasks: []
};

// Load existing file store if available
if (fs.existsSync(STORE_FILE)) {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    localStore = { ...localStore, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Could not read existing local store:', err.message);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist store:', err.message);
  }
}

export class DatabaseService {
  static get isSupabaseConfigured() {
    return Boolean(supabaseAdmin || supabaseClient);
  }

  // -------------------------------------------------------------
  // PROFILES
  // -------------------------------------------------------------
  static async getProfile(userId) {
    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          preferredLanguage: data.preferred_language,
          state: data.state,
          district: data.district,
          village: data.village,
          postalCode: data.postal_code,
          farmingExperience: data.farming_experience,
          farmingType: data.farming_type,
          totalLandArea: data.total_land_area,
          preferredUnits: data.preferred_units,
          createdAt: data.created_at
        };
      }
    }

    return localStore.profiles[userId] || localStore.profiles['00000000-0000-0000-0000-000000000001'];
  }

  static async updateProfile(userId, profileData) {
    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      const { data, error } = await client
        .from('profiles')
        .upsert({
          id: userId,
          full_name: profileData.fullName,
          phone: profileData.phone,
          preferred_language: profileData.preferredLanguage,
          state: profileData.state,
          district: profileData.district,
          village: profileData.village,
          postal_code: profileData.postalCode,
          farming_experience: profileData.farmingExperience,
          farming_type: profileData.farmingType,
          total_land_area: profileData.totalLandArea,
          preferred_units: profileData.preferredUnits,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && data) return data;
    }

    localStore.profiles[userId] = {
      ...localStore.profiles[userId],
      ...profileData,
      id: userId,
      updatedAt: new Date().toISOString()
    };
    saveStore();
    return localStore.profiles[userId];
  }

  // -------------------------------------------------------------
  // FARMS
  // -------------------------------------------------------------
  static async getFarms(userId) {
    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      const { data, error } = await client
        .from('farms')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(f => ({
          id: f.id,
          userId: f.user_id,
          name: f.name,
          state: f.state,
          district: f.district,
          village: f.village,
          latitude: f.latitude,
          longitude: f.longitude,
          totalArea: f.total_area,
          areaUnit: f.area_unit,
          soilType: f.soil_type,
          irrigationSource: f.irrigation_source,
          waterAvailability: f.water_availability,
          farmingMethod: f.farming_method,
          currentCultivationStatus: f.current_cultivation_status,
          notes: f.notes,
          isPrimary: f.is_primary,
          createdAt: f.created_at
        }));
      }
    }

    return localStore.farms.filter(f => f.userId === userId);
  }

  static async createFarm(userId, farmData) {
    const newId = crypto.randomUUID();

    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      const { data, error } = await client
        .from('farms')
        .insert({
          id: newId,
          user_id: userId,
          name: farmData.name,
          state: farmData.state,
          district: farmData.district,
          village: farmData.village,
          latitude: farmData.latitude,
          longitude: farmData.longitude,
          total_area: farmData.totalArea,
          area_unit: farmData.areaUnit || 'acres',
          soil_type: farmData.soilType,
          irrigation_source: farmData.irrigationSource,
          water_availability: farmData.waterAvailability || 'sufficient',
          farming_method: farmData.farmingMethod || 'conventional',
          current_cultivation_status: farmData.currentCultivationStatus || 'fallow',
          notes: farmData.notes,
          is_primary: farmData.isPrimary || false
        })
        .select()
        .single();

      if (!error && data) return data;
    }

    const newFarm = {
      id: newId,
      userId,
      ...farmData,
      createdAt: new Date().toISOString()
    };
    localStore.farms.push(newFarm);
    saveStore();
    return newFarm;
  }

  static async updateFarm(farmId, userId, farmData) {
    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      const { data, error } = await client
        .from('farms')
        .update({
          name: farmData.name,
          state: farmData.state,
          district: farmData.district,
          village: farmData.village,
          latitude: farmData.latitude,
          longitude: farmData.longitude,
          total_area: farmData.totalArea,
          area_unit: farmData.areaUnit,
          soil_type: farmData.soilType,
          irrigation_source: farmData.irrigationSource,
          water_availability: farmData.waterAvailability,
          farming_method: farmData.farmingMethod,
          current_cultivation_status: farmData.currentCultivationStatus,
          notes: farmData.notes,
          is_primary: farmData.isPrimary,
          updated_at: new Date().toISOString()
        })
        .eq('id', farmId)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) return data;
    }

    const idx = localStore.farms.findIndex(f => f.id === farmId && f.userId === userId);
    if (idx !== -1) {
      localStore.farms[idx] = { ...localStore.farms[idx], ...farmData, updatedAt: new Date().toISOString() };
      saveStore();
      return localStore.farms[idx];
    }
    return null;
  }

  static async deleteFarm(farmId, userId) {
    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      await client
        .from('farms')
        .delete()
        .eq('id', farmId)
        .eq('user_id', userId);
    }

    localStore.farms = localStore.farms.filter(f => !(f.id === farmId && f.userId === userId));
    saveStore();
    return true;
  }

  // -------------------------------------------------------------
  // ADVISORIES PERSISTENCE & HISTORY
  // -------------------------------------------------------------
  static async saveCropAdvisory(userId, inputParams, recommendations, metadata = {}) {
    const id = crypto.randomUUID();
    const record = {
      id,
      userId,
      farmId: inputParams.farmId || null,
      soilType: inputParams.soilType,
      soilPh: inputParams.soilPh,
      nitrogen: inputParams.nitrogen,
      phosphorus: inputParams.phosphorus,
      potassium: inputParams.potassium,
      organicCarbon: inputParams.organicCarbon,
      soilMoisture: inputParams.soilMoisture,
      season: inputParams.season,
      location: inputParams.location,
      temperature: inputParams.temperature,
      rainfall: inputParams.rainfall,
      irrigationStatus: inputParams.irrigationStatus,
      waterAvailability: inputParams.waterAvailability,
      landArea: inputParams.landArea,
      previousCrop: inputParams.previousCrop,
      farmingPreferences: inputParams.farmingPreferences,
      expectedDuration: inputParams.expectedDuration,
      recommendations,
      aiConfidenceLevel: metadata.aiConfidenceLevel || 'High',
      missingFactors: metadata.missingFactors || [],
      createdAt: new Date().toISOString()
    };

    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      await client.from('crop_advisories').insert({
        id: record.id,
        user_id: record.userId,
        farm_id: record.farmId,
        soil_type: record.soilType,
        soil_ph: record.soilPh,
        nitrogen: record.nitrogen,
        phosphorus: record.phosphorus,
        potassium: record.potassium,
        organic_carbon: record.organicCarbon,
        soil_moisture: record.soilMoisture,
        season: record.season,
        location: record.location,
        temperature: record.temperature,
        rainfall: record.rainfall,
        irrigation_status: record.irrigationStatus,
        water_availability: record.waterAvailability,
        land_area: record.landArea,
        previous_crop: record.previousCrop,
        farming_preferences: record.farmingPreferences,
        expected_duration: record.expectedDuration,
        recommendations: record.recommendations,
        ai_confidence_level: record.aiConfidenceLevel,
        missing_factors: record.missingFactors
      });
    }

    localStore.cropAdvisories.unshift(record);
    saveStore();
    return record;
  }

  static async saveSoilAnalysis(userId, inputParams, result) {
    const id = crypto.randomUUID();
    const record = {
      id,
      userId,
      farmId: inputParams.farmId || null,
      soilPh: inputParams.soilPh,
      nitrogen: inputParams.nitrogen,
      phosphorus: inputParams.phosphorus,
      potassium: inputParams.potassium,
      organicCarbon: inputParams.organicCarbon,
      soilMoisture: inputParams.soilMoisture,
      soilType: inputParams.soilType,
      conditionSummary: result.conditionSummary,
      nutrientInterpretations: result.nutrientInterpretations,
      deficiencies: result.deficiencies,
      excesses: result.excesses,
      phInterpretation: result.phInterpretation,
      soilAmendments: result.soilAmendments,
      organicMatterAdvice: result.organicMatterAdvice,
      recommendedTests: result.recommendedTests,
      isLaboratoryVerified: inputParams.isLaboratoryVerified || false,
      confidenceScore: result.confidenceScore || 85,
      createdAt: new Date().toISOString()
    };

    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      await client.from('soil_analyses').insert({
        id: record.id,
        user_id: record.userId,
        farm_id: record.farmId,
        soil_ph: record.soilPh,
        nitrogen: record.nitrogen,
        phosphorus: record.phosphorus,
        potassium: record.potassium,
        organic_carbon: record.organicCarbon,
        soil_moisture: record.soilMoisture,
        soil_type: record.soilType,
        condition_summary: record.conditionSummary,
        nutrient_interpretations: record.nutrientInterpretations,
        deficiencies: record.deficiencies,
        excesses: record.excesses,
        ph_interpretation: record.phInterpretation,
        soil_amendments: record.soilAmendments,
        organic_matter_advice: record.organicMatterAdvice,
        recommended_tests: record.recommendedTests,
        is_laboratory_verified: record.isLaboratoryVerified,
        confidence_score: record.confidenceScore
      });
    }

    localStore.soilAnalyses.unshift(record);
    saveStore();
    return record;
  }

  static async saveFertilizerAdvisory(userId, inputParams, result) {
    const id = crypto.randomUUID();
    const record = {
      id,
      userId,
      farmId: inputParams.farmId || null,
      cropName: inputParams.cropName,
      growthStage: inputParams.growthStage,
      soilType: inputParams.soilType,
      landArea: inputParams.landArea,
      areaUnit: inputParams.areaUnit || 'acres',
      nutrientOverview: result.nutrientRequirementOverview,
      fertilizerSchedule: result.fertilizerSchedule,
      organicAlternatives: result.organicAlternatives,
      environmentalPrecautions: result.environmentalPrecautions,
      referenceStandard: result.referenceStandard || 'ICAR Standard',
      createdAt: new Date().toISOString()
    };

    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      await client.from('fertilizer_advisories').insert({
        id: record.id,
        user_id: record.userId,
        farm_id: record.farmId,
        crop_name: record.cropName,
        growth_stage: record.growthStage,
        soil_type: record.soilType,
        land_area: record.landArea,
        area_unit: record.areaUnit,
        nutrient_overview: record.nutrientOverview,
        fertilizer_schedule: record.fertilizerSchedule,
        organic_alternatives: record.organicAlternatives,
        environmental_precautions: record.environmentalPrecautions,
        reference_standard: record.referenceStandard
      });
    }

    localStore.fertilizerAdvisories.unshift(record);
    saveStore();
    return record;
  }

  static async saveIrrigationAdvisory(userId, inputParams, result) {
    const id = crypto.randomUUID();
    const record = {
      id,
      userId,
      farmId: inputParams.farmId || null,
      cropName: inputParams.cropName,
      growthStage: inputParams.growthStage,
      soilType: inputParams.soilType,
      irrigationMethod: inputParams.irrigationMethod,
      waterAvailability: inputParams.waterAvailability,
      irrigationGuidance: result.irrigationGuidance,
      recommendedSchedule: result.recommendedSchedule,
      waterConservationTips: result.waterConservationTips,
      waterStressIndicators: result.waterStressIndicators,
      overUnderPrecautions: `${result.overIrrigationRisks || ''} ${result.underIrrigationRisks || ''}`,
      createdAt: new Date().toISOString()
    };

    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      await client.from('irrigation_advisories').insert({
        id: record.id,
        user_id: record.userId,
        farm_id: record.farmId,
        crop_name: record.cropName,
        growth_stage: record.growthStage,
        soil_type: record.soilType,
        irrigation_method: record.irrigationMethod,
        water_availability: record.waterAvailability,
        irrigation_guidance: record.irrigationGuidance,
        recommended_schedule: record.recommendedSchedule,
        water_conservation_tips: record.waterConservationTips,
        water_stress_indicators: record.waterStressIndicators,
        over_under_precautions: record.overUnderPrecautions
      });
    }

    localStore.irrigationAdvisories.unshift(record);
    saveStore();
    return record;
  }

  static async saveDiseaseAnalysis(userId, inputParams, result, imageUrl) {
    const id = crypto.randomUUID();
    const record = {
      id,
      userId,
      farmId: inputParams.farmId || null,
      cropName: inputParams.cropName || 'General Crop',
      imageUrl: imageUrl || null,
      reportedSymptoms: inputParams.reportedSymptoms || '',
      observedVisualSymptoms: result.observedVisualSymptoms,
      suspectedDiseaseOrPest: result.suspectedDiseaseOrPest,
      scientificName: result.scientificName,
      alternativeCauses: result.alternativeCauses,
      confidenceLevel: result.confidenceLevel,
      contributingFactors: result.contributingFactors,
      immediateActions: result.immediateActions,
      preventiveMeasures: result.preventiveMeasures,
      expertConsultationAdvised: true,
      safetyDisclaimer: result.safetyDisclaimer,
      createdAt: new Date().toISOString()
    };

    if (this.isSupabaseConfigured) {
      const client = supabaseAdmin || supabaseClient;
      await client.from('disease_analyses').insert({
        id: record.id,
        user_id: record.userId,
        farm_id: record.farmId,
        crop_name: record.cropName,
        image_url: record.imageUrl,
        reported_symptoms: record.reportedSymptoms,
        observed_visual_symptoms: record.observedVisualSymptoms,
        suspected_disease_or_pest: record.suspectedDiseaseOrPest,
        scientific_name: record.scientificName,
        alternative_causes: record.alternativeCauses,
        confidence_level: record.confidenceLevel,
        contributing_factors: record.contributingFactors,
        immediate_actions: record.immediateActions,
        preventive_measures: record.preventiveMeasures,
        expert_consultation_advised: record.expertConsultationAdvised,
        safety_disclaimer: record.safetyDisclaimer
      });
    }

    localStore.diseaseAnalyses.unshift(record);
    saveStore();
    return record;
  }

  // -------------------------------------------------------------
  // CALENDAR & TASKS
  // -------------------------------------------------------------
  static async saveFarmingCalendar(userId, calendarData) {
    const calId = crypto.randomUUID();
    const tasks = (calendarData.tasks || []).map(t => ({
      id: crypto.randomUUID(),
      calendarId: calId,
      activityName: t.activityName,
      description: t.description,
      cropGrowthStage: t.cropGrowthStage,
      recommendedDate: t.recommendedDate,
      recommendedTiming: t.recommendedTiming,
      category: t.category,
      isCompleted: false,
      completedAt: null
    }));

    const calendarRecord = {
      id: calId,
      userId,
      farmId: calendarData.farmId || null,
      cropName: calendarData.cropName,
      variety: calendarData.variety || 'Standard High-Yielding',
      sowingDate: calendarData.sowingDate,
      expectedHarvestDate: calendarData.estimatedHarvestDate,
      durationDays: calendarData.durationDays,
      tasks,
      createdAt: new Date().toISOString()
    };

    localStore.farmingCalendars.unshift(calendarRecord);
    saveStore();
    return calendarRecord;
  }

  static async getFarmingCalendars(userId) {
    return localStore.farmingCalendars.filter(c => c.userId === userId);
  }

  static async toggleCalendarTask(calendarId, taskId, isCompleted) {
    const cal = localStore.farmingCalendars.find(c => c.id === calendarId);
    if (cal) {
      const task = cal.tasks.find(t => t.id === taskId);
      if (task) {
        task.isCompleted = isCompleted;
        task.completedAt = isCompleted ? new Date().toISOString() : null;
        saveStore();
        return task;
      }
    }
    return null;
  }

  // -------------------------------------------------------------
  // UNIFIED ADVISORY HISTORY
  // -------------------------------------------------------------
  static async getAllHistory(userId) {
    return {
      crops: localStore.cropAdvisories.filter(c => c.userId === userId),
      soil: localStore.soilAnalyses.filter(s => s.userId === userId),
      fertilizer: localStore.fertilizerAdvisories.filter(f => f.userId === userId),
      irrigation: localStore.irrigationAdvisories.filter(i => i.userId === userId),
      diseases: localStore.diseaseAnalyses.filter(d => d.userId === userId)
    };
  }
}
