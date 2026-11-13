import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SafetyDisclaimer = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
        <Info className="w-4 h-4 text-agri-600 shrink-0" />
        <span>{t('disclaimerText')}</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 text-amber-900 text-xs sm:text-sm flex gap-3 items-start my-3">
      <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div>
        <p className="font-semibold text-amber-950 mb-0.5">{t('disclaimerTitle')}</p>
        <p className="text-amber-800 leading-relaxed">
          {t('disclaimerText')} All suitability scores and fertilizer timings are AI-assisted estimates. Never apply high dosages or unknown chemical mixtures without certified plant pathology confirmation.
        </p>
      </div>
    </div>
  );
};
