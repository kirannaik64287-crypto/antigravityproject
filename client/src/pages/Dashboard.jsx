import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  Sprout, 
  FlaskConical, 
  Sparkles, 
  Droplets, 
  Bug, 
  CalendarDays, 
  MessageSquareText, 
  Warehouse, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Layers, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const Dashboard = () => {
  const { profile } = useAuth();
  const { selectedFarm, farms } = useFarm();
  const { t } = useLanguage();
  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await axios.get('/api/history');
      if (res.data?.success) {
        const crops = (res.data.data.crops || []).map(item => ({
          type: 'Crop Advisory',
          icon: Sprout,
          color: 'text-emerald-700 bg-emerald-100',
          title: item.recommendations?.[0]?.cropName || 'Crop Recommendation',
          subtitle: `${item.season || 'Kharif'} • Score: ${item.recommendations?.[0]?.suitabilityScore || 90}/100`,
          date: item.createdAt
        }));

        const soils = (res.data.data.soil || []).map(item => ({
          type: 'Soil Analysis',
          icon: FlaskConical,
          color: 'text-amber-700 bg-amber-100',
          title: `Soil pH ${item.soilPh} Analysis`,
          subtitle: item.conditionSummary?.substring(0, 45) + '...',
          date: item.createdAt
        }));

        const combined = [...crops, ...soils].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
        setRecentHistory(combined);
      }
    } catch (err) {
      console.warn('Error fetching history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const quickActions = [
    {
      to: '/crop-recommendation',
      title: t('cropAdvisory'),
      desc: 'Ranked crop recommendations based on soil chemistry & climate.',
      icon: Sprout,
      color: 'from-emerald-600 to-green-700',
      badge: 'AI Engine'
    },
    {
      to: '/soil-health',
      title: t('soilHealth'),
      desc: 'Soil pH, NPK interpretation, and corrective amendments.',
      icon: FlaskConical,
      color: 'from-amber-600 to-yellow-700',
      badge: 'ICAR Standard'
    },
    {
      to: '/fertilizer',
      title: t('fertilizerGuide'),
      desc: 'Stage-wise split application schedules & organic alternatives.',
      icon: Sparkles,
      color: 'from-teal-600 to-cyan-700',
      badge: 'Nutrient Split'
    },
    {
      to: '/irrigation',
      title: t('irrigationGuide'),
      desc: 'Weather-integrated watering interval and conservation tips.',
      icon: Droplets,
      color: 'from-blue-600 to-indigo-700',
      badge: 'Hydro Advisory'
    },
    {
      to: '/disease-detection',
      title: t('diseasePest'),
      desc: 'Multimodal vision screening for leaf symptoms and pests.',
      icon: Bug,
      color: 'from-rose-600 to-red-700',
      badge: 'Gemini Vision'
    },
    {
      to: '/calendar',
      title: t('farmingCalendar'),
      desc: 'Day-by-day operations roadmap from sowing to harvest.',
      icon: CalendarDays,
      color: 'from-purple-600 to-violet-700',
      badge: 'Checklist'
    },
    {
      to: '/chat',
      title: t('aiAssistant'),
      desc: 'Consult your personal agricultural AI extension officer.',
      icon: MessageSquareText,
      color: 'from-emerald-700 to-teal-800',
      badge: 'Multilingual'
    },
    {
      to: '/farms',
      title: t('myFarms'),
      desc: 'Manage your plots, soil types, water sources, and acreage.',
      icon: Warehouse,
      color: 'from-stone-700 to-stone-800',
      badge: `${farms.length} Plots`
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Namaste, {profile?.fullName || 'Farmer Friend'}! 👋
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Welcome to AgriSahayak. Real-time decision-support for your crops and soil.
          </p>
        </div>
        
        {selectedFarm && (
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-950 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Active: <strong>{selectedFarm.name}</strong> ({selectedFarm.totalArea} {selectedFarm.areaUnit || 'acres'})
            </span>
          </div>
        )}
      </div>

      {/* Live Agro-Weather Center */}
      <WeatherWidget />

      {/* Quick Services Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-stone-900">{t('quickActions')}</h2>
          <span className="text-xs text-stone-500 font-medium">8 Decision Tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {action.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-700 transition">
                    {action.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Split: Active Farm Overview & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Farm Profile Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-emerald-600" />
              <span>{t('activeFarm')}</span>
            </h3>
            <Link to="/farms" className="text-xs font-semibold text-emerald-700 hover:underline">
              Manage Plots
            </Link>
          </div>

          {selectedFarm ? (
            <div className="space-y-3 text-sm">
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                <p className="text-xs text-stone-400 uppercase font-semibold">Plot Name</p>
                <p className="text-base font-extrabold text-stone-800">{selectedFarm.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedFarm.village ? `${selectedFarm.village}, ` : ''}{selectedFarm.district}, {selectedFarm.state}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block font-medium">Total Area</span>
                  <span className="font-bold text-stone-800 text-sm">{selectedFarm.totalArea} {selectedFarm.areaUnit || 'acres'}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block font-medium">Soil Type</span>
                  <span className="font-bold text-stone-800 capitalize text-sm">{selectedFarm.soilType?.replace('_', ' ')}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block font-medium">Water Source</span>
                  <span className="font-bold text-stone-800 capitalize text-sm">{selectedFarm.irrigationSource}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block font-medium">Cultivation</span>
                  <span className="font-bold text-stone-800 capitalize text-sm">{selectedFarm.currentCultivationStatus?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-stone-500 mb-3">No agricultural plot registered yet.</p>
              <Link
                to="/farms"
                className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Register Your First Farm
              </Link>
            </div>
          )}
        </div>

        {/* Recent Advisory Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>{t('recentRecommendations')}</span>
              </h3>
              <Link to="/history" className="text-xs font-semibold text-emerald-700 hover:underline">
                View All History
              </Link>
            </div>

            {loadingHistory ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-14 bg-stone-100 rounded-2xl"></div>
                <div className="h-14 bg-stone-100 rounded-2xl"></div>
                <div className="h-14 bg-stone-100 rounded-2xl"></div>
              </div>
            ) : recentHistory.length > 0 ? (
              <div className="space-y-2.5">
                {recentHistory.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{item.type}</span>
                            <span className="text-[10px] text-stone-400">• {new Date(item.date).toLocaleDateString()}</span>
                          </div>
                          <p className="font-bold text-stone-900 text-sm">{item.title}</p>
                          <p className="text-xs text-stone-500">{item.subtitle}</p>
                        </div>
                      </div>

                      <Link
                        to="/history"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-100/50"
                      >
                        Inspect
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <Sprout className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-600">No advisories generated yet.</p>
                <p className="text-xs text-stone-400 mt-1">Start by requesting a Crop Recommendation or Soil Health Analysis!</p>
              </div>
            )}
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="mt-4">
            <SafetyDisclaimer compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
};
