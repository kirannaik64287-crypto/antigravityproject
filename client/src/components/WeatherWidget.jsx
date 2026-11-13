import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useFarm } from '../context/FarmContext';
import { 
  Sun, CloudSun, Cloud, CloudRain, CloudLightning, Wind, Droplets, Thermometer, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WeatherWidget = () => {
  const { t } = useLanguage();
  const { selectedFarm } = useFarm();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, [selectedFarm]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedFarm?.latitude && selectedFarm?.longitude) {
        params.lat = selectedFarm.latitude;
        params.lon = selectedFarm.longitude;
      } else if (selectedFarm?.district) {
        params.location = `${selectedFarm.district}, ${selectedFarm.state || 'India'}`;
      }

      const res = await axios.get('/api/weather', { params });
      if (res.data?.success) {
        setWeather(res.data.data);
      }
    } catch (err) {
      console.warn('Weather fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-stone-100 rounded mb-3"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 bg-stone-100 rounded"></div>
          <div className="h-10 bg-stone-100 rounded"></div>
          <div className="h-10 bg-stone-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const current = weather.current;
  const advisory = weather.agriculturalAdvisory;

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-green-950 to-stone-900 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Current status */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
            <Sun className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {current.temperature}°C
              </span>
              <span className="text-xs text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
                Feels {current.feelsLike}°C
              </span>
            </div>
            <p className="text-sm font-medium text-emerald-100 capitalize">
              {current.description} • {weather.location.label}
            </p>
          </div>
        </div>

        {/* Live metric chips */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs mb-0.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>{t('humidity')}</span>
            </div>
            <span className="text-sm font-bold">{current.humidity}%</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs mb-0.5">
              <Wind className="w-3.5 h-3.5" />
              <span>{t('windSpeed')}</span>
            </div>
            <span className="text-sm font-bold">{current.windSpeed} km/h</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs mb-0.5">
              <CloudRain className="w-3.5 h-3.5" />
              <span>{t('rainfall')}</span>
            </div>
            <span className="text-sm font-bold">{current.precipitation} mm</span>
          </div>
        </div>
      </div>

      {/* Agricultural suitability indicators */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {/* Spraying Window */}
        <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2">
          {advisory?.spraying?.suitable ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="truncate">
            <strong className="text-white">Spray:</strong> {advisory?.spraying?.suitable ? 'Favorable calm window' : 'Postpone spraying'}
          </span>
        </div>

        {/* Sowing Suitability */}
        <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2">
          {advisory?.sowing?.suitable ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="truncate">
            <strong className="text-white">Sowing:</strong> {advisory?.sowing?.suitable ? 'Optimal temperature' : 'Check temperature'}
          </span>
        </div>

        {/* Full forecast link */}
        <Link
          to="/weather"
          className="flex items-center justify-between bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded-xl px-3 py-2 transition group"
        >
          <span className="font-semibold text-white">7-Day Farming Forecast</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
