import React, { useState } from 'react';
import axios from 'axios';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  Droplets, 
  MapPin, 
  CloudSun, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Waves, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';

export const IrrigationAdvisory = () => {
  const { selectedFarm } = useFarm();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    cropName: 'Wheat',
    growthStage: 'Crown Root Initiation (CRI)',
    soilType: selectedFarm?.soilType || 'alluvial',
    irrigationMethod: selectedFarm?.irrigationSource || 'check_basin',
    waterAvailability: selectedFarm?.waterAvailability || 'sufficient',
    soilMoisture: 35,
    temperature: 26,
    rainfallForecast: 0,
    farmId: selectedFarm?.id || null
  });

  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const crops = [
    'Wheat', 'Rice (Paddy)', 'Cotton', 'Maize (Corn)', 'Sugarcane', 
    'Soybean', 'Chickpea (Chana)', 'Mustard', 'Groundnut', 'Tomato', 'Onion'
  ];

  const handleFetchWeather = async () => {
    try {
      setWeatherLoading(true);
      const params = {};
      if (selectedFarm?.latitude && selectedFarm?.longitude) {
        params.lat = selectedFarm.latitude;
        params.lon = selectedFarm.longitude;
      } else {
        params.location = selectedFarm?.district || 'Nagpur';
      }
      const res = await axios.get('/api/weather', { params });
      if (res.data?.success) {
        const w = res.data.data;
        setFormData(prev => ({
          ...prev,
          temperature: w.current?.temperature || prev.temperature,
          rainfallForecast: w.forecast?.[0]?.precipitationSum ? Math.round(w.forecast[0].precipitationSum * 10) : 0
        }));
      }
    } catch (err) {
      console.warn('Weather fetch notice:', err.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/irrigation', formData);
      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.error || 'Failed to generate irrigation advisory');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase">
              Water Management
            </span>
            <span className="text-xs text-stone-400">• Feature 4.7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Droplets className="w-8 h-8 text-blue-600" />
            <span>Weather-Aware Irrigation Scheduling</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Calculate water requirements, interval timing, drought indicators, and conservation techniques.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFetchWeather}
          disabled={weatherLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-100 transition shadow-xs"
        >
          <CloudSun className="w-4 h-4 text-blue-600" />
          <span>{weatherLoading ? 'Fetching Live Rain...' : 'Sync Rain Forecast'}</span>
        </button>
      </div>

      <SafetyDisclaimer />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs h-fit">
          <h2 className="font-bold text-stone-900 text-base mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Field Hydrology Parameters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Crop *</label>
              <select
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                required
              >
                {crops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Growth Stage *</label>
              <input
                type="text"
                value={formData.growthStage}
                onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                placeholder="e.g. Crown Root Initiation / Flowering"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Soil Type *</label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  required
                >
                  <option value="alluvial">Alluvial</option>
                  <option value="black">Black / Clay</option>
                  <option value="red">Red Soil</option>
                  <option value="sandy_loam">Sandy Loam</option>
                  <option value="clay_loam">Clay Loam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Irrigation Method *</label>
                <select
                  value={formData.irrigationMethod}
                  onChange={(e) => setFormData({ ...formData, irrigationMethod: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  required
                >
                  <option value="drip">Drip Irrigation</option>
                  <option value="sprinkler">Sprinkler Irrigation</option>
                  <option value="furrow">Ridge & Furrow</option>
                  <option value="check_basin">Check Basin / Border</option>
                  <option value="flooding">Surface Flooding</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Water Supply</label>
                <select
                  value={formData.waterAvailability}
                  onChange={(e) => setFormData({ ...formData, waterAvailability: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                >
                  <option value="abundant">Abundant</option>
                  <option value="sufficient">Sufficient</option>
                  <option value="moderate">Moderate</option>
                  <option value="scarce">Scarce / Drought Prone</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Rain Forecast (mm)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.rainfallForecast}
                  onChange={(e) => setFormData({ ...formData, rainfallForecast: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  placeholder="e.g. 0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <Droplets className="w-4 h-4" />
              <span>{loading ? 'Evaluating Evapotranspiration...' : 'Generate Irrigation Schedule'}</span>
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-xs text-center space-y-3 animate-pulse">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600 animate-spin">
                <Droplets className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">Calculating Soil Moisture Deficit...</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Analyzing crop water coefficients, ambient temperature, and local rainfall probabilities.
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Guidance Banner */}
              <div className="bg-blue-950 text-white p-5 sm:p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm">Actionable Irrigation Guidance</span>
                </div>
                <p className="text-sm text-blue-100 leading-relaxed">
                  {result.irrigationGuidance}
                </p>
              </div>

              {/* Schedule Cards */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Recommended Watering Schedule</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.recommendedSchedule?.map((sch, i) => (
                    <div key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-stone-800 text-sm">{sch.interval}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          sch.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sch.priority || 'High'}
                        </span>
                      </div>
                      <p className="text-stone-600"><strong>Water Depth/Volume:</strong> {sch.durationOrDepth}</p>
                      <p className="text-stone-600"><strong>Best Timing:</strong> {sch.timingOfDay}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water Conservation & Drip Suitability */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Waves className="w-4 h-4 text-emerald-600" />
                  <span>Water Conservation Techniques</span>
                </h3>

                <div className="space-y-2">
                  {result.waterConservationTips?.map((tip, i) => (
                    <div key={i} className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-950 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700">
                  <strong className="block font-bold text-stone-900 mb-0.5">Micro-Irrigation Feasibility:</strong>
                  {result.dripSprinklerSuitability}
                </div>
              </div>

              {/* Stress Indicators & Risk Warnings */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-2">
                <strong className="block font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Crop Water Stress Symptoms to Monitor</span>
                </strong>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  {result.waterStressIndicators?.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-amber-200/60 text-amber-800">
                  <strong>Precautions:</strong> {result.overUnderPrecautions || 'Avoid standing water in clay soils to prevent root asphyxiation.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Droplets className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">No Irrigation Advisory Calculated Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Specify your crop, irrigation setup, and soil texture to receive an evapotranspiration-aware watering plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
