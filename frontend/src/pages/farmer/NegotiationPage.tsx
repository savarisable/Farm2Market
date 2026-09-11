import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOffersApi, submitCounterOfferApi, acceptOfferApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import {
  Scale,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const NegotiationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, tcrop, tcity, tgrade, tstatus } = useLanguage();
  const [offers, setOffers] = useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Counter Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState('30');
  const [counterRationale, setCounterRationale] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState('');

  const fetchOffers = () => {
    setLoading(true);
    getOffersApi()
      .then((res) => {
        if (res?.success && res.offers && res.offers.length > 0) {
          setOffers(res.offers);
          setSelectedOffer(res.offers[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleQuickCounter = async (price: number) => {
    if (!selectedOffer) return;
    setIsProcessing(true);
    try {
      const res = await submitCounterOfferApi(
        selectedOffer.id,
        price,
        `Counter-offer based on Fair Price Engine recommendation (₹${price}/kg).`
      );
      if (res?.success) {
        setAlertSuccess(`Counter-offer of ₹${price}/kg submitted!`);
        setTimeout(() => {
          setAlertSuccess('');
          fetchOffers();
        }, 1200);
      }
    } catch (e) {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    setIsProcessing(true);
    try {
      const res = await submitCounterOfferApi(
        selectedOffer.id,
        parseFloat(customPrice),
        counterRationale || `Custom counter-offer proposed: ₹${customPrice}/kg.`
      );
      if (res?.success) {
        setIsCustomModalOpen(false);
        setAlertSuccess(`Custom counter-offer of ₹${customPrice}/kg sent!`);
        setTimeout(() => {
          setAlertSuccess('');
          fetchOffers();
        }, 1200);
      }
    } catch (e) {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedOffer) return;
    if (window.confirm(`Accept trade at ₹${selectedOffer.offeredPricePerKg}/kg? This will generate a formal Order and lock escrow payment.`)) {
      setIsProcessing(true);
      try {
        const res = await acceptOfferApi(selectedOffer.id);
        if (res?.success) {
          setAlertSuccess('Trade accepted! Order generated and funds secured in escrow.');
          setTimeout(() => {
            navigate(`/orders/${res.orderId}`);
          }, 1400);
        }
      } catch (e) {
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Fair price calculations for the active offer
  const offeredPrice = selectedOffer?.offeredPricePerKg || 25;
  const quantity = selectedOffer?.quantityKg || 2000;
  const marketAvg = 27;
  const nearbyAvg = 28;
  const qualityAdjusted = 29;
  const demandAdjusted = 30;
  const fairMin = 28;
  const fairMax = 30;
  const potentialAdditionalRealization = Math.max(0, (fairMax - offeredPrice) * quantity);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('offersTitle')}
            </h1>
            <AIInsightBadge confidence={92} label={t('fairPriceEngine')} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('offersSubtitle')}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
          {t('orders')}
        </Button>
      </div>

      {alertSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* Main Negotiation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Offers List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('receivedOffers')}
          </h3>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2].map((i) => (
                <Card key={i} className="h-28 bg-slate-100" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <Card className="p-6 text-center text-slate-500 text-xs">
              {t('allCaughtUp')}
            </Card>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => setSelectedOffer(offer)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedOffer?.id === offer.id
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-100'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {tcrop(offer.cropBatch?.cropName || offer.requirement?.cropName || 'Tomato')} ({offer.quantityKg.toLocaleString()} kg)
                    </span>
                    <p className="text-[11px] text-slate-500">From: {offer.sender.name}</p>
                  </div>
                  <Badge variant={offer.status === 'ACCEPTED' ? 'success' : 'warning'} size="sm">
                    {tstatus(offer.status)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">{t('offeredPrice')}:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">₹{offer.offeredPricePerKg}/kg</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Center & Right: Detailed Negotiation Cockpit */}
        {selectedOffer && (
          <div className="lg:col-span-2 space-y-5">
            {/* Fair Price Engine Breakdown Card */}
            <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-700" />
                  <CardTitle className="text-base">Fair Price Economic Assessment</CardTitle>
                </div>
                <Badge variant={offeredPrice < fairMin ? 'danger' : 'success'} size="md">
                  {offeredPrice < fairMin ? 'Below Fair Price' : 'Fair Market Price'}
                </Badge>
              </div>

              {/* Economic Formula Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Market Average</span>
                  <p className="text-base font-extrabold text-slate-800 mt-1">₹{marketAvg}/kg</p>
                  <span className="text-[10px] text-slate-400">Wholesale APMC</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Nearby Average</span>
                  <p className="text-base font-extrabold text-slate-800 mt-1">₹{nearbyAvg}/kg</p>
                  <span className="text-[10px] text-slate-400">Pune Terminal Yard</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Quality Adjusted</span>
                  <p className="text-base font-extrabold text-emerald-700 mt-1">₹{qualityAdjusted}/kg</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Grade A Premium</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Demand Adjusted</span>
                  <p className="text-base font-extrabold text-emerald-950 mt-1">₹{demandAdjusted}/kg</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">+8.4% Shortage</span>
                </div>
              </div>

              {/* Potential Extra Realization Alert */}
              {potentialAdditionalRealization > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">
                      ⚠️ Potential Additional Realization Available:
                    </span>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Countering at the demand-adjusted fair price will secure an additional{' '}
                      <strong className="text-amber-950 text-sm">₹{potentialAdditionalRealization.toLocaleString()}</strong> for your {quantity.toLocaleString()} kg batch.
                    </p>
                  </div>
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => handleQuickCounter(demandAdjusted)}
                    isLoading={isProcessing}
                    className="whitespace-nowrap font-bold"
                  >
                    Send ₹{demandAdjusted} Counter
                  </Button>
                </div>
              )}
            </Card>

            {/* AI Negotiation Assistant Tactical Panel */}
            <Card className="p-5 sm:p-6 bg-gradient-to-br from-forest-950 to-forest-900 text-white border-forest-800">
              <div className="flex items-center justify-between pb-3 border-b border-forest-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-agri-400" />
                  <h3 className="text-base font-bold text-white">AI Tactical Negotiation Engine</h3>
                </div>
                <span className="text-xs font-bold text-agri-300">Fair Corridor: ₹{fairMin}–{fairMax}/kg</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-forest-900/60 border border-forest-800">
                  <span className="text-forest-300 block font-medium">Buyer Current Offer:</span>
                  <span className="text-2xl font-black text-white mt-1 block">₹{offeredPrice}/kg</span>
                  <p className="text-[11px] text-forest-400 mt-1">Submitted by {selectedOffer.sender.name}</p>
                </div>

                <div className="p-3 rounded-xl bg-agri-950 border border-agri-700">
                  <span className="text-agri-300 block font-medium">AI Suggested Counter-Offer:</span>
                  <span className="text-2xl font-black text-agri-300 mt-1 block">₹{demandAdjusted}/kg</span>
                  <p className="text-[11px] text-agri-200 mt-1">Walk-away Floor: ₹{fairMin}/kg</p>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-forest-900/80 border border-forest-800 text-xs text-forest-200 leading-relaxed">
                <span className="font-bold text-white block mb-1">Market Justification Rationale:</span>
                "Demand in major consumption centers is expanding (+8.4%) and comparable Grade A Tomato batches are consistently clearing between ₹28 and ₹30/kg. Quality Grade A produce with verified Digital Crop Passport commands a premium."
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleAccept}
                  isLoading={isProcessing}
                  className="w-full sm:w-auto border-forest-700 bg-forest-900/80 text-white hover:bg-forest-800"
                >
                  {t('acceptOfferBtn')} (₹{offeredPrice}/kg)
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsCustomModalOpen(true)}
                    className="w-full sm:w-auto border-forest-700 bg-forest-900/80 text-white hover:bg-forest-800"
                  >
                    {t('customCounter')}
                  </Button>
                  <Button
                    variant="emerald"
                    size="md"
                    onClick={() => handleQuickCounter(demandAdjusted)}
                    isLoading={isProcessing}
                    className="w-full sm:w-auto font-bold bg-agri-500 hover:bg-agri-400 text-forest-950 shadow-md"
                  >
                    {t('counterOfferBtn')} (₹{demandAdjusted}/kg)
                  </Button>
                </div>
              </div>
            </Card>

            {/* Negotiation History Thread */}
            <Card className="p-5 bg-white">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                {t('negotiationHistory')}
              </h4>
              <div className="space-y-3">
                {(selectedOffer.negotiations || []).map((step: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {step.action === 'INITIAL_OFFER' ? 'Initial Buyer Bid' : 'Counter-Offer Proposed'}
                      </span>
                      <span className="font-extrabold text-emerald-700 text-sm">₹{step.proposedPricePerKg}/kg</span>
                    </div>
                    {step.rationale && <p className="text-slate-600 mt-1 leading-snug">{step.rationale}</p>}
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(step.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Custom Counter Modal */}
      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title={t('counterOfferBtn')}
        description="Enter your target price per kg. The Fair Price Engine suggests keeping quotes within the fair corridor."
        maxWidth="md"
      >
        <form onSubmit={handleCustomCounter} className="space-y-4">
          <Input
            label={t('yourPricePerKg')}
            type="number"
            step="0.5"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            required
          />

          <Input
            label={t('dispatchNotes')}
            value={counterRationale}
            onChange={(e) => setCounterRationale(e.target.value)}
            placeholder="e.g. Higher firmness, Grade A certified, doorstep loading included."
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCustomModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="emerald" size="sm" type="submit" isLoading={isProcessing}>
              {t('sendFormalOffer')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
