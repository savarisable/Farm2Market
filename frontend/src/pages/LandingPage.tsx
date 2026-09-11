import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Users,
  Compass,
  BarChart3,
  Globe,
  ChevronDown,
  Check,
  Activity,
  Layers,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, languageLabel, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImpactSimulatorClick = () => {
    if (isAuthenticated) {
      navigate('/admin/impact');
    } else {
      navigate('/login?redirect=/admin/impact');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-agri-200">
      {/* Top Public Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">🌾</span>
            <div>
              <span className="text-base font-extrabold tracking-tight text-forest-950">
                FARM2MARKET <span className="text-agri-600">SmartMandi</span>
              </span>
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                Direct Agricultural Commerce Platform
              </span>
            </div>
          </div>

          {/* Smooth Scroll Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-forest-900 transition-colors cursor-pointer"
            >
              {t('howItWorks')}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-forest-900 transition-colors cursor-pointer"
            >
              {t('intelligenceEngines')}
            </button>
            <button
              onClick={() => scrollToSection('impact')}
              className="hover:text-forest-900 transition-colors cursor-pointer"
            >
              {t('impactSimulation')}
            </button>
            <button
              onClick={() => navigate('/consumer')}
              className="hover:text-forest-900 transition-colors cursor-pointer text-agri-700 font-bold"
            >
              {t('consumerPortal')}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Globe Language Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>{languageLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in">
                  {[
                    { code: 'en', label: 'English', native: 'English' },
                    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
                    { code: 'mr', label: 'Marathi', native: 'मराठी' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code as SupportedLanguage);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        language === item.code
                          ? 'bg-emerald-100 text-emerald-950 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.native}</span>
                      {language === item.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              {t('signIn')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
              {t('getStarted')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-white via-agri-50/20 to-slate-50">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-xs font-bold text-emerald-900 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{t('docaTagline')}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            {t('fromFarmToMarket')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-900 via-agri-700 to-emerald-600">
              {t('poweredByIntelligence')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-5 leading-relaxed font-normal">
            {t('heroSub')}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto font-bold text-base px-8 py-3 bg-forest-900 hover:bg-forest-800 shadow-md"
            >
              {t('getStarted')} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/consumer')}
              className="w-full sm:w-auto font-semibold text-base px-6 py-3 border-slate-300"
            >
              {t('exploreMarketplace')}
            </Button>
          </div>

          {/* Animated Farm-to-Market Flow Visualization */}
          <div className="mt-14 max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl text-left">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
                  Direct Agricultural Supply Pipeline
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Compressed Value Chain: Farm Gate Direct to Buyer
                </h3>
              </div>
              <Badge variant="success" size="sm">
                4 Intermediary Layers Bypassed
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">👨‍🌾</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Phase 1
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">1. Harvest & Passport</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    AI camera grading assigns Grade A/B and generates the Digital Crop Passport.
                  </p>
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold mt-3">Verified Quality: 94%</p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">⚖️</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      Phase 2
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">2. Fair Price Protection</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Compares buyer offers against real APMC benchmarks and flags bad deals in real time.
                  </p>
                </div>
                <p className="text-[10px] text-sky-700 font-semibold mt-3">Farmer Share: +38%</p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">🚚</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Phase 3
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">3. Direct Freight Transit</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Consolidates orders into direct farm-gate pickups with route tracking.
                  </p>
                </div>
                <p className="text-[10px] text-amber-700 font-semibold mt-3">Spoilage: Reduced 70%</p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">🏢</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Phase 4
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">4. Settlement & Offtake</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Direct institutional delivery to supermarkets, restaurants, or consumer doorsteps.
                  </p>
                </div>
                <p className="text-[10px] text-indigo-700 font-semibold mt-3">T+1 Automated UPI Escrow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
              {t('howItWorks')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Eliminating Information Asymmetry at the Source
            </h2>
            <p className="text-slate-600 mt-3 text-sm">
              Traditional mandi systems trap farmers behind commission agents and opaque grading. Farm2Market AI empowers growers with verified demand, fair price engines, and direct buyer access.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Register & Grade Produce</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Take a photo of harvested Cotton, Soybean, Wheat, Tomato, or Onion using your mobile camera. Our visual model certifies grade and issues a tamper-evident QR passport.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Review Fair Price AI Guidance</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                When buyers make offers, our engine instantly compares against 5-year mandi data and modal prices. If an offer is below fair value, it alerts you with counter-offer tips.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Direct Dispatch & Instant Payout</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Aggregated logistics routes pick up directly at farm gate. Funds held securely in escrow are disbursed immediately upon digital verification.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Intelligence Engines Section */}
      <section id="features" className="py-20 px-4 sm:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
              {t('intelligenceEngines')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Core Agro-Economic Engines
            </h2>
            <p className="text-slate-600 mt-3 text-sm">
              Purpose-built mathematical and AI systems designed specifically for Indian agriculture.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Best Market */}
            <Card className="p-5 flex flex-col justify-between" hoverEffect>
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">1. Net Realization Engine</h3>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Computes gross mandi price minus transport costs</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Calculates real Net Earnings per Quintal</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recommends highest profit destination</li>
                </ul>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="mt-4 justify-start p-0 text-emerald-700 hover:bg-transparent">
                Find Best Market <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Card>

            {/* Card 2: Smart Matching */}
            <Card className="p-5 flex flex-col justify-between" hoverEffect>
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">2. Smart Buyer Matching</h3>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> 6-factor verified buyer match score</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Fair Price evaluation against mandi benchmarks</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Counter-offer negotiation tactics</li>
                </ul>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="mt-4 justify-start p-0 text-sky-700 hover:bg-transparent">
                View Matches <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Card>

            {/* Card 3: Smart Crop Recommendation */}
            <Card className="p-5 flex flex-col justify-between" hoverEffect>
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">3. Smart Crop Recommendation</h3>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> "What Should I Grow?" scientific engine</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Soil, climate & OWID yield benchmarking</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Cultivation cost & net profit modeling</li>
                </ul>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="mt-4 justify-start p-0 text-purple-700 hover:bg-transparent">
                Analyze Land <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Simulation Metrics Banner */}
      <section id="impact" className="py-16 px-4 sm:px-8 bg-forest-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-forest-800 border-b">
            <div>
              <span className="text-xs font-bold text-agri-400 uppercase tracking-wider">
                {t('impactSimulation')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {t('measuredTransformation')}
              </h2>
              <p className="text-xs text-forest-300 mt-1 max-w-xl">
                {t('measuredTransformationSub')}
              </p>
            </div>
            <Button variant="emerald" size="md" onClick={handleImpactSimulatorClick}>
              {t('viewNationalImpact')}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            <div className="p-4 rounded-xl bg-forest-900/50 border border-forest-800">
              <span className="text-3xl sm:text-4xl font-extrabold text-agri-300">+38.2%</span>
              <h4 className="text-xs font-bold text-white mt-2">{t('farmerIncomeIncrease')}</h4>
              <p className="text-[11px] text-forest-300 mt-1">{t('farmerIncomeSub')}</p>
            </div>

            <div className="p-4 rounded-xl bg-forest-900/50 border border-forest-800">
              <span className="text-3xl sm:text-4xl font-extrabold text-sky-300">19.5%</span>
              <h4 className="text-xs font-bold text-white mt-2">{t('consumerSavings')}</h4>
              <p className="text-[11px] text-forest-300 mt-1">{t('consumerSavingsSub')}</p>
            </div>

            <div className="p-4 rounded-xl bg-forest-900/50 border border-forest-800">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300">60%</span>
              <h4 className="text-xs font-bold text-white mt-2">{t('intermediariesEliminated')}</h4>
              <p className="text-[11px] text-forest-300 mt-1">{t('intermediariesSub')}</p>
            </div>

            <div className="p-4 rounded-xl bg-forest-900/50 border border-forest-800">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">91.2%</span>
              <h4 className="text-xs font-bold text-white mt-2">{t('truckCapacity')}</h4>
              <p className="text-[11px] text-forest-300 mt-1">{t('truckCapacitySub')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <span className="font-bold text-slate-800">Farm2Market AI</span>
            <span className="text-slate-400">| Government of India</span>
          </div>
          <p className="text-[11px]">
            Designed for Ministry of Consumer Affairs, Food & Public Distribution • Department of Consumer Affairs (DoCA)
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="hover:text-slate-800 cursor-pointer">{t('signIn')}</button>
            <button onClick={() => navigate('/consumer')} className="hover:text-slate-800 cursor-pointer">{t('consumerPortal')}</button>
            <button onClick={() => navigate('/login?redirect=/admin')} className="hover:text-slate-800 cursor-pointer">DoCA Portal</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
