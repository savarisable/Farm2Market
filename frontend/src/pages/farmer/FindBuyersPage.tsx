import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BuyerMatchItem } from '../../types';
import { getBestBuyersApi, createOfferApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const COMMON_CROPS = [
  'Cotton',
  'Soybean',
  'Tomato',
  'Onion',
  'Wheat',
  'Orange',
  'Banana',
  'Sugarcane',
];

export const FindBuyersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    : user?.location?.toLowerCase().includes('nashik')
    ? 'Nashik'
    : 'Amravati';

  const initialCrop = searchParams.get('crop') || (userDistrict === 'Amravati' ? 'Cotton' : 'Tomato');
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [origin, setOrigin] = useState(userDistrict);
  const [quantity, setQuantity] = useState('2000');
  const [grade, setGrade] = useState('GRADE_A');

  const [buyers, setBuyers] = useState<BuyerMatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Send Offer Modal state
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerMatchItem | null>(null);
  const [offerPrice, setOfferPrice] = useState('88');
  const [offerQuantity, setOfferQuantity] = useState('2000');
  const [offerNotes, setOfferNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchBuyers = () => {
    setLoading(true);
    const expectedPrice =
      selectedCrop === 'Cotton'
        ? 86
        : selectedCrop === 'Soybean'
        ? 48
        : selectedCrop === 'Wheat'
        ? 32
        : selectedCrop === 'Orange'
        ? 46
        : selectedCrop === 'Banana'
        ? 22
        : selectedCrop === 'Sugarcane'
        ? 3.5
        : 28;

    getBestBuyersApi(origin, selectedCrop, parseFloat(quantity) || 2000, grade, expectedPrice)
      .then((res) => {
        if (res?.success && res.matches) {
          setBuyers(res.matches);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBuyers();
  }, [origin, selectedCrop, grade]);

  const getFairCorridor = (cropName: string) => {
    switch (cropName) {
      case 'Cotton':
        return '₹86 – ₹93/kg';
      case 'Soybean':
        return '₹48 – ₹54/kg';
      case 'Wheat':
        return '₹31 – ₹35/kg';
      case 'Orange':
        return '₹44 – ₹52/kg';
      case 'Onion':
        return '₹28 – ₹34/kg';
      case 'Banana':
        return '₹20 – ₹25/kg';
      case 'Sugarcane':
        return '₹3.2 – ₹3.8/kg';
      default:
        return '₹27 – ₹32/kg';
    }
  };

  const handleOpenOfferModal = (buyer: BuyerMatchItem) => {
    setSelectedBuyer(buyer);
    setOfferPrice(String(buyer.offeredPricePerKg));
    setOfferQuantity(String(buyer.requiredQuantityKg || quantity));
    setOfferNotes(`Direct farm-gate dispatch from ${origin}. ${grade.replace('_', ' ')} certified produce.`);
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyer) return;
    setIsSending(true);
    try {
      const res = await createOfferApi({
        requirementId: selectedBuyer.requirementId || selectedBuyer.buyerId,
        receiverId: selectedBuyer.buyerUserId || selectedBuyer.buyerId,
        offeredPricePerKg: parseFloat(offerPrice),
        quantityKg: parseFloat(offerQuantity),
        notes: offerNotes,
      });
      if (res?.success) {
        setSuccessMessage(`Trade offer of ₹${offerPrice}/kg sent successfully to ${selectedBuyer.businessName}!`);
        setTimeout(() => {
          setSelectedBuyer(null);
          setSuccessMessage('');
          navigate('/negotiations');
        }, 1200);
      }
    } catch (err) {
      // error handling
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('buyerMatchingTitle')}
            </h1>
            <AIInsightBadge confidence={96} label="6-FACTOR ENGINE" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('buyerMatchingSub')}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/negotiations')}>
          {t('viewNegotiations')}
        </Button>
      </div>

      {/* Crop & Origin Filter Bar */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">{t('filterByCrop')}:</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">{t('originDistrict')}:</span>
            <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{tcity(origin)}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {COMMON_CROPS.map((c) => {
            const isSelected = selectedCrop === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-forest-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tcrop(c)}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Buyer Match Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-56 bg-slate-100/70" />
          ))}
        </div>
      ) : buyers.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          <p>{t('noBuyersFound')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {buyers.map((buyer) => (
            <Card
              key={buyer.buyerId}
              className={`p-5 flex flex-col justify-between ${
                buyer.ranking === 1 ? 'border-2 border-emerald-500 shadow-md ring-2 ring-emerald-100' : ''
              }`}
              hoverEffect
            >
              <div>
                {/* Header: Rank, Business Name, Match % */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-forest-900 text-white flex items-center justify-center font-bold text-xs">
                      #{buyer.ranking}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        {buyer.businessName}
                        {buyer.ranking === 1 && <span className="text-sm">🥇</span>}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {tcity(buyer.location)} ({buyer.distanceKm} km)
                      </p>
                    </div>
                  </div>

                  {/* Big Match Score */}
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      {buyer.matchScorePercent}%
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">{t('matchScoreLabel')}</p>
                  </div>
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('budgetRate')}</span>
                    <span className="text-sm font-extrabold text-emerald-700">₹{buyer.offeredPricePerKg}/kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('targetVolume')}</span>
                    <span className="font-bold text-slate-800">{buyer.requiredQuantityKg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('deliveryDate')}</span>
                    <span className="font-bold text-slate-800">{buyer.requiredByDate}</span>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    Rate: {buyer.scoreBreakdown.priceScore}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {t('distance')}: {buyer.scoreBreakdown.distanceScore}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    Quality: {buyer.scoreBreakdown.qualityScore}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold ml-auto">
                    Trust: {buyer.trustScore}/100
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 italic bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  💡 {buyer.highlightReason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/negotiations')}
                >
                  {t('viewDetails')}
                </Button>
                <Button
                  variant={buyer.ranking === 1 ? 'emerald' : 'primary'}
                  size="sm"
                  onClick={() => handleOpenOfferModal(buyer)}
                  className="font-semibold"
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> {t('sendOfferBtn')} (₹{buyer.offeredPricePerKg}/kg)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Send Offer Modal */}
      <Modal
        isOpen={Boolean(selectedBuyer)}
        onClose={() => setSelectedBuyer(null)}
        title={`${t('sendOfferModalTitle')}: ${selectedBuyer?.businessName}`}
        description={t('sendOfferModalDesc')}
        maxWidth="lg"
      >
        {successMessage ? (
          <div className="p-6 text-center text-emerald-700 bg-emerald-50 rounded-xl">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
            <p className="font-bold text-sm">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSendOffer} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">{t('buyerTargetBudget')}:</span>
                <span className="font-bold text-slate-800">₹{selectedBuyer?.offeredPricePerKg}/kg</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">{t('fairPriceCorridor')}:</span>
                <span className="font-bold text-emerald-700">{getFairCorridor(selectedCrop)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">{t('escrowSecurity')}:</span>
                <span className="font-bold text-slate-800">{t('guaranteed100')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('yourPricePerKg')}
                type="number"
                step="0.5"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                required
              />
              <Input
                label={t('quantityKgLabel')}
                type="number"
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(e.target.value)}
                required
              />
            </div>

            <Input
              label={t('dispatchNotes')}
              value={offerNotes}
              onChange={(e) => setOfferNotes(e.target.value)}
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setSelectedBuyer(null)}>
                {t('cancel')}
              </Button>
              <Button variant="emerald" size="sm" type="submit" isLoading={isSending}>
                {t('sendFormalOffer')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
