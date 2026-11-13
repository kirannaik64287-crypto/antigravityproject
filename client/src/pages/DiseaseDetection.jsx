import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  Bug, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  HelpCircle, 
  X,
  Stethoscope
} from 'lucide-react';

export const DiseaseDetection = () => {
  const { selectedFarm } = useFarm();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [cropName, setCropName] = useState('Rice (Paddy)');
  const [reportedSymptoms, setReportedSymptoms] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const commonSymptomChips = [
    'Yellowing leaves (Chlorosis)',
    'Brown concentric leaf spots',
    'White powdery patches',
    'Sudden wilting during daytime',
    'Curled or deformed foliage',
    'Insect webbing / holes in leaves'
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, WebP).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddSymptom = (chip) => {
    setReportedSymptoms(prev => prev ? `${prev}, ${chip}` : chip);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      if (selectedFile) {
        data.append('image', selectedFile);
      }
      data.append('cropName', cropName);
      data.append('reportedSymptoms', reportedSymptoms);
      if (selectedFarm?.id) {
        data.append('farmId', selectedFarm.id);
      }

      const res = await axios.post('/api/disease-detection', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.error || 'Diagnosis failed');
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 uppercase">
              Plant Doctor
            </span>
            <span className="text-xs text-stone-400">• Feature 4.8</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Bug className="w-8 h-8 text-rose-600" />
            <span>Crop Disease & Pest Diagnosis (Vision AI)</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Upload leaf, stem, or pest photographs for multimodal preliminary screening and ICAR-approved organic treatments.
          </p>
        </div>
      </div>

      <SafetyDisclaimer />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Upload Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs h-fit">
          <h2 className="font-bold text-stone-900 text-base mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-rose-600" />
            <span>Submit Crop Symptoms for Screening</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Crop Photo *</label>
              
              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 aspect-video flex items-center justify-center group">
                  <img src={previewUrl} alt="Crop Preview" className="max-h-full object-contain" />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-rose-400 bg-stone-50 hover:bg-rose-50/20 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-stone-800">
                      Tap to Take Photo or Browse
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Supports JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Target Crop */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Crop Type *</label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Cotton, Rice, Tomato, Wheat"
                className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 px-3 py-2 bg-white"
                required
              />
            </div>

            {/* Visible Symptoms */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Visible Symptoms & Field Observations
              </label>
              <textarea
                rows="3"
                value={reportedSymptoms}
                onChange={(e) => setReportedSymptoms(e.target.value)}
                placeholder="Describe leaf spots, color changes, insect webbings, or wilting pattern..."
                className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 p-3 bg-white"
              />

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {commonSymptomChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSymptom(chip)}
                    className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded-lg transition"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-700/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing with Gemini Vision...' : 'Diagnose Symptoms'}</span>
            </button>
          </form>
        </div>

        {/* Diagnosis Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-xs text-center space-y-3 animate-pulse">
              <div className="w-16 h-16 bg-rose-100 rounded-full mx-auto flex items-center justify-center text-rose-600 animate-spin">
                <Bug className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">Performing Multimodal Crop Screening...</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Gemini Vision AI is inspecting lesions, necrotic halos, fungal sporulation, and chlorosis patterns.
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Primary Diagnosis Banner */}
              <div className="bg-rose-950 text-white p-5 sm:p-6 rounded-3xl shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    Primary Suspected Pathogen / Disorder
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-rose-200">
                    Confidence: {result.confidenceLevel || 'Preliminary'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {result.suspectedDiseaseOrPest}
                </h2>
                {result.scientificName && (
                  <p className="text-xs italic text-rose-200 mt-0.5">
                    Scientific Identification: {result.scientificName}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-stone-200 mt-3 pt-3 border-t border-white/10 leading-relaxed">
                  <strong className="text-rose-200">Observed Signs:</strong> {result.observedVisualSymptoms}
                </p>
              </div>

              {/* Immediate Safe Actions */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Recommended Immediate Organic / IPM Actions</span>
                </h3>

                <div className="space-y-2">
                  {result.immediateActions?.map((act, i) => (
                    <div key={i} className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-950">
                      <strong>Step {i + 1}:</strong> {act}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preventive Measures */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Long-Term Preventive Measures</span>
                </h3>

                <ul className="list-disc list-inside space-y-1.5 text-xs text-stone-700">
                  {result.preventiveMeasures?.map((prev, i) => (
                    <li key={i}>{prev}</li>
                  ))}
                </ul>
              </div>

              {/* Differential Lookalikes */}
              {result.alternativeCauses && result.alternativeCauses.length > 0 && (
                <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 text-xs space-y-2">
                  <strong className="font-bold text-stone-800 block flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-stone-500" />
                    <span>Differential Diagnoses (Alternative Explanations)</span>
                  </strong>
                  <ul className="list-disc list-inside space-y-1 text-stone-600">
                    {result.alternativeCauses.map((alt, i) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expert Consultation Notice */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Agricultural Officer & KVK Consultation Required</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {result.suggestedExpertConsultation || 'Carry an infected leaf sample in a sealed transparent bag to the nearest Krishi Vigyan Kendra (KVK) for laboratory confirmation before spraying synthetic chemicals.'}
                </p>
                <p className="text-[11px] text-amber-700 italic pt-1 border-t border-amber-200/50">
                  {result.safetyDisclaimer}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Bug className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg">No Crop Diagnosis Submitted Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Capture a close-up photo of the discolored leaf or symptoms and click "Diagnose Symptoms".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
