import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  CloudSun, 
  Search, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Compass,
  CalendarDays
} from 'lucide-react';

export const WeatherStation = () => {
  const { selectedFarm } = useFarm();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, [selectedFarm]);

  const fetchWeather = async (customLocation = null) => {
    try {
      setLoading(true);
      setError(null);
      const params = {};

      if (customLocation) {
        params.location = customLocation;
      } else if (selectedFarm?.latitude && selectedFarm?.longitude) {
        params.lat = selectedFarm.latitude;
        params.lon = selectedFarm.longitude;
        params.location = `${selectedFarm.name} (${selectedFarm.district})`;
      } else if (selectedFarm?.district) {
        params.location = `${selectedFarm.district}, ${selectedFarm.state || 'India'}`;
      } else {
        params.location = 'Nagpur, Maharashtra';
      }

      const res = await axios.get('/api/weather', { params });
      if (res.data?.success) {
        setWeather(res.data.data);
      } else {
        setError('Unable to fetch weather data.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase">
              Agro-Meteorology
            </span>
            <span className="text-xs text-stone-400">• Feature 4.9</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <CloudSun className="w-8 h-8 text-blue-600" />
            <span>Agricultural Weather Station & Forecast</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Real-time weather data and 7-day agricultural forecasts to schedule spraying, sowing, and harvesting.
          </p>
        </div>

        {/* Location Search Form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city / district..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shrink-0"
          >
            Check
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 shadow-xs text-center space-y-3 animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600 animate-spin">
            <CloudSun className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-stone-800 text-lg">Connecting to Agricultural Meteorological Satellites...</h3>
          <p className="text-xs text-stone-500">Fetching precipitation probabilities and wind vectors.</p>
        </div>
      ) : weather ? (
        <div className="space-y-6">
          {/* Main Weather Card */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 text-blue-200 text-xs sm:text-sm mb-1">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>{weather.location.label}</span>
                  <span>•</span>
                  <span>{new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight">
                    {weather.current.temperature}°C
                  </span>
                  <span className="text-base sm:text-lg text-blue-200 font-medium capitalize">
                    {weather.current.description}
                  </span>
                </div>
                <p className="text-xs text-blue-300 mt-1">
                  Feels like {weather.current.feelsLike}°C • Source: {weather.source}
                </p>
              </div>

              {/* Metric grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto">
                <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl text-center">
                  <Droplets className="w-5 h-5 mx-auto text-blue-300 mb-1" />
                  <span className="text-[11px] text-blue-200 block">Humidity</span>
                  <span className="text-base font-extrabold">{weather.current.humidity}%</span>
                </div>

                <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl text-center">
                  <Wind className="w-5 h-5 mx-auto text-blue-300 mb-1" />
                  <span className="text-[11px] text-blue-200 block">Wind Speed</span>
                  <span className="text-base font-extrabold">{weather.current.windSpeed} km/h</span>
                </div>

                <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl text-center">
                  <CloudRain className="w-5 h-5 mx-auto text-blue-300 mb-1" />
                  <span className="text-[11px] text-blue-200 block">Precipitation</span>
                  <span className="text-base font-extrabold">{weather.current.precipitation} mm</span>
                </div>
              </div>
            </div>

            {/* Agricultural Suitability Bar */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-black/20 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-white">
                  {weather.agriculturalAdvisory?.spraying?.suitable ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Spraying Suitability: {weather.agriculturalAdvisory?.spraying?.suitable ? 'Favorable' : 'Delay Spraying'}</span>
                </div>
                <p className="text-stone-300 leading-snug">{weather.agriculturalAdvisory?.spraying?.reason}</p>
              </div>

              <div className="p-3 bg-black/20 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-white">
                  {weather.agriculturalAdvisory?.sowing?.suitable ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Sowing Temperature: {weather.agriculturalAdvisory?.sowing?.suitable ? 'Optimal' : 'Check Soil Temp'}</span>
                </div>
                <p className="text-stone-300 leading-snug">{weather.agriculturalAdvisory?.sowing?.reason}</p>
              </div>

              <div className="p-3 bg-black/20 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Clock className="w-4 h-4 text-blue-300" />
                  <span>Irrigation Requirement</span>
                </div>
                <p className="text-stone-300 leading-snug">{weather.agriculturalAdvisory?.irrigation?.advice}</p>
              </div>
            </div>
          </div>

          {/* 7-Day Agricultural Forecast */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-4">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span>7-Day Agricultural Weather Forecast</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.forecast?.map((day, idx) => (
                <div key={idx} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 text-center space-y-1.5">
                  <p className="text-xs font-bold text-stone-700">
                    {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </p>
                  <p className="text-xs font-medium text-stone-500 capitalize">{day.condition}</p>
                  <div className="text-sm font-extrabold text-stone-900">
                    {Math.round(day.maxTemp)}° <span className="text-xs font-normal text-stone-400">/ {Math.round(day.minTemp)}°</span>
                  </div>
                  <div className="pt-1.5 border-t border-stone-200/50 text-[11px] text-blue-700 font-semibold flex items-center justify-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    <span>{day.precipitationSum} mm ({day.precipProbability}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly 24h Trend */}
          {weather.hourly && weather.hourly.length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-stone-900 text-sm">Next 24 Hours Progression</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {weather.hourly.map((h, i) => (
                  <div key={i} className="shrink-0 p-3 bg-stone-50 rounded-xl border border-stone-100 text-center min-w-[70px]">
                    <span className="text-[11px] text-stone-400 block">{h.time}</span>
                    <span className="text-sm font-bold text-stone-800 block my-1">{Math.round(h.temp)}°</span>
                    <span className="text-[10px] text-blue-600 font-semibold">{h.precipProb}% rain</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
