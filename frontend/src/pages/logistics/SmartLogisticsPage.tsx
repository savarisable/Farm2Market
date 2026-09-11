import React, { useState, useEffect } from 'react';
import { getLogisticsOverviewApi, updateShipmentProgressApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import {
  Truck,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Leaf,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const SmartLogisticsPage: React.FC = () => {
  const [logisticsData, setLogisticsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAlert, setUpdateAlert] = useState<string | null>(null);

  const fetchLogistics = () => {
    setLoading(true);
    getLogisticsOverviewApi()
      .then((res) => {
        if (res?.success) {
          setLogisticsData(res);
          if (res.shipments && res.shipments.length > 0) {
            setActiveShipmentId(res.shipments[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogistics();
  }, []);

  const handleSimulateProgress = async (shipmentId: string, currentStage: string) => {
    const nextStages: Record<string, { stage: string; progress: number }> = {
      FARM: { stage: 'COLLECTION', progress: 45 },
      COLLECTION: { stage: 'TRANSPORT', progress: 70 },
      TRANSPORT: { stage: 'QUALITY_CHECK', progress: 85 },
      QUALITY_CHECK: { stage: 'BUYER', progress: 100 },
      BUYER: { stage: 'BUYER', progress: 100 },
    };

    const next = nextStages[currentStage] || { stage: 'TRANSPORT', progress: 70 };
    setIsUpdating(true);
    try {
      const res = await updateShipmentProgressApi(shipmentId, next.stage, next.progress);
      if (res?.success) {
        setUpdateAlert(`Shipment #${res.shipment.trackingCode} transitioned to ${next.stage} (${next.progress}% completed)!`);
        setTimeout(() => {
          setUpdateAlert(null);
          fetchLogistics();
        }, 1200);
      }
    } catch (e) {
    } finally {
      setIsUpdating(false);
    }
  };

  const corridor = logisticsData?.consolidatedCorridor;
  const shipments = logisticsData?.shipments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Smart Logistics & Direct Transit Consolidation</h1>
            <AIInsightBadge confidence={95} label="ROUTE OPTIMIZER" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Groups smallholder farm lots onto shared freight corridors, maximizing truck capacity and slashing per-kg freight costs.
          </p>
        </div>
      </div>

      {updateAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{updateAlert}</span>
        </div>
      )}

      {/* Load Consolidation Hero Spotlight (Section 21) */}
      {corridor && (
        <div className="rounded-2xl p-6 bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white shadow-xl border border-forest-800 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-forest-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-agri-400 text-forest-950 shadow-xs">
                  CONSOLIDATED DIRECT TRANSIT ACTIVE
                </span>
                <span className="text-xs text-forest-300">Corridor: {corridor.originHub} ➔ {corridor.destinationHub}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Vehicle Fill Rate: {corridor.utilizationPercent}% ({corridor.totalCargoWeightKg.toLocaleString()} / {corridor.vehicleCapacityKg.toLocaleString()} kg)
              </h2>
              <p className="text-xs text-forest-200 mt-1">{corridor.dispatchRecommendation}</p>
            </div>

            {/* Savings Callout */}
            <div className="p-4 rounded-xl bg-forest-900/90 border border-forest-700 text-right min-w-[200px]">
              <span className="text-xs text-forest-300 uppercase tracking-wider block font-medium">Collective Freight Savings</span>
              <div className="text-3xl font-extrabold text-agri-300 my-1">
                ₹{corridor.totalSavingsAmount.toLocaleString()}
              </div>
              <span className="text-xs font-bold text-emerald-300">
                {corridor.savingsPercent}% Cheaper vs Separate Transport
              </span>
            </div>
          </div>

          {/* 4 Multi-Farmer Pickup Stops in Corridor */}
          <div>
            <h4 className="text-xs font-bold text-forest-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-agri-400" /> Multi-Stop Collection Manifest:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {corridor.pickupStops.map((stop: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate">{stop.farmerName}</span>
                    <span className="text-[10px] font-semibold text-agri-300">Stop #{idx + 1}</span>
                  </div>
                  <span className="text-forest-300 block text-[11px]">{stop.location}</span>
                  <div className="flex justify-between pt-1 border-t border-forest-800/80 text-[11px]">
                    <span className="text-forest-400">{stop.cropName}:</span>
                    <strong className="text-white">{stop.quantityKg.toLocaleString()} kg</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Comparison: Separate vs Consolidated */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-forest-900/40 border border-forest-800">
              <span className="text-forest-400 block text-[11px]">Fragmented SCV Transport:</span>
              <span className="text-base font-extrabold text-slate-300 line-through">
                ₹{corridor.separateTransportCost.toLocaleString()}
              </span>
              <span className="text-[11px] text-forest-400 block mt-0.5">4 separate vehicle hires</span>
            </div>

            <div className="p-3 rounded-xl bg-forest-900/40 border border-forest-800">
              <span className="text-forest-400 block text-[11px]">Consolidated Truck Rate:</span>
              <span className="text-base font-extrabold text-agri-300">
                ₹{corridor.consolidatedTransportCost.toLocaleString()}
              </span>
              <span className="text-[11px] text-forest-400 block mt-0.5">1 medium reefer vehicle</span>
            </div>

            <div className="p-3 rounded-xl bg-forest-900/40 border border-forest-800">
              <span className="text-forest-400 block text-[11px]">Carbon Footprint Mitigation:</span>
              <span className="text-base font-extrabold text-emerald-400">
                -{corridor.carbonEmissionReductionKg} kg CO₂
              </span>
              <span className="text-[11px] text-forest-400 block mt-0.5">Eco-friendly aggregation</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Shipments Live Stepper Tracking */}
      <Card className="p-6 bg-white">
        <CardTitle className="text-base mb-1">Live Shipment Tracking & Delivery Stepper</CardTitle>
        <p className="text-xs text-slate-500 mb-6">Real-time status updates from farm collection to buyer unloading</p>

        {shipments.map((ship: any) => {
          const stages = ['FARM', 'COLLECTION', 'QUALITY_CHECK', 'TRANSPORT', 'BUYER'];
          const stageIndex = stages.indexOf(ship.currentStage);

          return (
            <div key={ship.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-5 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{ship.trackingCode}</span>
                    <Badge variant="info" size="sm">
                      {ship.currentStage}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vehicle: <strong>{ship.vehicleNumber}</strong> • Driver: {ship.driverName} ({ship.driverPhone})
                  </p>
                </div>

                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => handleSimulateProgress(ship.id, ship.currentStage)}
                  isLoading={isUpdating}
                  className="font-semibold text-xs"
                >
                  Simulate Next Stage <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {/* Progress Stepper Visual */}
              <div className="relative pt-2 pb-4">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden absolute top-5 left-0 -z-0">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${ship.progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between relative z-10 text-xs">
                  {stages.map((stg, idx) => {
                    const isPassed = idx <= stageIndex;
                    const isCurrent = idx === stageIndex;

                    return (
                      <div key={stg} className="flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white transition-all ${
                            isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                          } ${isCurrent ? 'ring-emerald-200 scale-110' : ''}`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold mt-2 ${isPassed ? 'text-emerald-950' : 'text-slate-400'}`}>
                          {stg === 'FARM'
                            ? 'Farm Gate'
                            : stg === 'COLLECTION'
                            ? 'Consolidation'
                            : stg === 'QUALITY_CHECK'
                            ? 'Quality Check'
                            : stg === 'TRANSPORT'
                            ? 'In Transit'
                            : 'Delivered'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                <span>Origin: {ship.originLocation}</span>
                <span>Destination: {ship.destinationLocation}</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};
