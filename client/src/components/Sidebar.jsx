import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Sprout, 
  FlaskConical, 
  Sparkles, 
  Droplets, 
  Bug, 
  CloudSun, 
  MessageSquareText, 
  CalendarDays, 
  Warehouse, 
  History, 
  UserCircle2,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/crop-recommendation', label: t('cropAdvisory'), icon: Sprout, badge: 'AI' },
    { to: '/soil-health', label: t('soilHealth'), icon: FlaskConical },
    { to: '/fertilizer', label: t('fertilizerGuide'), icon: Sparkles },
    { to: '/irrigation', label: t('irrigationGuide'), icon: Droplets },
    { to: '/disease-detection', label: t('diseasePest'), icon: Bug, badge: 'Vision' },
    { to: '/weather', label: t('weatherStation'), icon: CloudSun },
    { to: '/chat', label: t('aiAssistant'), icon: MessageSquareText },
    { to: '/calendar', label: t('farmingCalendar'), icon: CalendarDays },
    { to: '/farms', label: t('myFarms'), icon: Warehouse },
    { to: '/history', label: t('advisoryHistory'), icon: History },
    { to: '/profile', label: t('profile'), icon: UserCircle2 }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-stone-200 flex flex-col justify-between
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top header on mobile */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between md:hidden">
          <span className="font-bold text-stone-900">{t('appTitle')}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Agricultural Suite
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom banner */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50">
          <div className="p-3 bg-gradient-to-br from-emerald-700 to-green-900 rounded-2xl text-white shadow-sm">
            <p className="text-xs font-semibold text-emerald-200">Kisan Sahayata Kendra</p>
            <p className="text-xs text-white font-medium mt-1 leading-snug">
              Powered by Google Gemini 2.5 & ICAR Agronomic Knowledge
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
