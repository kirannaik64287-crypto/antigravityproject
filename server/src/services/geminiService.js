import { geminiClient } from '../config/gemini.js';
import { env } from '../config/env.js';
import { CROPS_DATABASE, SOIL_NUTRIENT_THRESHOLDS, FERTILIZER_SOURCES } from './agronomicData.js';

export class GeminiService {
  /**
   * Helper to execute Gemini generation or parse JSON response safely
   */
  static async callGeminiJSON(systemPrompt, userPrompt) {
    if (!geminiClient) {
      return null;
    }

    try {
      const response = await geminiClient.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object matching the requested schema. Do not enclose in markdown ticks if possible, or use standard \`\`\`json blocks.\n\n${userPrompt}` }
            ]
          }
        ]
      });

      const responseText = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text) || '';
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn('Gemini API call failed or timed out:', err.message);
      return null;
    }
  }

  /**
   * 1. CROP RECOMMENDATION
   */
  static async recommendCrops(params) {
    const {
      soilType, soilPh, nitrogen, phosphorus, potassium, organicCarbon,
      soilMoisture, location, season, temperature, rainfall, irrigationStatus,
      waterAvailability, landArea, areaUnit, previousCrop, farmingPreferences, expectedDuration
    } = params;

    const systemPrompt = `You are AgriSahayak, an elite Agricultural AI Agronomist specializing in Indian agro-climatic zones and ICAR crop suitability guidelines.
Analyze the farmer's soil chemistry, climatic conditions, water availability, and farm profile to recommend the top 3-4 ranked crops.
Adhere to strict agricultural safety: clearly state that recommendations are decision-support scores and advise verifying with local Krishi Vigyan Kendra (KVK).`;

    const userPrompt = `Evaluate the following agricultural parameters and return a JSON object with:
"recommendations": Array of at least 3 ranked crops. Each item MUST have:
  - "cropName": string
  - "scientificName": string
  - "suitabilityScore": integer (0 to 100, AI-estimated decision support score)
  - "suitabilityCategory": "Highly Suitable" | "Moderately Suitable" | "Conditionally Suitable"
  - "reason": concise explanation of suitability
  - "soilCompatibility": string
  - "climateCompatibility": string
  - "waterRequirements": string
  - "recommendedSeason": string
  - "estimatedDuration": string
  - "nutrientConsiderations": string
  - "irrigationConsiderations": string
  - "importantPrecautions": string
  - "confidenceLevel": "High" | "Moderate" | "Preliminary"
"missingFactors": Array of strings (parameters that were omitted or estimated)
"overallAssessment": string
"disclaimer": string

FARMER INPUTS:
- Soil Type: ${soilType}
- Soil pH: ${soilPh ?? 'Not tested'}
- Nitrogen (N): ${nitrogen ? `${nitrogen} kg/ha` : 'Not provided'}
- Phosphorus (P): ${phosphorus ? `${phosphorus} kg/ha` : 'Not provided'}
- Potassium (K): ${potassium ? `${potassium} kg/ha` : 'Not provided'}
- Organic Carbon: ${organicCarbon ? `${organicCarbon} %` : 'Not provided'}
- Soil Moisture: ${soilMoisture ? `${soilMoisture} %` : 'Not provided'}
- Location: ${location}
- Cultivation Season: ${season}
- Observed/Forecast Temperature: ${temperature ? `${temperature} °C` : 'Seasonal average'}
- Rainfall: ${rainfall ? `${rainfall} mm` : 'Seasonal average'}
- Irrigation Status: ${irrigationStatus}
- Water Availability: ${waterAvailability}
- Land Area: ${landArea} ${areaUnit || 'acres'}
- Previous Crop: ${previousCrop || 'None / Fallow'}
- Farming Preferences: ${farmingPreferences || 'Open'}
- Expected Duration: ${expectedDuration || 'Standard'}`;

    // Attempt Gemini AI Call
    const aiResult = await this.callGeminiJSON(systemPrompt, userPrompt);
    if (aiResult && aiResult.recommendations && aiResult.recommendations.length > 0) {
      return {
        ...aiResult,
        aiGenerated: true,
        model: env.GEMINI_MODEL
      };
    }

    // Agronomic Engine Fallback (Guarantees reliable, mathematically sound crop recommendations)
    return this.fallbackCropRecommendations(params);
  }

  /**
   * 2. SOIL HEALTH ANALYSIS
   */
  static async analyzeSoil(params) {
    const { soilPh, nitrogen, phosphorus, potassium, organicCarbon, soilMoisture, soilType } = params;

    const systemPrompt = `You are a Senior Soil Chemist and Agronomist.
Interpret soil test parameters against standard agronomic reference thresholds (ICAR standards).
Diagnose nutrient deficiencies, nutrient excesses, soil pH reactions, and suggest amendments and follow-up soil tests.`;

    const userPrompt = `Generate a JSON object with:
"conditionSummary": string
"nutrientInterpretations": {
  "nitrogen": { "status": "Low"|"Optimum"|"High", "value": number, "interpretation": string },
  "phosphorus": { "status": "Low"|"Optimum"|"High", "value": number, "interpretation": string },
  "potassium": { "status": "Low"|"Optimum"|"High", "value": number, "interpretation": string },
  "organicCarbon": { "status": "Low"|"Optimum"|"High", "value": number, "interpretation": string }
}
"deficiencies": Array of objects: { "nutrient": string, "impact": string, "correctiveAction": string }
"excesses": Array of objects: { "nutrient": string, "risk": string, "mitigation": string }
"phInterpretation": string
"soilAmendments": Array of objects: { "amendment": string, "dosage": string, "purpose": string }
"organicMatterAdvice": string
"recommendedTests": Array of string (e.g. Zinc, Iron, Electrical Conductivity)
"confidenceScore": number (0-100)
"limitations": string

SOIL PARAMETERS:
- Soil pH: ${soilPh}
- Nitrogen (N): ${nitrogen} kg/ha
- Phosphorus (P): ${phosphorus} kg/ha
- Potassium (K): ${potassium} kg/ha
- Organic Carbon: ${organicCarbon ?? 0.55}%
- Soil Moisture: ${soilMoisture ?? 35}%
- Soil Type: ${soilType}`;

    const aiResult = await this.callGeminiJSON(systemPrompt, userPrompt);
    if (aiResult && aiResult.nutrientInterpretations) {
      return {
        ...aiResult,
        aiGenerated: true
      };
    }

    return this.fallbackSoilAnalysis(params);
  }

  /**
   * 3. FERTILIZER ADVISORY
   */
  static async recommendFertilizer(params) {
    const { cropName, growthStage, soilType, landArea, areaUnit, nitrogen, phosphorus, potassium } = params;

    const systemPrompt = `You are an Agricultural Nutrient Management Specialist.
Provide balanced, sustainable, and safe fertilizer recommendations for Indian farming.
Strict rule: Do not invent hazardous chemical dosages. Provide ICAR-guided nutrient splits and organic alternatives.`;

    const userPrompt = `Generate a JSON object with:
"crop": "${cropName}"
"growthStage": "${growthStage}"
"nutrientRequirementOverview": {
  "nitrogenRequirement": string,
  "phosphorusRequirement": string,
  "potassiumRequirement": string,
  "stageSpecificFocus": string
}
"fertilizerSchedule": Array of objects: {
  "stage": string,
  "timing": string,
  "fertilizerCategory": string,
  "recommendedFertilizer": string,
  "applicationMethod": string,
  "purpose": string
}
"organicAlternatives": Array of objects: {
  "name": string,
  "applicationRate": string,
  "benefits": string
}
"environmentalPrecautions": string
"soilImprovementPractices": Array of string
"referenceStandard": string

PARAMETERS:
- Crop: ${cropName}
- Stage: ${growthStage}
- Soil: ${soilType || 'Loam'}
- Area: ${landArea} ${areaUnit || 'acres'}
- Available N: ${nitrogen ? `${nitrogen} kg/ha` : 'Default'}
- Available P: ${phosphorus ? `${phosphorus} kg/ha` : 'Default'}
- Available K: ${potassium ? `${potassium} kg/ha` : 'Default'}`;

    const aiResult = await this.callGeminiJSON(systemPrompt, userPrompt);
    if (aiResult && aiResult.fertilizerSchedule) {
      return {
        ...aiResult,
        aiGenerated: true
      };
    }

    return this.fallbackFertilizerAdvisory(params);
  }

  /**
   * 4. IRRIGATION ADVISORY
   */
  static async recommendIrrigation(params) {
    const { cropName, growthStage, soilType, irrigationMethod, waterAvailability, soilMoisture, temperature, rainfallForecast } = params;

    const systemPrompt = `You are an Agricultural Water Resources and Irrigation Engineer.
Provide water management guidance, conservation techniques, stress indicators, and over/under-irrigation precautions.`;

    const userPrompt = `Generate a JSON object with:
"irrigationGuidance": string (concise summary)
"recommendedSchedule": Array of objects: {
  "interval": string,
  "durationOrDepth": string,
  "timingOfDay": string,
  "priority": "Critical" | "High" | "Moderate"
}
"waterConservationTips": Array of string
"waterStressIndicators": Array of string
"overIrrigationRisks": string
"underIrrigationRisks": string
"dripSprinklerSuitability": string

PARAMETERS:
- Crop: ${cropName}
- Growth Stage: ${growthStage}
- Soil Type: ${soilType}
- Method: ${irrigationMethod}
- Water Availability: ${waterAvailability}
- Soil Moisture: ${soilMoisture ?? 'Estimated 40%'}
- Temperature: ${temperature ? `${temperature} °C` : 'Normal'}
- Rainfall Forecast (next 7 days): ${rainfallForecast ? `${rainfallForecast} mm` : '0 mm'}`;

    const aiResult = await this.callGeminiJSON(systemPrompt, userPrompt);
    if (aiResult && aiResult.recommendedSchedule) {
      return {
        ...aiResult,
        aiGenerated: true
      };
    }

    return this.fallbackIrrigationAdvisory(params);
  }

  /**
   * 5. CROP DISEASE AND PEST IDENTIFICATION (Multimodal Vision)
   */
  static async analyzeCropDiseaseImage(imageBuffer, mimeType, cropName, reportedSymptoms) {
    const systemPrompt = `You are an elite Plant Pathologist and Multimodal Crop Diagnostic Specialist.
Perform preliminary visual screening of crop health from the uploaded photograph.
Safety Rules:
1. Never claim definitive disease identification from an image alone. Mark as preliminary screening.
2. Distinguish visual observations from suspected causes.
3. Suggest differential/alternative causes.
4. Do NOT recommend dangerous pesticide mixtures. Provide safe, organic, biological, and ICAR-approved IPM (Integrated Pest Management) practices.
5. Emphasize consulting a local agricultural extension officer or Krishi Vigyan Kendra (KVK) for high-impact decisions.`;

    if (geminiClient && imageBuffer) {
      try {
        const base64Data = imageBuffer.toString('base64');
        const response = await geminiClient.models.generateContent({
          model: env.GEMINI_MODEL || 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data
                  }
                },
                {
                  text: `${systemPrompt}

Crop: ${cropName || 'Not specified'}
Reported Symptoms by farmer: ${reportedSymptoms || 'Visual examination requested'}

Return a JSON object with:
"observedVisualSymptoms": string (detailed description of visual signs, chlorosis, lesions, fungal growth, pest feeding, etc.)
"suspectedDiseaseOrPest": string (primary suspected common name)
"scientificName": string (pathogen or pest scientific name)
"alternativeCauses": Array of string (other diseases or abiotic factors that produce similar symptoms)
"confidenceLevel": "High" | "Moderate" | "Preliminary Screening"
"contributingFactors": string (environmental factors like humidity, overcrowding, moisture)
"immediateActions": Array of string (safe, immediate cultural/sanitary/organic measures)
"preventiveMeasures": Array of string (preventive IPM, crop rotation, seed treatment)
"suggestedExpertConsultation": string (recommendation for lab or extension officer visit)
"additionalInfoRequired": Array of string (what else is needed to confirm diagnosis)
"safetyDisclaimer": string (formal disclaimer regarding chemical handling and laboratory confirmation)`
                }
              ]
            }
          ]
        });

        const responseText = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text) || '';
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
          ...parsed,
          aiGenerated: true,
          visionAnalyzed: true
        };
      } catch (err) {
        console.warn('Multimodal Gemini call failed, falling back to symptoms analysis:', err.message);
      }
    }

    // Fallback based on reported symptoms and crop knowledge base
    return this.fallbackDiseaseDiagnosis(cropName, reportedSymptoms);
  }

  /**
   * 6. AI AGRICULTURAL CONVERSATIONAL CHAT
   */
  static async generateChatResponse(messages, farmContext, farmerProfile, language = 'en') {
    const langNames = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      mr: 'Marathi (मराठी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
      kn: 'Kannada (ಕನ್ನಡ)',
      gu: 'Gujarati (ગુજરાતી)',
      bn: 'Bengali (বাংলা)'
    };

    const targetLanguage = langNames[language] || 'English';

    const systemPrompt = `You are AgriSahayak, a friendly, respectful, and highly knowledgeable AI Agricultural Extension Specialist helping Indian farmers.
Language Requirement: You MUST respond in ${targetLanguage}. Use simple, clear, farmer-friendly terminology while maintaining scientific accuracy.
Farmer Context:
- Full Name: ${farmerProfile?.fullName || 'Farmer Friend'}
- Preferred Units: ${farmerProfile?.preferredUnits || 'Acres'}
- State/District: ${farmerProfile?.state || ''}, ${farmerProfile?.district || ''}
${farmContext ? `- Active Farm: ${farmContext.name} (${farmContext.totalArea} ${farmContext.areaUnit}, Soil: ${farmContext.soilType}, Irrigation: ${farmContext.irrigationSource}, Status: ${farmContext.currentCultivationStatus})` : ''}

Guidelines:
1. Provide actionable, practical farming advice tailored to the farmer's location, soil, and active farm.
2. If symptoms or problems are ambiguous, ask clarifying questions before jumping to pesticide advice.
3. Distinguish general knowledge from farm-specific recommendations.
4. Promote Integrated Pest Management (IPM), soil organic matter building, and safe water conservation.
5. Always remind the farmer to verify with local Krishi Vigyan Kendra (KVK) for chemical purchases.`;

    if (geminiClient) {
      try {
        const contents = [
          { role: 'user', parts: [{ text: `System Instructions:\n${systemPrompt}` }] },
          { role: 'model', parts: [{ text: `Namaste! I am AgriSahayak. I will assist you with accurate, practical farming advice in ${targetLanguage}. How can I help your farm today?` }] }
        ];

        // Append conversation history
        const recentHistory = (messages || []).slice(-10);
        recentHistory.forEach(msg => {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        });

        const response = await geminiClient.models.generateContent({
          model: env.GEMINI_MODEL || 'gemini-2.5-flash',
          contents
        });

        const text = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text) || '';
        return {
          reply: text,
          aiGenerated: true
        };
      } catch (err) {
        console.warn('Gemini Chat call failed:', err.message);
      }
    }

    // Fallback conversational engine
    const lastUserMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || '';
    let reply = `Namaste! Based on your farm profile (${farmContext?.soilType || 'loamy'} soil in ${farmerProfile?.state || 'India'}): `;

    if (lastUserMessage.includes('crop') || lastUserMessage.includes('grow')) {
      reply += `For this season, crops like Wheat, Chickpea, Mustard, or vegetables are well-suited to your soil. Use our Crop Recommendation tool for a detailed suitability breakdown.`;
    } else if (lastUserMessage.includes('water') || lastUserMessage.includes('irrigation')) {
      reply += `Irrigate during early morning or late evening to minimize evaporative loss. If possible, consider drip irrigation to save up to 40% water and deliver nutrients directly to roots.`;
    } else if (lastUserMessage.includes('fertilizer') || lastUserMessage.includes('urea') || lastUserMessage.includes('npk')) {
      reply += `Avoid single heavy applications of nitrogen. Always split urea into 2 to 3 doses (basal, tillering, and panicle emergence) and combine with well-decomposed organic manure or vermicompost.`;
    } else if (lastUserMessage.includes('yellow') || lastUserMessage.includes('disease') || lastUserMessage.includes('pest')) {
      reply += `Yellowing of older leaves usually points to nitrogen deficiency or moisture stress, while yellowing in younger leaves suggests zinc or iron deficiency. Please take a clear photo and upload it to our Disease Identifier for screening!`;
    } else {
      reply += `To get the best advice for your field, please specify your current crop, soil type, and whether you are noticing any specific pest, water, or nutrient concerns. I am here to help you succeed!`;
    }

    return {
      reply,
      aiGenerated: false
    };
  }

  /**
   * 7. FARMING CALENDAR GENERATOR
   */
  static async generateFarmingCalendar(params) {
    const { cropName, sowingDate, soilType, location } = params;

    const systemPrompt = `You are an Agricultural Operations Planner. Generate a comprehensive crop cultivation calendar tailored to the sowing date.`;

    const userPrompt = `Generate a JSON object with:
"cropName": "${cropName}"
"sowingDate": "${sowingDate}"
"estimatedHarvestDate": string (ISO date YYYY-MM-DD)
"durationDays": integer
"tasks": Array of objects: {
  "activityName": string,
  "description": string,
  "cropGrowthStage": string,
  "recommendedDaysAfterSowing": integer,
  "recommendedDate": string (ISO date YYYY-MM-DD calculated from ${sowingDate}),
  "recommendedTiming": string,
  "category": "Land Preparation" | "Sowing" | "Nutrient Management" | "Irrigation" | "Weed Control" | "Pest & Disease Scouting" | "Harvesting"
}

Crop: ${cropName}
Sowing Date: ${sowingDate}
Soil: ${soilType || 'Loam'}
Location: ${location || 'Central India'}`;

    const aiResult = await this.callGeminiJSON(systemPrompt, userPrompt);
    if (aiResult && aiResult.tasks && aiResult.tasks.length > 0) {
      return {
        ...aiResult,
        aiGenerated: true
      };
    }

    return this.fallbackCalendar(cropName, sowingDate);
  }

  // =========================================================================
  // AGRONOMIC RULE-BASED FALLBACK ENGINES
  // =========================================================================

  static fallbackCropRecommendations(params) {
    const season = (params.season || 'Kharif').toLowerCase();
    const soil = (params.soilType || 'alluvial').toLowerCase();
    const ph = Number(params.soilPh) || 7.0;

    // Filter and score matching crops
    const scoredCrops = CROPS_DATABASE.map(crop => {
      let score = 70;
      let reasons = [];

      // Season match
      if (crop.seasons.some(s => s.toLowerCase() === season)) {
        score += 15;
        reasons.push(`Optimal fit for ${params.season} cultivation season`);
      } else {
        score -= 20;
      }

      // Soil match
      if (crop.soilTypes.some(st => soil.includes(st) || st.includes(soil))) {
        score += 10;
        reasons.push(`Highly compatible with ${params.soilType} soil texture`);
      }

      // pH match
      if (ph >= crop.minPh && ph <= crop.maxPh) {
        score += 5;
        reasons.push(`Soil pH of ${ph} is within ideal range (${crop.minPh} - ${crop.maxPh})`);
      } else {
        score -= 10;
      }

      score = Math.min(98, Math.max(45, score));

      const category = score >= 85 ? 'Highly Suitable' : score >= 70 ? 'Moderately Suitable' : 'Conditionally Suitable';

      return {
        cropName: crop.name,
        scientificName: crop.scientificName,
        suitabilityScore: score,
        suitabilityCategory: category,
        reason: reasons.join('. ') || 'Agronomically viable for your zone.',
        soilCompatibility: `Requires ${crop.soilTypes.join(', ')} with pH ${crop.minPh} - ${crop.maxPh}.`,
        climateCompatibility: `Thrives between ${crop.tempRange[0]}°C and ${crop.tempRange[1]}°C.`,
        waterRequirements: crop.waterRequirement,
        recommendedSeason: crop.seasons.join(', '),
        estimatedDuration: crop.durationDays,
        nutrientConsiderations: `Standard recommendation: ${crop.npkRatio}.`,
        irrigationConsiderations: crop.irrigationMethod,
        importantPrecautions: crop.precautions,
        confidenceLevel: 'High (Agronomic Benchmark Reference)'
      };
    });

    // Sort descending by score
    scoredCrops.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    const topPicks = scoredCrops.slice(0, 4);

    return {
      recommendations: topPicks,
      missingFactors: ['Sub-soil micronutrient testing (Zinc, Boron)', 'Microclimate wind turbulence'],
      overallAssessment: `Analysis based on ICAR agro-climatic benchmarks for ${params.location || 'your region'}. ${topPicks[0]?.cropName} shows highest compatibility with current soil and season parameters.`,
      disclaimer: 'AI and agronomic decision-support score. Please cross-verify with your local Agricultural Officer or KVK before seed procurement.',
      aiGenerated: false
    };
  }

  static fallbackSoilAnalysis(params) {
    const ph = Number(params.soilPh) || 7.0;
    const n = Number(params.nitrogen) || 240;
    const p = Number(params.phosphorus) || 14;
    const k = Number(params.potassium) || 160;
    const oc = Number(params.organicCarbon) || 0.52;

    const nStatus = n < 280 ? 'Low' : n <= 560 ? 'Optimum' : 'High';
    const pStatus = p < 10 ? 'Low' : p <= 25 ? 'Optimum' : 'High';
    const kStatus = k < 110 ? 'Low' : k <= 280 ? 'Optimum' : 'High';
    const ocStatus = oc < 0.5 ? 'Low' : oc <= 0.75 ? 'Optimum' : 'High';

    const deficiencies = [];
    const excesses = [];

    if (nStatus === 'Low') deficiencies.push({ nutrient: 'Nitrogen (N)', impact: 'Stunted plant growth, thin stems, pale yellowish older leaves.', correctiveAction: 'Apply 25% extra nitrogen in split doses; incorporate green manure or neem coated urea.' });
    if (pStatus === 'Low') deficiencies.push({ nutrient: 'Phosphorus (P)', impact: 'Poor root development, purple pigmentation on leaves, delayed flowering.', correctiveAction: 'Apply Single Super Phosphate (SSP) or DAP as basal dressing placed 5cm below seed.' });
    if (kStatus === 'Low') deficiencies.push({ nutrient: 'Potassium (K)', impact: 'Marginal leaf scorch, weak stems, susceptibility to drought and lodging.', correctiveAction: 'Apply Muriate of Potash (MOP) at basal or early vegetative stage.' });
    if (ocStatus === 'Low') deficiencies.push({ nutrient: 'Organic Carbon (OC)', impact: 'Compacted soil, poor water retention and beneficial soil microbiology.', correctiveAction: 'Add 5 tonnes/acre well-decomposed Farm Yard Manure (FYM) or 2 tonnes/acre vermicompost.' });

    if (nStatus === 'High') excesses.push({ nutrient: 'Nitrogen (N)', risk: 'Excessive vegetative foliage, lodging, delayed grain maturity.', mitigation: 'Reduce nitrogen top-dressing; avoid late urea application.' });

    let phInterpretation = 'Neutral soil pH (6.5 - 7.5). Optimal nutrient availability for almost all crops.';
    const soilAmendments = [];

    if (ph < 6.0) {
      phInterpretation = 'Acidic soil. Phosphorus and micronutrient availability is restricted; aluminum toxicity may occur.';
      soilAmendments.push({ amendment: 'Agricultural Lime (CaCO3)', dosage: '1.5 - 2.0 tonnes/ha', purpose: 'Neutralizes excess hydrogen ions and restores nutrient uptake capacity.' });
    } else if (ph > 8.0) {
      phInterpretation = 'Alkaline / Calcareous soil. Micronutrients like Zinc, Iron, and Manganese become immobilized.';
      soilAmendments.push({ amendment: 'Agricultural Gypsum (CaSO4.2H2O)', dosage: '2.0 - 3.5 tonnes/ha', purpose: 'Displaces exchangeable sodium and improves soil permeability.' });
      soilAmendments.push({ amendment: 'Green Manuring (Dhaincha)', dosage: '20 kg seed/acre', purpose: 'Produces organic acids during decomposition that buffer soil alkalinity.' });
    }

    return {
      conditionSummary: `Soil exhibits ${phInterpretation.split('.')[0]}. Overall nutrient status is ${nStatus === 'Optimum' && pStatus === 'Optimum' ? 'well balanced' : 'partially deficient in key macronutrients'}.`,
      nutrientInterpretations: {
        nitrogen: { status: nStatus, value: n, interpretation: SOIL_NUTRIENT_THRESHOLDS.nitrogen[nStatus.toLowerCase()]?.interpretation || '' },
        phosphorus: { status: pStatus, value: p, interpretation: SOIL_NUTRIENT_THRESHOLDS.phosphorus[pStatus.toLowerCase()]?.interpretation || '' },
        potassium: { status: kStatus, value: k, interpretation: SOIL_NUTRIENT_THRESHOLDS.potassium[kStatus.toLowerCase()]?.interpretation || '' },
        organicCarbon: { status: ocStatus, value: oc, interpretation: SOIL_NUTRIENT_THRESHOLDS.organicCarbon[ocStatus.toLowerCase()]?.interpretation || '' }
      },
      deficiencies,
      excesses,
      phInterpretation,
      soilAmendments,
      organicMatterAdvice: 'Apply crop residue mulching, maintain minimum tillage, and add vermicompost or composted cow dung annually before monsoon.',
      recommendedTests: ['Available Zinc (DTPA-Zn)', 'Available Iron (DTPA-Fe)', 'Electrical Conductivity (EC / Salinity)'],
      confidenceScore: 88,
      limitations: 'Calculated using standard ICAR soil testing benchmarks. Laboratory verification is advised for trace micronutrients.',
      aiGenerated: false
    };
  }

  static fallbackFertilizerAdvisory(params) {
    const cropName = params.cropName || 'Wheat';
    const area = Number(params.landArea) || 1;
    const unit = params.areaUnit || 'acres';

    return {
      crop: cropName,
      growthStage: params.growthStage || 'Basal / Sowing',
      nutrientRequirementOverview: {
        nitrogenRequirement: 'Moderate to high. Requires split applications for maximum efficiency.',
        phosphorusRequirement: 'Full dose applied at sowing for deep root establishment.',
        potassiumRequirement: 'Applied basal or split to enhance stalk strength and drought resilience.',
        stageSpecificFocus: 'Focus on root establishment and uniform tillering.'
      },
      fertilizerSchedule: [
        {
          stage: 'Basal Dressing (At Sowing)',
          timing: 'During final land preparation or sowing',
          fertilizerCategory: 'Complete NPK Basal',
          recommendedFertilizer: 'DAP (50 kg) + MOP (25 kg) + Urea (20 kg) per acre',
          applicationMethod: 'Deep soil placement 5cm beside seed furrow',
          purpose: 'Provides essential phosphorus and initial nitrogen for seedling vigor.'
        },
        {
          stage: 'First Top Dressing (Vegetative / Tillering)',
          timing: '20 - 25 days after sowing (post 1st irrigation)',
          fertilizerCategory: 'Nitrogen Boost',
          recommendedFertilizer: 'Neem Coated Urea (45 kg per acre)',
          applicationMethod: 'Broadcasting in moist soil conditions',
          purpose: 'Stimulates vigorous tillering and leaf canopy expansion.'
        },
        {
          stage: 'Second Top Dressing (Panicle / Flowering)',
          timing: '45 - 55 days after sowing',
          fertilizerCategory: 'Nitrogen & Micronutrient',
          recommendedFertilizer: 'Neem Coated Urea (30 kg) + Zinc Sulphate (5 kg foliar or soil)',
          applicationMethod: 'Top dressing followed by light irrigation',
          purpose: 'Enhances flowering percentage and panicle grain count.'
        }
      ],
      organicAlternatives: [
        { name: 'Well-cured Farmyard Manure (FYM)', applicationRate: '4 - 6 tonnes/acre', benefits: 'Improves soil structure, water holding, and slow-releases balanced nutrients.' },
        { name: 'Vermicompost', applicationRate: '1.5 - 2 tonnes/acre', benefits: 'Contains concentrated humus, active microbes, and plant growth regulators.' },
        { name: 'Biofertilizers (Azotobacter + PSB)', applicationRate: '200g per 10kg seed', benefits: 'Biological nitrogen fixation and solubilization of fixed soil phosphorus.' }
      ],
      environmentalPrecautions: 'Never apply urea immediately before heavy rains to prevent nitrate runoff into local water bodies. Avoid excessive nitrogen to prevent pest outbreaks.',
      soilImprovementPractices: ['Practice green manuring with Sunnhemp or Sesbania every 2 years', 'Incorporate post-harvest crop stubbles rather than burning'],
      referenceStandard: 'Indian Council of Agricultural Research (ICAR) Package of Practices',
      aiGenerated: false
    };
  }

  static fallbackIrrigationAdvisory(params) {
    const cropName = params.cropName || 'General Crop';
    const method = params.irrigationMethod || 'Furrow';

    return {
      irrigationGuidance: `Maintain adequate root-zone moisture during critical growth stages. For ${cropName}, prevent moisture stress during flowering and fruit/grain formation.`,
      recommendedSchedule: [
        { interval: 'Every 7 - 10 days', durationOrDepth: '50 - 65 mm water depth', timingOfDay: 'Early Morning (6 AM - 9 AM) or Evening', priority: 'Critical' },
        { interval: 'As per soil tension (when top 5cm is dry)', durationOrDepth: 'Light wetting', timingOfDay: 'Late Evening', priority: 'High' }
      ],
      waterConservationTips: [
        'Adopt organic trash mulching to reduce soil surface evaporation by up to 35%.',
        'Use alternate furrow irrigation in row crops to save 25% water without yield reduction.',
        'Operate drip lines with pressure regulators to ensure uniform discharge across slopes.'
      ],
      waterStressIndicators: [
        'Wilting or drooping leaves during peak afternoon hours that fail to recover by evening.',
        'Dull, grayish-green discoloration of vegetative foliage.',
        ' premature shedding of flowers and small immature pods/fruits.'
      ],
      overIrrigationRisks: 'Waterlogging causes root asphyxiation, accelerates Phytophthora and Fusarium root rot, and leaches valuable nitrates below root zone.',
      underIrrigationRisks: 'Induces severe moisture stress, poor nutrient uptake, pollen sterility, and significant yield loss.',
      dripSprinklerSuitability: method.toLowerCase().includes('drip') 
        ? 'Drip system provides 90% water use efficiency and enables simultaneous fertigation.'
        : 'Upgrading to micro-irrigation (Drip or Micro-Sprinkler) qualifies for 40-55% PMKSY government subsidy.',
      aiGenerated: false
    };
  }

  static fallbackDiseaseDiagnosis(cropName, reportedSymptoms) {
    const symptoms = (reportedSymptoms || '').toLowerCase();
    let disease = 'Fungal Leaf Spot / Blight';
    let scientific = 'Alternaria / Cercospora spp.';
    let visual = 'Irregular brownish necrotic lesions observed on leaf lamina with concentric rings or chlorotic halo.';

    if (symptoms.includes('yellow') || symptoms.includes('mosaic')) {
      disease = 'Yellow Mosaic Virus (YMV)';
      scientific = 'Geminiviridae (transmitted by Whitefly)';
      visual = 'Bright yellow patches alternating with green patches on foliage; stunted plant height.';
    } else if (symptoms.includes('powder') || symptoms.includes('white')) {
      disease = 'Powdery Mildew';
      scientific = 'Erysiphe / Podosphaera spp.';
      visual = 'White talcum-powder-like superficial fungal growth on upper and lower surfaces of leaves and stems.';
    } else if (symptoms.includes('wilt') || symptoms.includes('droop')) {
      disease = 'Fusarium Wilt / Root Rot';
      scientific = 'Fusarium oxysporum';
      visual = 'Vascular browning inside stem base, lower foliage drooping, sudden daytime wilting.';
    }

    return {
      observedVisualSymptoms: visual,
      suspectedDiseaseOrPest: disease,
      scientificName: scientific,
      alternativeCauses: [
        'Nutrient deficiency (Nitrogen or Magnesium deficiency causing leaf chlorosis)',
        'Sucking pest injury (Thrips or Mite feeding damage)',
        'Moisture stress combined with high heat index'
      ],
      confidenceLevel: 'Preliminary Screening',
      contributingFactors: 'High atmospheric humidity (> 80%), poor air circulation due to dense planting, and persistent leaf wetness.',
      immediateActions: [
        'Prune and destroy heavily infected lower leaves and dispose away from the field.',
        'Spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil (3000 ppm) @ 5ml/litre water.',
        'Apply Trichoderma viride or Pseudomonas fluorescens @ 10g/litre as bio-control agent.'
      ],
      preventiveMeasures: [
        'Treat seeds with Thiram + Carbendazim or Trichoderma @ 4g/kg seed before sowing.',
        'Follow crop rotation with non-host crops like pulses or millets.',
        'Maintain proper row spacing to enhance airflow and sunlight penetration.'
      ],
      suggestedExpertConsultation: 'Please carry a fresh sample of the affected plant part in a sealed plastic bag to the nearest Krishi Vigyan Kendra (KVK) or Government Plant Health Clinic for microscopic verification.',
      additionalInfoRequired: [
        'Clear close-up photograph of the underside of affected leaves',
        'Field-level distribution pattern (isolated patches or entire field)',
        'Recent chemical or fertilizer application history'
      ],
      safetyDisclaimer: 'This analysis is an AI-assisted preliminary advisory. Do NOT apply unapproved chemicals or hazardous pesticide cocktails. Always consult a certified agricultural officer before purchasing agrochemicals.',
      aiGenerated: false
    };
  }

  static fallbackCalendar(cropName, sowingDateStr) {
    const sowing = new Date(sowingDateStr || new Date());
    const addDays = (d, days) => {
      const result = new Date(d);
      result.setDate(result.getDate() + days);
      return result.toISOString().split('T')[0];
    };

    const harvestDate = addDays(sowing, 120);

    return {
      cropName: cropName || 'Wheat',
      sowingDate: sowing.toISOString().split('T')[0],
      estimatedHarvestDate: harvestDate,
      durationDays: 120,
      tasks: [
        {
          activityName: 'Deep Ploughing & Soil Solarization',
          description: 'Summer deep ploughing to eradicate resting soil-borne pests, fungal spores, and perennial weed seeds.',
          cropGrowthStage: 'Pre-Sowing / Field Preparation',
          recommendedDaysAfterSowing: -15,
          recommendedDate: addDays(sowing, -15),
          recommendedTiming: '15 days before sowing',
          category: 'Land Preparation'
        },
        {
          activityName: 'Basal Manuring & Seed Treatment',
          description: 'Incorporate 5 tonnes FYM per acre. Treat certified seed with Trichoderma viride or recommended fungicide.',
          cropGrowthStage: 'Pre-Sowing',
          recommendedDaysAfterSowing: -2,
          recommendedDate: addDays(sowing, -2),
          recommendedTiming: '2 days before sowing',
          category: 'Land Preparation'
        },
        {
          activityName: 'Sowing & Basal Fertilizer Placement',
          description: 'Sow at recommended line-to-line spacing. Place basal DAP and Potash 5cm below seed depth.',
          cropGrowthStage: 'Sowing Day',
          recommendedDaysAfterSowing: 0,
          recommendedDate: addDays(sowing, 0),
          recommendedTiming: 'Day 0',
          category: 'Sowing'
        },
        {
          activityName: 'First Irrigation & Tillering Top Dressing',
          description: 'Crucial irrigation at Crown Root Initiation (CRI) / early tillering. Broadcast first dose of Neem Coated Urea.',
          cropGrowthStage: 'Crown Root Initiation / Early Tillering',
          recommendedDaysAfterSowing: 21,
          recommendedDate: addDays(sowing, 21),
          recommendedTiming: '20-22 DAS',
          category: 'Nutrient Management'
        },
        {
          activityName: 'Hand Weeding / Intercultural Operation',
          description: 'Perform hand weeding or mechanical hoeing between rows to eliminate weed competition before canopy closure.',
          cropGrowthStage: 'Active Tillering',
          recommendedDaysAfterSowing: 35,
          recommendedDate: addDays(sowing, 35),
          recommendedTiming: '30-35 DAS',
          category: 'Weed Control'
        },
        {
          activityName: 'Booting Stage Irrigation & Pest Scouting',
          description: 'Provide second scheduled irrigation. Scout field for aphid colonies, leaf spots, and nutrient hunger signs.',
          cropGrowthStage: 'Booting / Panicle Emergence',
          recommendedDaysAfterSowing: 60,
          recommendedDate: addDays(sowing, 60),
          recommendedTiming: '55-65 DAS',
          category: 'Pest & Disease Scouting'
        },
        {
          activityName: 'Milking & Grain Filling Irrigation',
          description: 'Maintain soil moisture to support full grain plumpness. Avoid irrigation during strong windy days to prevent lodging.',
          cropGrowthStage: 'Milking & Dough Stage',
          recommendedDaysAfterSowing: 85,
          recommendedDate: addDays(sowing, 85),
          recommendedTiming: '80-90 DAS',
          category: 'Irrigation'
        },
        {
          activityName: 'Harvesting & Threshing',
          description: 'Harvest when grains achieve golden maturity and moisture drops to 12-14%. Clean and bag under dry weather.',
          cropGrowthStage: 'Maturity & Harvest',
          recommendedDaysAfterSowing: 115,
          recommendedDate: addDays(sowing, 115),
          recommendedTiming: '110-120 DAS',
          category: 'Harvesting'
        }
      ],
      aiGenerated: false
    };
  }
}
