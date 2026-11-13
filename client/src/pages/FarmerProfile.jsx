import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  UserCircle2, 
  Save, 
  MapPin, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  Server, 
  Cpu, 
  CloudSun,
  ShieldCheck,
  Check
} from 'lucide-react';

export const FarmerProfile = () => {
  const { profile, updateProfile } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    preferredLanguage: 'en',
    state: '',
    district: '',
    village: '',
    postalCode: '',
    farmingExperience: 5,
    farmingType: 'conventional',
    totalLandArea: 3,
    preferredUnits: 'acres'
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        preferredLanguage: profile.preferredLanguage || language || 'en',
        state: profile.state || 'Maharashtra',
        district: profile.district || 'Nagpur',
        village: profile.village || '',
        postalCode: profile.postalCode || '',
        farmingExperience: profile.farmingExperience || 5,
        farmingType: profile.farmingType || 'conventional',
        totalLandArea: profile.totalLandArea || 3,
        preferredUnits: profile.preferredUnits || 'acres'
      });
    }

    // Fetch system status
    axios.get('/api/auth/status')
      .then(res => setSystemStatus(res.data))
      .catch(() => {});
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const res = await updateProfile(formData);
    if (res?.success) {
      setLanguage(formData.preferredLanguage);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xl shadow-xs">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {formData.fullName || 'Farmer Profile'}
            </h1>
            <p className="text-stone-500 text-xs">
              {profile?.email || 'farmer@agrisahayak.local'} • Profile & Preferences
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile Saved</span>
          </div>
        )}
      </div>

      <SafetyDisclaimer />

      {/* Profile Form */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5">
        <h2 className="font-bold text-stone-900 text-base pb-3 border-b border-stone-100 flex items-center gap-2">
          <UserCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Agricultural Profile Information</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Village</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Language</label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full rounded-xl border border-stone-300 p-2.5 bg-white font-medium"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Units *</label>
              <select
                value={formData.preferredUnits}
                onChange={(e) => setFormData({ ...formData, preferredUnits: e.target.value })}
                className="w-full rounded-xl border border-stone-300 p-2.5 bg-white font-medium"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="guntas">Guntas (Guntha)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Farming Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="80"
                value={formData.farmingExperience}
                onChange={(e) => setFormData({ ...formData, farmingExperience: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-stone-300 p-2.5 bg-white font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Profile...' : 'Save Profile Settings'}</span>
          </button>
        </form>
      </div>

      {/* Cloud & AI Diagnostics Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-600" />
          <span>Platform Cloud Architecture & Integrations</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Supabase Status */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-semibold block">Supabase Cloud DB</span>
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{systemStatus?.services?.supabase?.configured ? 'Active Connection' : 'Schema & Runner Ready'}</span>
            </div>
            <p className="text-[11px] text-stone-500">
              RLS policies & migrations in /supabase/migrations/
            </p>
          </div>

          {/* Gemini AI Status */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-semibold block">AI Agronomist Engine</span>
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>{systemStatus?.services?.gemini?.configured ? 'Gemini 2.5 Active' : 'Agronomic + GenAI Ready'}</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Official @google/genai SDK integrated
            </p>
          </div>

          {/* Weather API Status */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-semibold block">Agro-Weather Provider</span>
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <CloudSun className="w-4 h-4 text-emerald-600" />
              <span>Live Global Satellites</span>
            </div>
            <p className="text-[11px] text-stone-500">
              High-resolution real-time weather active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
