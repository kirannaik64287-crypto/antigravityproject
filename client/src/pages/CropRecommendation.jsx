import React, { useState } from 'react';
import axios from 'axios';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  Sprout, 
  Sparkles, 
  CloudSun, 
  Droplets, 
  MapPin, 
  CheckCircle2, 
  Info, 
  Calendar, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  SlidersHorizontal 
} from 'lucide-react';

export const CropRecommendation = () => {
  const { selectedFarm } = useFarm();
  const { t } = useLanguage();

  // Form State
  const [formData, setFormData] = useState({
    soilType: selectedFarm?.soilType || 'alluvial',
    soilPh: 6.8,
    nitrogen: 240,
    phosphorus: 15,
    potassium: 160,
    organicCarbon: 0.55,
    soilMoisture: 40,
    location: selectedFarm ? `${selectedFarm.district}, ${selectedFarm.state}` : 'Maharashtra, Nagpur',
    season: 'Kharif',
    temperature: 28,
    rainfall: 120,
    irrigationStatus: 'irrigated',
    waterAvailability: selectedFarm?.waterAvailability || 'sufficient',
    landArea: selectedFarm?.totalArea || 2.5,
    areaUnit: selectedFarm?.areaUnit || 'acres',
    previousCrop: '',
    farmingPreferences: 'High yield and stable market demand',
    expectedDuration: 'Standard (90-130 days)',
    farmId: selectedFarm?.id || null
  });

  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Pre-fill from active farm
  const handleFillFromFarm = () => {
    if (!selectedFarm) return;
    setFormData(prev => ({
      ...prev,
      soilType: selectedFarm.soilType || prev.soilType,
      waterAvailability: selectedFarm.waterAvailability || prev.waterAvailability,
      landArea: selectedFarm.totalArea || prev.landArea,
      areaUnit: selectedFarm.areaUnit || prev.areaUnit,
      location: `${selectedFarm.district}, ${selectedFarm.state}`,
      farmId: selectedFarm.id
    }));
  };

  // Fetch live weather to auto-populate temperature & rainfall
  const handleFetchLiveWeather = async () => {
    try {
      setWeatherLoading(true);
      const params = {};
      if (selectedFarm?.latitude && selectedFarm?.longitude) {
        params.lat = selectedFarm.latitude;
        params.lon = selectedFarm.longitude;
      } else {
        params.location = formData.location || 'Nagpur';
      }
      const res = await axios.get('/api/weather', { params });
      if (res.data?.success) {
        const w = res.data.data;
        setFormData(prev => ({
          ...prev,
          temperature: w.current?.temperature || prev.temperature,
          rainfall: w.forecast?.[0]?.precipitationSum ? Math.round(w.forecast[0].precipitationSum * 10) : prev.rainfall
        }));
      }
    } catch (err) {
      console.warn('Weather auto-fill notice:', err.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/crop-recommendation', formData);
      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.error || 'Failed to generate recommendations');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-stone-700 bg-stone-50 border-stone-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase">
              Core Advisory
            </span>
            <span className="text-xs text-stone-400">• Feature 4.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Sprout className="w-8 h-8 text-emerald-600" />
            <span>AI-Powered Crop Recommendation</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Evaluate soil chemistry, climate, and water availability with Gemini AI to discover ranked, suitable crops.
          </p>
        </div>

        {selectedFarm && (
          <button
            type="button"
            onClick={handleFillFromFarm}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition shadow-xs"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Fill from Active Farm ({selectedFarm.name})</span>
          </button>
        )}
      </div>

      <SafetyDisclaimer />

      {/* Main Form & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs h-fit">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-stone-100">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Cultivation Parameters</span>
            </h2>
            <button
              type="button"
              onClick={handleFetchLiveWeather}
              disabled={weatherLoading}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>{weatherLoading ? 'Fetching...' : 'Auto Live Weather'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Soil Type & Season */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Soil Type *</label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  <option value="alluvial">Alluvial Soil</option>
                  <option value="black">Black / Regur Soil</option>
                  <option value="red">Red & Yellow Soil</option>
                  <option value="laterite">Laterite Soil</option>
                  <option value="sandy_loam">Sandy Loam</option>
                  <option value="clay_loam">Clay Loam</option>
                  <option value="loamy">Loamy Soil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Season *</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  <option value="Kharif">Kharif (Monsoon / June-Oct)</option>
                  <option value="Rabi">Rabi (Winter / Nov-April)</option>
                  <option value="Zaid">Zaid (Summer / March-June)</option>
                  <option value="Annual">Annual / Perennial</option>
                </select>
              </div>
            </div>

            {/* Soil pH Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-bold text-stone-700">Soil pH: {formData.soilPh}</label>
                <span className={`font-semibold ${formData.soilPh < 6 ? 'text-amber-600' : formData.soilPh > 8 ? 'text-purple-600' : 'text-emerald-600'}`}>
                  {formData.soilPh < 6 ? 'Acidic' : formData.soilPh > 8 ? 'Alkaline' : 'Neutral (Optimal)'}
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="9.5"
                step="0.1"
                value={formData.soilPh}
                onChange={(e) => setFormData({ ...formData, soilPh: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5 font-medium">
                <span>4.5 (Acid)</span>
                <span>6.5 - 7.5 (Neutral)</span>
                <span>9.5 (Alkali)</span>
              </div>
            </div>

            {/* Macronutrients N - P - K */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2">
              <span className="text-xs font-bold text-stone-700 block">Soil Nutrients (kg/ha)</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-500 mb-0.5">Nitrogen (N)</label>
                  <input
                    type="number"
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white font-semibold"
                    placeholder="e.g. 240"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-0.5">Phosphorus (P)</label>
                  <input
                    type="number"
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white font-semibold"
                    placeholder="e.g. 15"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-0.5">Potassium (K)</label>
                  <input
                    type="number"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white font-semibold"
                    placeholder="e.g. 180"
                  />
                </div>
              </div>
            </div>

            {/* Land Area & Location */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  placeholder="District, State"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Land Area *</label>
                <div className="flex">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.landArea}
                    onChange={(e) => setFormData({ ...formData, landArea: parseFloat(e.target.value) || 1 })}
                    className="w-full text-xs sm:text-sm rounded-l-xl border border-stone-300 px-2.5 py-2 bg-white font-semibold"
                    required
                  />
                  <span className="bg-stone-100 border border-l-0 border-stone-300 px-2 py-2 text-xs rounded-r-xl text-stone-600 font-medium">
                    {formData.areaUnit}
                  </span>
                </div>
              </div>
            </div>

            {/* Water & Irrigation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Irrigation Source</label>
                <select
                  value={formData.irrigationStatus}
                  onChange={(e) => setFormData({ ...formData, irrigationStatus: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                >
                  <option value="irrigated">Assured Irrigation (Borewell / Canal)</option>
                  <option value="partially_irrigated">Partially Irrigated</option>
                  <option value="rainfed">Rainfed / Dryland</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Water Availability</label>
                <select
                  value={formData.waterAvailability}
                  onChange={(e) => setFormData({ ...formData, waterAvailability: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                >
                  <option value="abundant">Abundant</option>
                  <option value="sufficient">Sufficient</option>
                  <option value="moderate">Moderate</option>
                  <option value="scarce">Scarce</option>
                </select>
              </div>
            </div>

            {/* Previous Crop & Preference */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Previous Crop</label>
                <input
                  type="text"
                  value={formData.previousCrop}
                  onChange={(e) => setFormData({ ...formData, previousCrop: e.target.value })}
                  placeholder="e.g. Wheat / Fallow"
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Preferences</label>
                <input
                  type="text"
                  value={formData.farmingPreferences}
                  onChange={(e) => setFormData({ ...formData, farmingPreferences: e.target.value })}
                  placeholder="e.g. Low water, organic"
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating with Gemini AI...' : 'Generate Ranked Recommendations'}</span>
            </button>
          </form>
        </div>

        {/* Recommendations Output Column */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs text-center space-y-4 animate-pulse">
              <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600 animate-spin">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">Analyzing Soil & Climatic Compatibility...</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Running multi-factor agronomic evaluation with Google Gemini and ICAR crop suitability standards.
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Overall Assessment Banner */}
              <div className="bg-emerald-950 text-white p-5 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm">AI Agronomic Assessment</span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium flex items-center gap-1.5 transition no-print"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  {result.overallAssessment}
                </p>
                {result.missingFactors && result.missingFactors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-emerald-200">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                    <span>Note: Recommendations estimated without {result.missingFactors.join(', ')}.</span>
                  </div>
                )}
              </div>

              {/* Ranked Crop Cards */}
              <div className="space-y-3">
                {result.recommendations?.map((crop, idx) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden transition-all"
                    >
                      {/* Card Header (Always visible) */}
                      <div
                        onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50/70 transition"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-base sm:text-lg shrink-0 border border-emerald-100">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
                                {crop.cropName}
                              </h3>
                              <span className="text-xs italic text-stone-400">
                                ({crop.scientificName})
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                              {crop.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`text-right px-3 py-1.5 rounded-xl border font-bold text-xs sm:text-sm ${getScoreColor(crop.suitabilityScore)}`}>
                            <div>{crop.suitabilityScore} / 100</div>
                            <div className="text-[10px] font-medium opacity-80">{crop.suitabilityCategory}</div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-stone-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Agronomic Breakdown */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-stone-100 space-y-4 text-xs sm:text-sm bg-stone-50/40">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-2xl border border-stone-200/70">
                              <span className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                                Soil Compatibility
                              </span>
                              <p className="text-stone-800">{crop.soilCompatibility}</p>
                            </div>

                            <div className="p-3 bg-white rounded-2xl border border-stone-200/70">
                              <span className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                                Climate Fit & Season
                              </span>
                              <p className="text-stone-800">{crop.climateCompatibility} • {crop.recommendedSeason}</p>
                            </div>

                            <div className="p-3 bg-white rounded-2xl border border-stone-200/70">
                              <span className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                                Water & Irrigation
                              </span>
                              <p className="text-stone-800">{crop.waterRequirements} • {crop.irrigationConsiderations}</p>
                            </div>

                            <div className="p-3 bg-white rounded-2xl border border-stone-200/70">
                              <span className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                                Duration & Nutrition
                              </span>
                              <p className="text-stone-800">{crop.estimatedDuration} • {crop.nutrientConsiderations}</p>
                            </div>
                          </div>

                          {/* Important Precautions */}
                          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900">
                            <span className="font-bold text-xs uppercase tracking-wider text-amber-950 block mb-1">
                              Important Cultivation Precautions
                            </span>
                            <p className="text-xs leading-relaxed text-amber-800">
                              {crop.importantPrecautions}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Sprout className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">No Recommendations Generated Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Fill in your farm's soil and climatic parameters on the left and click "Generate Ranked Recommendations".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
