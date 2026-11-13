import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, Sprout, Bug, CloudSun, MessageSquareText } from 'lucide-react';

export const BottomNav = () => {
  const { t } = useLanguage();

  const items = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/crop-recommendation', label: 'Crops', icon: Sprout },
    { to: '/disease-detection', label: 'Doctor', icon: Bug },
    { to: '/weather', label: 'Weather', icon: CloudSun },
    { to: '/chat', label: 'AI Chat', icon: MessageSquareText }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-3 flex justify-around items-center shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[11px] font-medium transition
              ${isActive ? 'text-emerald-700 font-bold' : 'text-stone-500 hover:text-stone-900'}
            `}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
