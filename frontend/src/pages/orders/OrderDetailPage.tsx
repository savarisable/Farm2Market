import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { getOrderByIdApi, updateOrderStatusApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import { CropPassportModal } from '../../components/common/CropPassportModal';
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Truck,
  QrCode,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Clock,
  User,
  MapPin,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  const fetchOrder = () => {
    if (!id) return;
    setLoading(true);
    getOrderByIdApi(id)
      .then((res) => {
        if (res?.success && res.order) setOrder(res.order);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleAdvanceStatus = async (nextStatus: string, shipmentStage?: string) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const res = await updateOrderStatusApi(id, nextStatus, shipmentStage);
      if (res?.success) {
        setActionAlert(`Order #${id.substring(0, 8)} updated to ${nextStatus.replace('_', ' ')}!`);
        setTimeout(() => {
          setActionAlert(null);
          fetchOrder();
        }, 1200);
      }
    } catch (e) {
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="p-12 text-center text-slate-500 animate-pulse">
        <p className="text-xs">Loading order lifecycle state...</p>
      </div>
    );
  }

  const allStages = [
    'OFFER',
    'ACCEPTED',
    'PAYMENT_SECURED',
    'PREPARING',
    'PICKED_UP',
    'IN_TRANSIT',
    'QUALITY_CHECK',
    'DELIVERED',
    'PAYMENT_RELEASED',
    'COMPLETED',
  ];

  const currentIdx = allStages.indexOf(order.status);

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                Order #{order.id.substring(0, 8)}: {order.quantityKg.toLocaleString()} kg {order.cropName}
              </h1>
              <Badge variant="success" size="sm">
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Escrow Value: <strong>₹{order.totalAmount.toLocaleString()}</strong> (₹{order.pricePerKg}/kg)
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPassportOpen(true)}
        >
          <QrCode className="w-4 h-4 text-emerald-700 mr-1.5" /> View Batch Passport
        </Button>
      </div>

      {actionAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* 10-Stage Visual Timeline Stepper */}
      <Card className="p-6 bg-white overflow-hidden">
        <CardTitle className="text-sm uppercase tracking-wider text-slate-400 mb-6">
          Order Lifecycle Pipeline (10 Verifiable Stages)
        </CardTitle>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px] flex items-center justify-between relative">
            {/* Connecting Bar */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${Math.min(100, (currentIdx / (allStages.length - 1)) * 100)}%` }}
              />
            </div>

            {allStages.map((stage, idx) => {
              const isPassed = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={stage} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white transition-all ${
                      isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    } ${isCurrent ? 'ring-emerald-300 scale-110' : ''}`}
                  >
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 text-center max-w-[65px] ${isPassed ? 'text-emerald-950' : 'text-slate-400'}`}>
                    {stage.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Action Decision Control Box */}
      <Card className="p-6 bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white shadow-xl border border-forest-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-agri-400" />
              <h3 className="text-base font-bold text-white">Payment Protection & Escrow Gateway</h3>
              <Badge variant="success" size="sm" className="bg-emerald-500 text-slate-950 font-bold">
                ESCROW SECURED
              </Badge>
            </div>
            <p className="text-xs text-forest-200">
              Buyer funds (₹{order.totalAmount.toLocaleString()}) are locked in automated escrow and released upon delivery sign-off.
            </p>
          </div>

          {/* Contextual Action Button based on Current State and User Role */}
          <div className="flex items-center gap-2 flex-wrap">
            {order.status === 'OFFER' && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleAdvanceStatus('PAYMENT_SECURED')}
                isLoading={isUpdating}
                className="font-bold"
              >
                Secure Payment in Escrow (₹{order.totalAmount.toLocaleString()})
              </Button>
            )}

            {order.status === 'PAYMENT_SECURED' && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleAdvanceStatus('PREPARING', 'FARM')}
                isLoading={isUpdating}
                className="font-bold"
              >
                Farmer: Mark Ready for Dispatch
              </Button>
            )}

            {order.status === 'PREPARING' && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleAdvanceStatus('PICKED_UP', 'COLLECTION')}
                isLoading={isUpdating}
                className="font-bold"
              >
                Driver: Confirm Farm Pickup
              </Button>
            )}

            {order.status === 'PICKED_UP' && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleAdvanceStatus('IN_TRANSIT', 'TRANSPORT')}
                isLoading={isUpdating}
                className="font-bold"
              >
                Logistics: Start Highway Transit
              </Button>
            )}

            {order.status === 'IN_TRANSIT' && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleAdvanceStatus('QUALITY_CHECK', 'QUALITY_CHECK')}
                isLoading={isUpdating}
                className="font-bold"
              >
                Destination: Arrived for Quality Inspection
              </Button>
            )}

            {order.status === 'QUALITY_CHECK' && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleAdvanceStatus('DELIVERED', 'BUYER')}
                isLoading={isUpdating}
                className="font-bold"
              >
                Buyer: Sign Off Quality & Accept Delivery
              </Button>
            )}

            {order.status === 'DELIVERED' && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleAdvanceStatus('PAYMENT_RELEASED', 'BUYER')}
                isLoading={isUpdating}
                className="font-bold text-slate-950 bg-agri-400 hover:bg-agri-300"
              >
                Release Payment to Farmer (₹{order.totalAmount.toLocaleString()})
              </Button>
            )}

            {order.status === 'PAYMENT_RELEASED' && (
              <Button
                variant="emerald"
                size="md"
                onClick={() => handleAdvanceStatus('COMPLETED', 'BUYER')}
                isLoading={isUpdating}
                className="font-bold"
              >
                Mark Transaction Completed
              </Button>
            )}

            {order.status === 'COMPLETED' && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Escrow Fully Settled to Farmer Bank</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stakeholders & Transaction Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <Card className="p-5 bg-white space-y-3">
          <CardTitle className="text-sm">Contract Stakeholders</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Origin Producer (Farmer):</span>
              <strong className="text-slate-900">{order.farmer?.name} ({order.farmer?.location})</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Destination Buyer:</span>
              <strong className="text-slate-900">{order.buyer?.name} ({order.deliveryAddress})</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Carrier Vehicle:</span>
              <strong className="text-slate-900">{order.shipment?.vehicleNumber || 'MH-15-EG-4482'}</strong>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white space-y-3">
          <CardTitle className="text-sm">Financial Settlement Summary</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Total Contract Quantity:</span>
              <strong className="text-slate-900">{order.quantityKg.toLocaleString()} kg</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Settled Farm-Gate Price:</span>
              <strong className="text-emerald-700">₹{order.pricePerKg}/kg</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-emerald-50 text-emerald-950 font-bold">
              <span>Gross Escrow Locked:</span>
              <span>₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Digital Crop Passport Modal */}
      <CropPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        passport={
          order.cropBatch?.passport || {
            passportCode: 'MH-NAS-TOM-26091',
            cropName: order.cropName,
            farmerName: order.farmer?.name || 'Ramesh Patil',
            farmLocation: order.farmer?.location || 'Nashik, Maharashtra',
            harvestDate: new Date().toISOString(),
            grade: 'GRADE_A (Verified)',
            shelfLifeHours: 72,
            currentOwner: `${order.buyer?.name || 'Pune Retail Hub'} (In Delivery)`,
            destination: order.deliveryAddress,
            transportType: 'Consolidated Direct Transit',
            provenanceJson: JSON.stringify([
              { stage: 'Order Contracted', date: '2026-09-08', detail: `Contract finalized at ₹${order.pricePerKg}/kg` },
              { stage: 'Escrow Secured', date: '2026-09-08', detail: `₹${order.totalAmount.toLocaleString()} deposited in escrow` },
            ]),
          }
        }
      />
    </div>
  );
};
