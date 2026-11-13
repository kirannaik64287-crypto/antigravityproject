import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { FarmSelector } from './FarmSelector';
import { 
  Sprout, Globe, Menu, X, User, Bell, ChevronDown, Check
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { language, setLanguage, languages, t } = useLanguage();
  const { profile } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 group-hover:text-emerald-700 transition">
                {t('appTitle')}
              </span>
              <span className="hidden lg:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                AI Krishi Sahayak
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Active Farm Selector */}
        <div className="hidden sm:flex items-center">
          <FarmSelector />
        </div>

        {/* Right: Language Switcher & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs sm:text-sm font-medium text-stone-700"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="hidden xs:inline">{languages.find(l => l.code === language)?.native || 'English'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                      language === l.code ? 'text-emerald-700 font-semibold bg-emerald-50/50' : 'text-stone-700'
                    }`}
                  >
                    <span>{l.native} <span className="text-xs text-stone-400">({l.label})</span></span>
                    {language === l.code && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Shortcut */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-stone-800 leading-none truncate max-w-[100px]">
                {profile?.fullName || 'Farmer'}
              </p>
              <p className="text-[10px] text-stone-500 capitalize">{profile?.district || 'India'}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
