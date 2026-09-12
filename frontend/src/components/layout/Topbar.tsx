import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Role, SupportedLanguage } from '../../types';
import { Search, Bell, MapPin, Globe, ChevronDown, Check, User as UserIcon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  onOpenProfile?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenProfile,
  onOpenMobileSidebar,
}) => {

  const { user, role } = useAuth();
  const { language, setLanguage, languageLabel, t, tcity } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    navigate(`/farmer-marketplace?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between shadow-xs gap-2">
      {/* Mobile Hamburger — visible only on mobile */}
      <button
        onClick={onOpenMobileSidebar}
        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Input */}
      <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-sm lg:max-w-md">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-slate-100/90 border border-slate-200/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all"
            />
          </div>
        </form>

        {/* Search Suggestion Dropdown */}
        {isSearchOpen && searchQuery && (
          <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 animate-in fade-in">
            <p className="text-[10px] font-semibold text-slate-400 px-2.5 py-1 uppercase tracking-wider">Quick Suggestions</p>
            <button
              onClick={() => {
                navigate('/best-market');
                setIsSearchOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Tomato in Pune / Mumbai</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Best Market (₹26 net)</span>
            </button>
            <button
              onClick={() => {
                navigate('/find-buyers');
                setIsSearchOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Pune Retail Hub</span>
              <span className="text-[10px] text-emerald-600 font-semibold">94% Match</span>
            </button>
            <button
              onClick={() => {
                navigate('/orders');
                setIsSearchOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Active Shipments (MH-15-EG-4482)</span>
              <span className="text-[10px] text-sky-600 font-semibold">In Transit</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Controls: Globe Language Selector + Location + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Official Globe Language Dropdown (English, हिन्दी, मराठी) */}
        <div className="relative" ref={langMenuRef}>
          <button
            type="button"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/90 text-emerald-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Select Platform Language / भाषा निवडा"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{languageLabel}</span>
            <ChevronDown className={`w-3 h-3 text-emerald-700 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Language / भाषा निवडा
              </div>
              {[
                { code: 'en' as SupportedLanguage, label: 'English', native: 'English' },
                { code: 'hi' as SupportedLanguage, label: 'Hindi', native: 'हिन्दी' },
                { code: 'mr' as SupportedLanguage, label: 'Marathi', native: 'मराठी' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    language === item.code
                      ? 'bg-emerald-100/80 text-emerald-950 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.native}</span>
                    <span className="text-[11px] text-slate-400 font-normal">({item.label})</span>
                  </div>
                  {language === item.code && <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs border border-slate-200/60">
          <MapPin className="w-3.5 h-3.5 text-forest-700" />
          <span className="font-medium text-[11px]">{user?.location ? tcity(user.location) : tcity('Amravati, Maharashtra')}</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Open notification drawer"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity cursor-pointer text-left"
          title="Click to edit profile"
        >
          <div className="w-8 h-8 rounded-full bg-forest-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 font-medium">{role}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

