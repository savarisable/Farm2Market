import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getRequirementsApi, getOrdersApi } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  PlusCircle,
  ShoppingBag,
  Store,
  Truck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, tcrop, tcity, tstatus } = useLanguage();
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getRequirementsApi(), getOrdersApi()])
      .then(([reqRes, ordRes]) => {
        if (reqRes?.success && reqRes.requirements) setRequirements(reqRes.requirements);
        if (ordRes?.success && ordRes.orders) setOrders(ordRes.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Buyer Cockpit: {user?.buyerProfile?.businessName || 'Pune Retail Hub'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct farm-gate procurement network • Trust Score:{' '}
            <strong className="text-emerald-700">{user?.buyerProfile?.trustScore || 96}/100</strong> • Escrow Protected
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/bulk-marketplace')}>
            <Layers className="w-4 h-4 text-emerald-600" /> {t('offersNegotiations')}
          </Button>
          <Button variant="emerald" size="sm" onClick={() => navigate('/post-requirement')}>
            <PlusCircle className="w-4 h-4" /> {t('addNewBatch')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('registeredCropsTitle')}
          value={`${requirements.length || 3} Posts`}
          subtitle={requirements.map((r) => tcrop(r.cropName)).slice(0, 3).join(', ') || 'Cotton, Soybean, Wheat'}
          icon={<ShoppingBag className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          title="Procured Volume"
          value="18.5 Tonnes"
          subtitle={t('netRealizationSubtitle')}
          trend={{ value: '+32%', isPositive: true }}
          icon={<Store className="w-5 h-5 text-emerald-600" />}
          variant="agri"
        />
        <StatCard
          title={t('logisticsSavings')}
          value="19.5%"
          subtitle="Direct farm-gate realization"
          trend={{ value: '₹48,200 saved', isPositive: true }}
        />
        <StatCard
          title={t('activeOrdersCard')}
          value={`${orders.length || 2} Active`}
          subtitle={t('activeOrderSubtitle')}
          icon={<Truck className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Active Buyer Requirements Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>{t('buyerMatchingTitle')}</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">{t('buyerMatchingSub')}</p>
            </div>
            <Button variant="emerald" size="sm" onClick={() => navigate('/post-requirement')}>
              + {t('addNewBatch')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requirements.slice(0, 3).map((req) => (
              <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{tcrop(req.cropName)}</span>
                  <Badge variant="info" size="sm">
                    {tstatus(req.status)}
                  </Badge>
                </div>
                <div className="text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>{t('targetVolume')}:</span>
                    <strong className="text-slate-800">{req.quantityKg.toLocaleString()} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('budgetRate')}:</span>
                    <strong className="text-emerald-700">₹{req.budgetPricePerKg}/kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('deliveryDate')}:</span>
                    <span>{new Date(req.requiredByDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 font-semibold">{t('escrowSecured')}</span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/farmer-marketplace')}>
                    {t('viewDetails')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reverse Marketplace Quick Matching Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">{t('buyerMatchingTitle')}</span>
          <h3 className="text-lg font-bold text-white mt-1">
            2,000 kg {tcrop('Cotton')} & {tcrop('Soybean')} ({t('aiFairPriceVerified')})
          </h3>
          <p className="text-xs text-sky-200 mt-1">
            {t('docaEscrowProtected')} • {t('pooledTruckRoute')}
          </p>
        </div>
        <Button variant="emerald" size="md" onClick={() => navigate('/farmer-marketplace')}>
          {t('findBuyers')} <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
