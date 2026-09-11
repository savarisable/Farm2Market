import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CropBatch, Order } from '../../types';
import { getMyCropsApi, getOrdersApi, getOffersApi } from '../../services/api';
import { OneScreenDecisionEngine } from '../../components/ai/OneScreenDecisionEngine';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CropPassportModal } from '../../components/common/CropPassportModal';
import {
  Sprout,
  ShoppingBag,
  FileText,
  Wallet,
  TrendingUp,
  MapPin,
  Users,
  ArrowRight,
  PlusCircle,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, tcrop, tcity, tgrade, tstatus } = useLanguage();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<CropBatch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offersCount, setOffersCount] = useState(2);
  const [selectedPassport, setSelectedPassport] = useState<any | null>(null);
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  useEffect(() => {
    getMyCropsApi()
      .then((res) => {
        if (res?.success && res.crops) setCrops(res.crops);
      })
      .catch(() => {});

    getOrdersApi()
      .then((res) => {
        if (res?.success && res.orders) setOrders(res.orders);
      })
      .catch(() => {});

    getOffersApi()
      .then((res) => {
        if (res?.success && res.offers) setOffersCount(res.offers.length);
      })
      .catch(() => {});
  }, []);

  const totalEarnings = user?.farmerProfile?.totalEarnings || 285000;
  const activeOrdersCount = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length || 1;
  const farmerCity = user?.location || crops[0]?.location || 'Amravati, Maharashtra';
  const primaryCrop = crops[0]?.cropName || 'Cotton';

  const handleOpenPassport = (passportCode: string) => {
    const found = crops.find((c) => c.passportCode === passportCode);
    if (found?.passport) {
      setSelectedPassport(found.passport);
    } else {
      setSelectedPassport({
        passportCode,
        cropName: primaryCrop,
        farmerName: user?.name || 'Pranav',
        farmLocation: farmerCity,
        harvestDate: new Date().toISOString(),
        grade: 'GRADE_A (94% Quality Score)',
        shelfLifeHours: 720,
        currentOwner: `${user?.name || 'Pranav'} (Origin Farm)`,
        destination: 'Maharashtra Agro Traders / Direct Mandi Network',
        transportType: 'Direct Freight Corridor',
        provenanceJson: JSON.stringify([
          { stage: 'Farm Seeding', date: '2026-06-20', detail: 'Verified certified seed lot on Regur Black Soil' },
          { stage: 'AI Quality Assessment', date: '2026-09-08', detail: 'Optical scan: Grade A, 94% Quality Score' },
          { stage: 'Scheduled Harvest', date: '2026-09-10', detail: 'Harvest complete, ready for dispatch' },
        ]),
      });
    }
    setIsPassportOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('goodMorning')}, {user?.name || 'Pranav'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('farmHolding')}: <strong className="text-slate-700">{user?.farmerProfile?.farmSizeAcres || 5.0} {t('acres')}</strong> {t('inLocation')}{' '}
            <strong className="text-slate-700">{tcity(farmerCity)}</strong> • {t('trustScore')}:{' '}
            <strong className="text-emerald-700">{user?.farmerProfile?.trustScore || 96}/100</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/market-intelligence')}>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            {t('marketIntel')}
          </Button>
          <Button variant="emerald" size="sm" onClick={() => navigate('/my-crops')}>
            <PlusCircle className="w-4 h-4" />
            {t('addNewBatch')}
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('myCrops')}
          value={`${crops.length || 2} ${t('registeredCropsTitle').includes('लॉट') ? 'लॉट' : 'Batches'}`}
          subtitle={crops.map((c) => tcrop(c.cropName)).join(', ') || tcrop(primaryCrop)}
          icon={<Sprout className="w-5 h-5 text-emerald-600" />}
          variant="agri"
        />
        <StatCard
          title={t('offersReceivedCard')}
          value={`${offersCount} ${t('receivedOffers')}`}
          subtitle={`Latest: ₹87.0/kg (${tcity('Nagpur')})`}
          icon={<FileText className="w-5 h-5 text-sky-600" />}
          trend={{ value: '+2 new', isPositive: true }}
        />
        <StatCard
          title={t('totalEarningsCard')}
          value={`₹${totalEarnings.toLocaleString()}`}
          subtitle={t('netRealizationSubtitle')}
          icon={<Wallet className="w-5 h-5 text-forest-800" />}
          trend={{ value: '+38% vs APMC', isPositive: true }}
        />
        <StatCard
          title={t('activeOrdersCard')}
          value={`${activeOrdersCount}`}
          subtitle={t('activeOrderSubtitle')}
          icon={<ShoppingBag className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* One-Screen Decision Engine */}
      <OneScreenDecisionEngine
        onSellToBuyer={() => navigate('/negotiations')}
        onOpenPassport={handleOpenPassport}
      />

      {/* Market Opportunity Highlight Section */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50/70 via-white to-white border-emerald-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="ai" size="sm">
                MARKET OPPORTUNITY
              </Badge>
              <span className="text-xs font-bold text-slate-800">
                {t('cropLabel')}: {tcrop(primaryCrop)} ({tgrade('GRADE_A')})
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {tcity(farmerCity)} & {tcity('Nagpur')}: Current: ₹86.5/kg ➔ Predicted: ₹91.0/kg (↑ 5.2%)
            </h3>
            <p className="text-xs text-slate-600">
              "Demand from Vidarbha and Nagpur spinning mills is accelerating. Modal price is firm with low arrival volumes. Recommended to accept premium offers."
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full lg:w-auto">
            <Button variant="primary" size="sm" onClick={() => navigate('/find-buyers')} className="flex-1 sm:flex-none">
              <Users className="w-3.5 h-3.5" /> {t('findBuyers')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/best-market')} className="flex-1 sm:flex-none">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {t('findBestMarket')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/market-intelligence')} className="flex-1 sm:flex-none">
              <TrendingUp className="w-3.5 h-3.5" /> {t('marketIntel')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Crops Quick View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>{t('registeredCropsTitle')}</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">{t('registeredCropsSub')}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/my-crops')}>
              {t('myCrops')} ({crops.length || 2}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {crops.slice(0, 3).map((crop) => (
              <div
                key={crop.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">{tcrop(crop.cropName)}</span>
                    <Badge variant="success" size="sm">
                      {tgrade(crop.grade)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>{crop.quantityKg.toLocaleString()} kg</strong> • {tcity(crop.location)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Harvest: {new Date(crop.harvestDate).toLocaleDateString()}
                  </p>

                  <div className="mt-3 p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900">
                    <span className="font-semibold">{t('aiRecommendationLabel')}:</span> ₹86.5–93.0/kg ({tstatus(crop.status)})
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenPassport(crop.passportCode)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" /> {t('cropPassport')}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => navigate('/best-market')}>
                      {t('findBestMarket')}
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => navigate('/find-buyers')}>
                      {t('findBuyers')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digital Crop Passport Modal */}
      <CropPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        passport={selectedPassport}
      />
    </div>
  );
};
