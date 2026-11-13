import React, { useState } from 'react';
import axios from 'axios';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  FlaskConical, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  ShieldAlert, 
  HelpCircle,
  Activity,
  Layers
} from 'lucide-react';

export const SoilHealth = () => {
  const { selectedFarm } = useFarm();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    soilPh: 6.8,
    nitrogen: 240,
    phosphorus: 14,
    potassium: 160,
    organicCarbon: 0.52,
    soilMoisture: 35,
    soilType: selectedFarm?.soilType || 'alluvial',
    farmId: selectedFarm?.id || null,
    isLaboratoryVerified: false
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFillFromFarm = () => {
    if (!selectedFarm) return;
    setFormData(prev => ({
      ...prev,
      soilType: selectedFarm.soilType || prev.soilType,
      farmId: selectedFarm.id
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/soil-analysis', formData);
      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.error || 'Failed to analyze soil parameters');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('optimum') || s.includes('adequate') || s.includes('medium')) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Adequate / Optimum</span>;
    }
    if (s.includes('low') || s.includes('deficient')) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Deficient</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">High / Excess</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase">
              Soil Chemistry
            </span>
            <span className="text-xs text-stone-400">• Feature 4.5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <FlaskConical className="w-8 h-8 text-amber-600" />
            <span>Soil Health Interpretation & Fertility Analysis</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Analyze soil test parameters against standard ICAR agronomic thresholds to diagnose nutrient balances and amendments.
          </p>
        </div>

        {selectedFarm && (
          <button
            type="button"
            onClick={handleFillFromFarm}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs sm:text-sm font-semibold hover:bg-amber-100 transition shadow-xs"
          >
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>Link Farm ({selectedFarm.name})</span>
          </button>
        )}
      </div>

      <SafetyDisclaimer />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs h-fit">
          <h2 className="font-bold text-stone-900 text-base mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-600" />
            <span>Soil Test Parameters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Soil Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Soil Texture / Type *</label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
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

            {/* Soil pH Slider with Color Scale */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-bold text-stone-800">Soil Reaction (pH): {formData.soilPh}</label>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  formData.soilPh < 6.0 ? 'bg-amber-100 text-amber-800' :
                  formData.soilPh > 8.0 ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {formData.soilPh < 5.5 ? 'Strongly Acidic' :
                   formData.soilPh < 6.5 ? 'Moderately Acidic' :
                   formData.soilPh <= 7.5 ? 'Neutral (Optimal)' :
                   formData.soilPh <= 8.5 ? 'Moderately Alkaline' : 'Strongly Alkaline (Sodic)'}
                </span>
              </div>
              <input
                type="range"
                min="4.0"
                max="10.0"
                step="0.1"
                value={formData.soilPh}
                onChange={(e) => setFormData({ ...formData, soilPh: parseFloat(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>4.0 Acid</span>
                <span>6.5 - 7.5 Neutral</span>
                <span>10.0 Alkali</span>
              </div>
            </div>

            {/* N - P - K */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-700 block">Primary Macronutrients</span>
              
              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-1">
                  <span>Available Nitrogen (N)</span>
                  <span className="font-semibold text-stone-800">{formData.nitrogen} kg/ha</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="1200"
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  placeholder="Reference: 280-560 is optimum"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-1">
                  <span>Available Phosphorus (P)</span>
                  <span className="font-semibold text-stone-800">{formData.phosphorus} kg/ha</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  placeholder="Reference: 10-25 is optimum"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-1">
                  <span>Available Potassium (K)</span>
                  <span className="font-semibold text-stone-800">{formData.potassium} kg/ha</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  placeholder="Reference: 110-280 is optimum"
                  required
                />
              </div>
            </div>

            {/* Organic Carbon & Moisture */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Organic Carbon (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  value={formData.organicCarbon}
                  onChange={(e) => setFormData({ ...formData, organicCarbon: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  placeholder="e.g. 0.55"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">&gt; 0.75% is high</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Soil Moisture (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.soilMoisture}
                  onChange={(e) => setFormData({ ...formData, soilMoisture: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  placeholder="e.g. 35"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">25 - 60% optimal</span>
              </div>
            </div>

            {/* Lab Verified Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isLabVerified"
                checked={formData.isLaboratoryVerified}
                onChange={(e) => setFormData({ ...formData, isLaboratoryVerified: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
              />
              <label htmlFor="isLabVerified" className="text-xs text-stone-600 cursor-pointer">
                Based on official Soil Health Card (SHC) laboratory report
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white rounded-2xl font-bold text-sm shadow-md shadow-amber-700/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Interpreting Soil Chemistry...' : 'Run Soil Health Diagnosis'}</span>
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
              <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto flex items-center justify-center text-amber-600 animate-spin">
                <FlaskConical className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">Cross-referencing ICAR Fertility Benchmarks...</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Comparing your soil inputs with agronomic thresholds and calculating necessary chemical and organic amendments.
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 text-white p-5 sm:p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-sm">Soil Condition Summary</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-amber-200">
                    Confidence: {result.confidenceScore || 85}%
                  </span>
                </div>
                <p className="text-sm text-amber-100 leading-relaxed">
                  {result.conditionSummary}
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-stone-300">
                  <strong className="text-amber-200">pH Assessment:</strong> {result.phInterpretation}
                </div>
              </div>

              {/* Nutrient Interpretation Meters */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Nutrient Level Evaluation (vs ICAR Benchmarks)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Nitrogen */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-stone-600">Nitrogen (N)</span>
                      {getStatusBadge(result.nutrientInterpretations?.nitrogen?.status)}
                    </div>
                    <div className="text-lg font-extrabold text-stone-800">
                      {result.nutrientInterpretations?.nitrogen?.value || formData.nitrogen} <span className="text-xs font-normal text-stone-400">kg/ha</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                      {result.nutrientInterpretations?.nitrogen?.interpretation}
                    </p>
                  </div>

                  {/* Phosphorus */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-stone-600">Phosphorus (P)</span>
                      {getStatusBadge(result.nutrientInterpretations?.phosphorus?.status)}
                    </div>
                    <div className="text-lg font-extrabold text-stone-800">
                      {result.nutrientInterpretations?.phosphorus?.value || formData.phosphorus} <span className="text-xs font-normal text-stone-400">kg/ha</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                      {result.nutrientInterpretations?.phosphorus?.interpretation}
                    </p>
                  </div>

                  {/* Potassium */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-stone-600">Potassium (K)</span>
                      {getStatusBadge(result.nutrientInterpretations?.potassium?.status)}
                    </div>
                    <div className="text-lg font-extrabold text-stone-800">
                      {result.nutrientInterpretations?.potassium?.value || formData.potassium} <span className="text-xs font-normal text-stone-400">kg/ha</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                      {result.nutrientInterpretations?.potassium?.interpretation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deficiencies & Corrective Actions */}
              {result.deficiencies && result.deficiencies.length > 0 && (
                <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-200/80 space-y-2.5">
                  <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Identified Deficiencies & Corrective Measures</span>
                  </h3>
                  <div className="space-y-2">
                    {result.deficiencies.map((d, i) => (
                      <div key={i} className="p-3 bg-white rounded-2xl border border-amber-200/60 text-xs">
                        <strong className="text-amber-900 block font-bold mb-0.5">{d.nutrient} Deficiency</strong>
                        <p className="text-stone-600 mb-1"><span className="font-semibold text-stone-700">Agronomic Impact:</span> {d.impact}</p>
                        <p className="text-emerald-800 font-medium"><span className="font-semibold">Action:</span> {d.correctiveAction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amendments & Organic Advice */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Recommended Soil Amendments & Tilth Management</span>
                </h3>

                {result.soilAmendments && result.soilAmendments.length > 0 ? (
                  <div className="space-y-2">
                    {result.soilAmendments.map((am, i) => (
                      <div key={i} className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-stone-900 block">{am.amendment}</span>
                          <span className="text-stone-500">{am.purpose}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg shrink-0">
                          {am.dosage}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    No major chemical amendments (lime or gypsum) required. Your soil pH is balanced.
                  </p>
                )}

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
                  <strong className="block font-bold text-emerald-950 mb-0.5">Organic Matter & Microbial Health:</strong>
                  {result.organicMatterAdvice}
                </div>
              </div>

              {/* Recommended Follow-up Tests */}
              {result.recommendedTests && result.recommendedTests.length > 0 && (
                <div className="bg-stone-50 rounded-3xl p-4 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>
                    <strong className="text-stone-800">Suggested Follow-up Laboratory Tests:</strong>{' '}
                    {result.recommendedTests.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <FlaskConical className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">No Soil Analysis Run Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Enter your soil test figures (or click 'Link Farm' for defaults) and submit to receive balanced agronomic advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
