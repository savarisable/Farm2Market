import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BestMarketResult, MarketOption } from '../../types';
import { getBestMarketApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin,
  Truck,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';

export const BestMarketPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tcrop, tcity, tgrade } = useLanguage();

  const userDistrict = user?.location?.toLowerCase().includes('amravati')
    ? 'Amravati'
    : user?.location?.toLowerCase().includes('akola')
    ? 'Akola'
    : user?.location?.toLowerCase().includes('nagpur')
    ? 'Nagpur'
    : user?.location?.toLowerCase().includes('pune')
    ? 'Pune'
    : 'Amravati';

  const defaultCrop = searchParams.get('crop') || (userDistrict === 'Amravati' ? 'Cotton' : 'Tomato');
  const [origin, setOrigin] = useState(userDistrict);
  const [crop, setCrop] = useState(defaultCrop);
  const [quantity, setQuantity] = useState(searchParams.get('qty') || '1500');
  const [grade, setGrade] = useState('GRADE_A');

  useEffect(() => {
    if (userDistrict && !searchParams.get('origin')) {
      setOrigin(userDistrict);
    }
  }, [userDistrict]);

  const [marketResult, setMarketResult] = useState<BestMarketResult | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateMarkets = () => {
    setLoading(true);
    getBestMarketApi(origin, crop, parseFloat(quantity) || 1500, grade)
      .then((res) => {
        if (res) setMarketResult(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    calculateMarkets();
  }, [origin, crop, grade]);

  const allMarkets = marketResult
    ? [marketResult.bestMarket, ...marketResult.alternativeMarkets]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('bestMarketHeading')}
            </h1>
            <AIInsightBadge confidence={92} label={t('netRealizationEngine')} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('bestMarketSub')}
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => navigate('/find-buyers')}>
          {t('findBuyers')}
        </Button>
      </div>

      {/* Input Parameters Form */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <Select
            label={t('originDistrict')}
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            options={[
              { value: 'Amravati', label: tcity('Amravati') },
              { value: 'Akola', label: tcity('Akola') },
              { value: 'Nagpur', label: tcity('Nagpur') },
              { value: 'Nashik', label: tcity('Nashik') },
              { value: 'Pune', label: tcity('Pune') },
            ]}
          />

          <Select
            label={t('selectCrop')}
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            options={[
              { value: 'Cotton', label: tcrop('Cotton') },
              { value: 'Soybean', label: tcrop('Soybean') },
              { value: 'Wheat', label: tcrop('Wheat') },
              { value: 'Tomato', label: tcrop('Tomato') },
              { value: 'Onion', label: tcrop('Onion') },
              { value: 'Orange', label: tcrop('Orange') },
              { value: 'Banana', label: tcrop('Banana') },
            ]}
          />

          <Input
            label={t('harvestQuantityKg')}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Select
            label={t('qualityGrade')}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            options={[
              { value: 'GRADE_A', label: tgrade('GRADE_A') },
              { value: 'GRADE_B', label: tgrade('GRADE_B') },
              { value: 'GRADE_C', label: tgrade('GRADE_C') },
            ]}
          />

          <Button variant="emerald" size="md" onClick={calculateMarkets} isLoading={loading} className="w-full">
            {t('calculateNetRealization')}
          </Button>
        </div>
      </Card>

      {/* BEST MARKET HIGHLIGHT BANNER */}
      {marketResult && (
        <div className="rounded-2xl p-6 bg-gradient-to-r from-forest-950 via-forest-900 to-agri-950 text-white shadow-xl border border-forest-800 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-amber-400 text-slate-950 shadow-xs">
                  🎯 {t('recommendedMandi')}
                </span>
                <span className="text-xs text-agri-300 font-semibold">{t('proximityNet')}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {tcity(marketResult.bestMarket.marketName)} ({tcity(marketResult.bestMarket.region)})
              </h2>

              <p className="text-xs sm:text-sm text-forest-200 leading-relaxed">
                "{marketResult.rationale}"
              </p>

              <div className="flex items-center gap-4 pt-1 text-xs text-forest-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-agri-400" /> {t('distance')}: {marketResult.bestMarket.distanceKm} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-agri-400" /> Transit: ~{marketResult.bestMarket.transitHours}h
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t('pooledTruckRoute')}
                </span>
              </div>
            </div>

            {/* Big Net Realization Number */}
            <div className="p-4 rounded-xl bg-forest-900/90 border border-forest-700/80 text-center md:text-right min-w-[200px]">
              <span className="text-xs text-forest-300 uppercase tracking-wider block font-medium">{t('netRealizationRate')}</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-agri-300 my-1">
                ₹{marketResult.bestMarket.netRealizationPerKg}
                <span className="text-sm font-normal text-forest-200"> / kg</span>
              </div>
              <p className="text-xs font-bold text-white">
                {t('estimatedBatchNet')}: ₹{marketResult.bestMarket.totalPotentialNetRevenue.toLocaleString()}
              </p>
              <Button
                variant="emerald"
                size="sm"
                onClick={() => navigate('/find-buyers')}
                className="mt-3 w-full font-bold"
              >
                {t('findBuyers')} ({tcity(marketResult.bestMarket.region)})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Net Realization Comparative Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t('alternativeMarkets')}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('netRealizationRate')} = {t('grossMarketPrice')} – {t('transportFreight')} – {t('platformTechFee')}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">{t('marketIntel')}</th>
                  <th className="py-3 px-4">{t('originDistrict')}</th>
                  <th className="py-3 px-4">{t('distance')}</th>
                  <th className="py-3 px-4">{t('grossMarketPrice')}</th>
                  <th className="py-3 px-4">{t('transportFreight')}</th>
                  <th className="py-3 px-4">{t('platformTechFee')}</th>
                  <th className="py-3 px-4 font-bold text-emerald-800">{t('netRealizationRate')}</th>
                  <th className="py-3 px-4">{t('estimatedBatchNet')}</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allMarkets.map((m) => (
                  <tr
                    key={m.marketId}
                    className={`hover:bg-slate-50 transition-colors ${
                      m.isBestMarket ? 'bg-emerald-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {m.isBestMarket && <span className="text-amber-500">🥇</span>}
                        <div>
                          <span className="font-bold text-slate-900 block">{tcity(m.marketName)}</span>
                          <span className="text-[11px] text-slate-400">{m.notes}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{tcity(m.region)}</td>
                    <td className="py-3 px-4 text-slate-600">{m.distanceKm} km</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">₹{m.grossPricePerKg}/kg</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">-₹{m.transportCostPerKg}/kg</td>
                    <td className="py-3 px-4 text-slate-500">-₹{m.platformFeePerKg}/kg</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-extrabold text-emerald-700">
                        ₹{m.netRealizationPerKg}/kg
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{m.totalPotentialNetRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={m.isBestMarket ? 'emerald' : 'outline'}
                        size="sm"
                        onClick={() => navigate('/find-buyers')}
                      >
                        {t('findBuyers')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transparent Logic Callout */}
      {marketResult && (
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-900 mb-0.5">Economic Rationale:</span>
            <p className="leading-relaxed">{marketResult.interDistrictArbitrageInsight}</p>
          </div>
        </div>
      )}
    </div>
  );
};
