import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Languages,
  Users,
  Building2,
  Store,
  Phone,
  MapPin,
  TrendingUp,
  Search,
  ExternalLink,
  Award,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getDirectoryApi } from '../../services/api';
import { DirectoryData, SupportedLanguage } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AiAdvisorPage() {
  const [lang, setLang] = useState<SupportedLanguage>('mr');
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<'farmers' | 'buyers' | 'fpos' | 'admins'>('farmers');
  const [searchQuery, setSearchQuery] = useState('');
  const [directory, setDirectory] = useState<DirectoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        const res = await getDirectoryApi();
        if (res.success && res.directory) {
          setDirectory(res.directory);
        }
      } catch (err) {
        console.error('Failed to load directory data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const languageHeaders: Record<SupportedLanguage, { title: string; subtitle: string; coreQuote: string }> = {
    mr: {
      title: 'बहुभाषिक AI फेअर प्राईस सल्लागार',
      subtitle: 'शेतकऱ्यांना वाजवी भाव मिळवून देणारे आणि मध्यस्थांची मक्तेदारी मोडीत काढणारे AI इंजिन',
      coreQuote:
        '“आमच्या AI चे खरे सामर्थ्य फेअर प्राईस इंजिनमध्ये आहे — जेव्हा खरेदीदार कोणतीही ऑफर देतो, तेव्हा आम्ही तात्काळ घाऊक बाजारभाव, लगतच्या मेट्रो मंडई दर आणि अ-दर्जा गुणवत्तेशी त्याची तुलना करतो. जर ऑफर वाजवी मूल्यापेक्षा कमी असेल, तर आम्ही शेतकऱ्याला त्वरित लाल चेतावणी देऊन सावध करतो — जेणेकरून माहितीच्या अभावामुळे शेतकऱ्याचा तोटा होणार नाही.”',
    },
    hi: {
      title: 'बहुभाषी AI फेयर प्राइस सलाहकार',
      subtitle: 'किसानों को उचित मूल्य दिलाने और बिचौलियों की सूचना विषमता समाप्त करने वाला AI इंजन',
      coreQuote:
        '“हमारे AI का असली मूल्य फेयर प्राइस इंजन है — जब कोई खरीदार बोली लगाता है, तो हम तुरंत बाजार औसत, आसपास की मंडियों और क्वालिटी बेंचमार्क से तुलना करते हैं। यदि ऑफर सही मूल्य से कम है, तो हम किसान को तुरंत सतर्क करते हैं — ताकि जानकारी के अभाव में वे कभी भी घाटे का सौदा स्वीकार न करें।”',
    },
    en: {
      title: 'Multilingual Fair Price AI Advisor',
      subtitle: 'Empowering Farmers with Fair Valuations and Eliminating Information Asymmetry',
      coreQuote:
        '“Where our AI adds real value is the Fair Price Engine — when a buyer makes an offer, we instantly compare it against the market average, nearby mandi prices, and quality-adjusted benchmarks. If an offer is below fair value, we flag it to the farmer in real time — so they’re never accepting a bad deal simply because they didn’t know better. That’s the core information-asymmetry problem we’re solving.”',
    },
  };

  const header = languageHeaders[lang];

  // Filtering directory items
  const filteredFarmers = (directory?.farmers || []).filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.primaryCrop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBuyers = (directory?.buyers || []).filter(
    (b) =>
      b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.requirementCrop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFPOs = (directory?.fpos || []).filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.primaryCrops.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdmins = (directory?.admins || []).filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.regionScope.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner with Multilingual Quote */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-300 text-xs font-bold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              DoCA Problem Statement 26033: Fair Price Engine
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/20">
              <Languages className="w-3.5 h-3.5 text-emerald-300 ml-1.5" />
              <button
                onClick={() => setLang('mr')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'mr' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-200 hover:text-white'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'hi' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-200 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-200 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {header.title}
          </h1>
          <p className="text-emerald-100 text-sm max-w-2xl">{header.subtitle}</p>

          {/* Presentation Anchor Quote Block */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-emerald-50 text-xs sm:text-sm leading-relaxed italic relative">
            <span className="text-2xl font-serif text-emerald-300 absolute -top-3 left-4">“</span>
            <p className="pl-4">{header.coreQuote}</p>
          </div>
        </div>
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'mr' ? '१. रिअल-टाइम पडताळणी' : lang === 'hi' ? '1. रियल-टाइम तुलना' : '1. Real-Time Mandi Benchmark'}
            </h3>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {lang === 'mr'
              ? 'खरेदीदाराने दिलेली ऑफर नाशिक, पुणे आणि मुंबई वाशी मंडईतील प्रत्यक्ष दरांशी सेकंदात पडताळली जाते.'
              : lang === 'hi'
              ? 'खरीदार की पेशकश को नासिक, पुणे और मुंबई वाशी मंडी के ताजा दरों से तुरंत आंका जाता है।'
              : 'Every offer is instantly measured against terminal consumption hub clearing prices in Pune and Mumbai.'}
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'mr' ? '२. फसवणूक रोखा (नुकसान चेतावणी)' : lang === 'hi' ? '2. घाटे का अलर्ट' : '2. Real-Time Bad Deal Flag'}
            </h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {lang === 'mr'
              ? 'अयोग्य दरावर तात्काळ लाल चेतावणी देऊन शेतकऱ्याला नेमके किती रुपयांचे नुकसान होईल हे दाखवले जाते.'
              : lang === 'hi'
              ? 'यदि दर कम है, तो तुरंत रेड फ्लैग देकर सटीक वित्तीय घाटे की गणना सामने रख दी जाती है।'
              : 'If an offer is below fair value, we calculate the exact rupee amount being left on the table.'}
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'mr' ? '३. माहिती विषमता संपुष्टात' : lang === 'hi' ? '3. सूचना विषमता समाप्त' : '3. Zero Information Asymmetry'}
            </h3>
            <TrendingUp className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {lang === 'mr'
              ? 'शेतकऱ्याला आत्मविश्वास देणारा अचूक प्रति-प्रस्ताव (Counter-Offer) देऊन नफ्यात ३८% ची वाढ होते.'
              : lang === 'hi'
              ? 'सटीक डेटा के आधार पर किसान बिना झिझक काउंटर-ऑफर रखकर 38% अधिक शुद्ध आय प्राप्त करता है।'
              : 'Empowers farmers with data-backed counter-offers so they never leave money in middlemen pockets.'}
          </p>
        </Card>
      </div>

      {/* Maharashtra Agri Network Directory */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Maharashtra Agricultural Network Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded dataset of 15 Verified Farmers, 10 Bulk Buyers, 6 Registered FPOs, and State DoCA Admins
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, crop, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Directory Tab Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveDirectoryTab('farmers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDirectoryTab === 'farmers'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            👨‍🌾 Verified Farmers ({filteredFarmers.length})
          </button>
          <button
            onClick={() => setActiveDirectoryTab('buyers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDirectoryTab === 'buyers'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🏢 Institutional Buyers ({filteredBuyers.length})
          </button>
          <button
            onClick={() => setActiveDirectoryTab('fpos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDirectoryTab === 'fpos'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🤝 Registered FPOs ({filteredFPOs.length})
          </button>
          <button
            onClick={() => setActiveDirectoryTab('admins')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDirectoryTab === 'admins'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🏛️ DoCA Admins ({filteredAdmins.length})
          </button>
        </div>

        {/* Directory Cards Display */}
        {activeDirectoryTab === 'farmers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFarmers.map((farmer) => (
              <div
                key={farmer.id}
                className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-white transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{farmer.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {farmer.village}, {farmer.district}
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    Trust: {farmer.trustScore}%
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1 text-slate-600">
                  <p>
                    <strong>Crops:</strong> {farmer.primaryCrop} (Primary), {farmer.secondaryCrop}
                  </p>
                  <p>
                    <strong>Holding:</strong> {farmer.landAcres} Acres
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold truncate">
                    FPO: {farmer.fpoAffiliation}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{farmer.id}</span>
                  <span className="text-slate-600 font-sans">{farmer.phone}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeDirectoryTab === 'buyers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuyers.map((buyer) => (
              <div
                key={buyer.id}
                className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-white transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{buyer.businessName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Store className="w-3 h-3 text-sky-600" />
                      {buyer.buyerType} • {buyer.location}
                    </p>
                  </div>
                  <Badge variant="neutral" size="sm">
                    ⭐ {buyer.rating}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1 text-slate-600">
                  <p>
                    <strong>Requirement:</strong> {buyer.requirementCrop}
                  </p>
                  <p>
                    <strong>Volume:</strong> {buyer.volumeKgPerMonth.toLocaleString()} kg / month
                  </p>
                  <p>
                    <strong>Target Budget:</strong>{' '}
                    <strong className="text-emerald-700 font-bold">₹{buyer.budgetPerKg} / kg</strong>
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{buyer.id}</span>
                  <span className="text-slate-600 font-sans">{buyer.phone}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeDirectoryTab === 'fpos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFPOs.map((fpo) => (
              <div
                key={fpo.id}
                className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-white transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{fpo.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {fpo.district} District
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    {fpo.memberFarmers} Farmers
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1 text-slate-600">
                  <p>
                    <strong>Key Crops:</strong> {fpo.primaryCrops}
                  </p>
                  <p>
                    <strong>Contact Person:</strong> {fpo.contactPerson}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">Reg: {fpo.registrationNo}</p>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{fpo.id}</span>
                  <span className="text-slate-600 font-sans">{fpo.phone}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeDirectoryTab === 'admins' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-white transition-all space-y-2 shadow-2xs"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{admin.name}</h4>
                  <p className="text-xs text-purple-700 font-semibold mt-0.5">{admin.role}</p>
                  <p className="text-[11px] text-slate-500">{admin.regionScope}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1 text-slate-600">
                  <p className="truncate">{admin.email}</p>
                  <p>{admin.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
