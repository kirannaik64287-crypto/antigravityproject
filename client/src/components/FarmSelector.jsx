import React from 'react';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FarmSelector = () => {
  const { farms, selectedFarm, setSelectedFarm } = useFarm();
  const { t } = useLanguage();

  if (!farms || farms.length === 0) {
    return (
      <Link
        to="/farms"
        className="flex items-center gap-1.5 text-xs font-medium text-agri-700 bg-agri-50 border border-agri-200 px-3 py-1.5 rounded-lg hover:bg-agri-100 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t('addFarm')}</span>
      </Link>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 text-emerald-950 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-medium">
        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <select
          value={selectedFarm?.id || ''}
          onChange={(e) => setSelectedFarm(e.target.value)}
          className="bg-transparent border-none outline-none font-semibold text-emerald-900 cursor-pointer pr-4 focus:ring-0"
        >
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id} className="text-stone-900 bg-white">
              {farm.name} ({farm.totalArea} {farm.areaUnit || 'acres'}, {farm.district})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
