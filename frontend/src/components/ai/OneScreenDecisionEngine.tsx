import React, { useState, useEffect } from 'react';
import { WowMomentCockpit } from '../../types';
import { getWowCockpitApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AIInsightBadge } from '../ui/AIInsightBadge';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Users,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  QrCode,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OneScreenDecisionEngineProps {
  onSellToBuyer?: () => void;
  onOpenPassport?: (passportCode: string) => void;
}

export const OneScreenDecisionEngine: React.FC<OneScreenDecisionEngineProps> = ({
  onSellToBuyer,
  onOpenPassport,
}) => {
  const [data, setData] = useState<WowMomentCockpit | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, tcrop, tcity, tgrade } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    getWowCockpitApi()
      .then((res) => {
        if (res?.success && res.wowCockpit) {
          setData(res.wowCockpit);
        }
      })
      .catch(() => {
        setData({
          harvest: {
            cropName: 'Cotton',
            quantityKg: 1500,
            location: 'Amravati, Maharashtra',
            grade: 'GRADE_A',
            harvestWindow: 'Harvest Complete',
            shelfLifeHours: 720,
            passportCode: 'MH-AMR-COT-7782',
          },
          marketIntelligence: {
            demandLevel: 'HIGH 🔥',
            currentPrice: 86.5,
            predictedPrice: 91.0,
            trendPercent: 5.2,
            fairPriceRange: '₹88–93/kg',
            recommendation: 'SELL DIRECTLY TO MILLS',
            explanation: 'Demand across Vidarbha spinning mills is accelerating with tight regional arrivals.',
          },
          bestMarket: {
            marketName: 'Amravati APMC Cotton Yard',
            grossPrice: 86.5,
            transportCost: 1.0,
            platformFee: 0.5,
            netRealization: 85.0,
            totalPotentialNet: 127500,
            explanation: 'Proximity advantage: low transport deduction yields maximum net realization.',
          },
          bestBuyer: {
            buyerName: 'Maharashtra Agro Traders',
            matchScore: 96,
            offerPrice: 87.0,
            distanceKm: 25,
            requiredDate: 'Within 2 days',
            qualityReq: 'Grade A',
          },
          smartLogistics: {
            status: 'Consolidated Vidarbha freight available.',
            truckCapacityKg: 5000,
            truckUtilizedKg: 4700,
            utilizationPercent: 94,
            estimatedSavingsAmount: 4200,
            separateFreight: 7800,
            consolidatedFreight: 3600,
          },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <Card className="p-8 text-center bg-white border-slate-200 animate-pulse">
        <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-3 animate-spin" />
        <h4 className="text-sm font-bold text-slate-700">{t('analyzingLand')}</h4>
      </Card>
    );
  }

  const { harvest, marketIntelligence, bestMarket, bestBuyer, smartLogistics } = data;

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 text-white p-5 sm:p-7 shadow-xl border border-forest-800/80 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-agri-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-forest-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              {t('decisionEngineHeader')}
            </h2>
            <AIInsightBadge confidence={96} label="AUTONOMOUS COCKPIT" className="hidden sm:inline-flex" />
          </div>
          <p className="text-xs text-forest-300 mt-1">
            {t('decisionEngineSub')}
          </p>
        </div>

        {/* Harvest Summary Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-900/80 border border-forest-700/60 text-xs">
          <span className="font-bold text-agri-300">{t('harvestDetailsTitle')}:</span>
          <span className="text-white font-semibold">
            {tcrop(harvest.cropName)} • {harvest.quantityKg.toLocaleString()} kg • {tcity(harvest.location)}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 ml-1">
            {tgrade(harvest.grade)}
          </span>
        </div>
      </div>

      {/* Cockpit 4-Column Decision Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Module 1: AI Market Intelligence */}
        <div className="rounded-xl p-4 bg-forest-900/60 border border-forest-800 flex flex-col justify-between hover:border-forest-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-forest-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-agri-400" /> {t('marketIntelligenceTitle')}
              </span>
              <Badge variant="success" size="sm" className="bg-emerald-950 text-emerald-300 border-emerald-700">
                {marketIntelligence.demandLevel}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-forest-800/60">
                <span className="text-forest-300">{t('currentMandiRate')}:</span>
                <span className="font-bold text-white">₹{marketIntelligence.currentPrice}/kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest-800/60">
                <span className="text-forest-300">{t('predictedRate3Days')}:</span>
                <span className="font-bold text-agri-300">₹{marketIntelligence.predictedPrice}/kg (↑ {marketIntelligence.trendPercent}%)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-forest-300">{t('fairPriceRangeLabel')}:</span>
                <span className="font-bold text-white">{marketIntelligence.fairPriceRange}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-forest-800/60">
            <p className="text-[11px] text-agri-200 leading-snug">
              💡 <span className="font-semibold text-white">{t('aiRecommendationLabel')}:</span> {marketIntelligence.recommendation}
            </p>
          </div>
        </div>

        {/* Module 2: Best Market */}
        <div className="rounded-xl p-4 bg-forest-900/60 border border-forest-800 flex flex-col justify-between hover:border-forest-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-forest-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-agri-400" /> {t('bestMarketTitle')}
              </span>
              <span className="text-[10px] font-bold text-agri-300 uppercase tracking-wider px-1.5 py-0.5 rounded bg-agri-950 border border-agri-800">
                {t('proximityNet')}
              </span>
            </div>

            <div className="mb-2">
              <h4 className="text-sm font-bold text-white">{tcity(bestMarket.marketName)}</h4>
              <p className="text-[11px] text-forest-300">{bestMarket.distanceKm ? `${bestMarket.distanceKm} km • ` : ''}{t('calculatedAfterFreight')}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>{t('grossMarketPrice')}:</span>
                <span>₹{bestMarket.grossPrice}/kg</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>{t('transportFreight')}:</span>
                <span className="text-rose-300">-₹{bestMarket.transportCost}/kg</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>{t('platformTechFee')}:</span>
                <span className="text-slate-400">-₹{bestMarket.platformFee}/kg</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-forest-800/80 font-bold text-agri-300 text-sm">
                <span>{t('netRealizationRate')}:</span>
                <span>₹{bestMarket.netRealization}/kg</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2">
            <button
              onClick={() => navigate('/best-market')}
              className="text-[11px] font-semibold text-agri-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              {t('viewMandiDetails')} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Module 3: Best Buyer */}
        <div className="rounded-xl p-4 bg-forest-900/60 border border-forest-800 flex flex-col justify-between hover:border-forest-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-forest-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-agri-400" /> {t('bestMatchedBuyerTitle')}
              </span>
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                🥇 {bestBuyer.matchScore}% Match
              </span>
            </div>

            <div className="mb-2">
              <h4 className="text-sm font-bold text-white truncate">{bestBuyer.buyerName}</h4>
              <p className="text-[11px] text-forest-300">{t('verifiedCorporateBuyer')}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-0.5 border-b border-forest-800/60">
                <span className="text-forest-300">{t('buyerOfferRate')}:</span>
                <span className="font-bold text-agri-300 text-sm">₹{bestBuyer.offerPrice}/kg</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-forest-800/60">
                <span className="text-forest-300">{t('distance')}:</span>
                <span className="text-white font-medium">{bestBuyer.distanceKm} km</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-forest-300">{t('escrowStatus')}:</span>
                <span className="text-emerald-300 font-semibold">{t('escrowSecured')}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2">
            <button
              onClick={() => navigate('/negotiations')}
              className="text-[11px] font-semibold text-agri-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              {t('fairPriceNegotiation')} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Module 4: Smart Logistics */}
        <div className="rounded-xl p-4 bg-forest-900/60 border border-forest-800 flex flex-col justify-between hover:border-forest-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-forest-300 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-agri-400" /> {t('smartLogisticsTitle')}
              </span>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                CONSOLIDATED
              </span>
            </div>

            <div className="mb-2">
              <h4 className="text-sm font-bold text-white">Direct Transit Route #9021</h4>
              <p className="text-[11px] text-forest-300">{tcity('Amravati')} ➔ {tcity('Nagpur')}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-0.5 border-b border-forest-800/60">
                <span className="text-forest-300">{t('truckFillRate')}:</span>
                <span className="font-bold text-emerald-300">{smartLogistics.utilizationPercent}%</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-forest-800/60">
                <span className="text-forest-300">{t('standardFreight')}:</span>
                <span className="text-slate-400 line-through">₹{smartLogistics.separateFreight.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold text-agri-300">
                <span>{t('logisticsSavings')}:</span>
                <span>₹{smartLogistics.estimatedSavingsAmount.toLocaleString()} {t('savedAmount')}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2">
            <button
              onClick={() => navigate('/logistics')}
              className="text-[11px] font-semibold text-agri-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              {t('logistics')} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 mt-6 pt-5 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-forest-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t('aiFairPriceVerified')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-forest-300">
            <ShieldCheck className="w-4 h-4 text-agri-400" />
            <span>{t('docaEscrowProtected')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {harvest.passportCode && onOpenPassport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenPassport(harvest.passportCode)}
              className="border-forest-700 bg-forest-900/60 text-forest-200 hover:bg-forest-800 hover:text-white flex-1 sm:flex-none"
            >
              <QrCode className="w-3.5 h-3.5" />
              {t('cropPassport')}
            </Button>
          )}

          <Button
            variant="emerald"
            size="sm"
            onClick={onSellToBuyer || (() => navigate('/negotiations'))}
            className="bg-agri-500 hover:bg-agri-600 text-forest-950 font-extrabold shadow-md flex-1 sm:flex-none"
          >
            <DollarSign className="w-3.5 h-3.5" />
            {t('acceptBuyerOfferBtn')}
          </Button>
        </div>
      </div>
    </div>
  );
};
