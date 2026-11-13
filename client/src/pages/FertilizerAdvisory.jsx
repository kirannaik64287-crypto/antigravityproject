import React, { useState } from 'react';
import axios from 'axios';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Leaf, 
  ShieldAlert, 
  Layers, 
  Droplet,
  BookOpen
} from 'lucide-react';

export const FertilizerAdvisory = () => {
  const { selectedFarm } = useFarm();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    cropName: 'Rice (Paddy)',
    growthStage: 'Tillering',
    soilType: selectedFarm?.soilType || 'alluvial',
    landArea: selectedFarm?.totalArea || 2.0,
    areaUnit: selectedFarm?.areaUnit || 'acres',
    nitrogen: 240,
    phosphorus: 14,
    potassium: 160,
    farmId: selectedFarm?.id || null
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const cropsList = [
    'Rice (Paddy)', 'Wheat', 'Cotton', 'Maize (Corn)', 'Sugarcane', 
    'Soybean', 'Chickpea (Chana)', 'Mustard', 'Groundnut', 'Pearl Millet (Bajra)',
    'Tomato', 'Onion', 'Potato'
  ];

  const growthStages = [
    'Basal (At Sowing / Field Prep)',
    'Vegetative / Tillering',
    'Crown Root Initiation (CRI)',
    'Flowering / Booting',
    'Fruit Set / Grain Filling',
    'Ripening / Maturation'
  ];

  const handleFillFromFarm = () => {
    if (!selectedFarm) return;
    setFormData(prev => ({
      ...prev,
      soilType: selectedFarm.soilType || prev.soilType,
      landArea: selectedFarm.totalArea || prev.landArea,
      areaUnit: selectedFarm.areaUnit || prev.areaUnit,
      farmId: selectedFarm.id
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/fertilizer', formData);
      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.error || 'Failed to generate fertilizer guidance');
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 uppercase">
              Nutrient Management
            </span>
            <span className="text-xs text-stone-400">• Feature 4.6</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-8 h-8 text-teal-600" />
            <span>Fertilizer Recommendation & Nutrient Scheduling</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Generate stage-wise split fertilizer applications, organic manure alternatives, and safe placement methods.
          </p>
        </div>

        {selectedFarm && (
          <button
            type="button"
            onClick={handleFillFromFarm}
            className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs sm:text-sm font-semibold hover:bg-teal-100 transition shadow-xs"
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Link Farm ({selectedFarm.name})</span>
          </button>
        )}
      </div>

      <SafetyDisclaimer />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs h-fit">
          <h2 className="font-bold text-stone-900 text-base mb-4 pb-3 border-b border-stone-100">
            Nutrient Advisory Parameters
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Crop & Stage */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Target Crop *</label>
              <select
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                required
              >
                {cropsList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Current Growth Stage *</label>
              <select
                value={formData.growthStage}
                onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                required
              >
                {growthStages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Land Area & Soil Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Plot Area *</label>
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
                  <span className="bg-stone-100 border border-l-0 border-stone-300 px-2.5 py-2 text-xs rounded-r-xl text-stone-600 font-medium">
                    {formData.areaUnit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Soil Type</label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                >
                  <option value="alluvial">Alluvial</option>
                  <option value="black">Black / Regur</option>
                  <option value="red">Red</option>
                  <option value="laterite">Laterite</option>
                  <option value="sandy_loam">Sandy Loam</option>
                  <option value="clay_loam">Clay Loam</option>
                </select>
              </div>
            </div>

            {/* Soil Available Nutrients */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2">
              <span className="text-xs font-bold text-stone-700 block">Available Soil Nutrients (Optional kg/ha)</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-500 mb-0.5">N (kg/ha)</label>
                  <input
                    type="number"
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-0.5">P (kg/ha)</label>
                  <input
                    type="number"
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-0.5">K (kg/ha)</label>
                  <input
                    type="number"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white rounded-2xl font-bold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Calculating Balanced Dosage...' : 'Generate Fertilizer Plan'}</span>
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
              <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto flex items-center justify-center text-teal-600 animate-spin">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">Computing Balanced Nutrient Fractions...</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Formulating split schedule across basal, vegetative, and reproductive phases based on ICAR guidelines.
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Overview Banner */}
              <div className="bg-teal-950 text-white p-5 sm:p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                    <span className="font-bold text-sm">Stage-Specific Nutrient Focus</span>
                  </div>
                  <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-teal-200">
                    {result.crop} • {result.growthStage}
                  </span>
                </div>
                <p className="text-sm text-teal-100 leading-relaxed">
                  {result.nutrientRequirementOverview?.stageSpecificFocus}
                </p>
              </div>

              {/* Split Fertilizer Timetable */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Split Application Timetable</span>
                </h3>

                <div className="space-y-3">
                  {result.fertilizerSchedule?.map((sch, i) => (
                    <div key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-stone-900 text-sm">{sch.stage}</span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-semibold">
                          {sch.timing}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-stone-200 font-semibold text-emerald-900 text-xs sm:text-sm">
                        {sch.recommendedFertilizer}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                        <div><strong className="text-stone-700">Method:</strong> {sch.applicationMethod}</div>
                        <div><strong className="text-stone-700">Agronomic Goal:</strong> {sch.purpose}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organic Alternatives */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Organic Manures & Biofertilizers</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.organicAlternatives?.map((org, i) => (
                    <div key={i} className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs">
                      <span className="font-bold text-emerald-950 text-sm block mb-0.5">{org.name}</span>
                      <span className="font-semibold text-emerald-800 block mb-1">Rate: {org.applicationRate}</span>
                      <p className="text-stone-600 leading-relaxed">{org.benefits}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Warnings */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <strong className="block font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Environmental Protection & Dosage Safety</span>
                </strong>
                <p className="text-amber-800 leading-relaxed">
                  {result.environmentalPrecautions}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">No Fertilizer Schedule Generated Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Select your crop, current growth stage, and land area to obtain a balanced split nutrient plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
