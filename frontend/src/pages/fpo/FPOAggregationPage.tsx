import React, { useState, useEffect } from 'react';
import { getFPODashboardApi, createBulkShipmentApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import {
  Layers,
  Users,
  CheckCircle2,
  TrendingUp,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FPOAggregationPage: React.FC = () => {
  const navigate = useNavigate();
  const [fpoData, setFpoData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getFPODashboardApi()
      .then((res) => {
        if (res?.success) setFpoData(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreateBulk = async () => {
    try {
      const res = await createBulkShipmentApi({ cropName: 'Tomato', targetQuantityKg: 2600 });
      if (res?.success) {
        setSuccessAlert('Bulk pooled order created! +₹7,800 collective premium locked. Routing to logistics.');
        setTimeout(() => {
          navigate('/logistics');
        }, 1500);
      }
    } catch (e) {}
  };

  const agg = fpoData?.aggregationAnalysis;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">FPO Volume Aggregation Wizard</h1>
            <AIInsightBadge confidence={96} label="COLLECTIVE BARGAINING" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Groups smallholder harvest lots into institutional bulk shipments, capturing bulk price premiums.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/fpo')}>
          Back to FPO Overview
        </Button>
      </div>

      {successAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successAlert}</span>
        </div>
      )}

      {agg && (
        <div className="space-y-6">
          {/* Main Aggregation Card */}
          <Card className="p-6 bg-white border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Active Cluster Pool</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Tomato (Grade A) • {agg.memberCount} Matching Smallholders Assembled
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Aggregated Volume</span>
                <span className="text-3xl font-extrabold text-emerald-700">
                  {agg.totalAggregatedQuantityKg.toLocaleString()} kg
                </span>
              </div>
            </div>

            {/* Visual Progress toward Bulk Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Bulk Premium Threshold (2,500 kg)</span>
                <span className="text-emerald-700">
                  {agg.isBulkUnlocked ? '104% Fulfilled (Unlocked!)' : 'Assembling...'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Member Contributions Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {agg.memberLots.map((m: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 block truncate">{m.farmerName}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Lot #{idx + 1}
                    </span>
                  </div>
                  <span className="text-slate-500 block text-[11px]">{m.location}</span>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                    <span className="text-slate-800">{m.quantityKg} kg</span>
                    <span className="text-emerald-700">₹{m.allocatedRevenue?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Economics Summary */}
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs text-emerald-950">
                <p>
                  Baseline Mandi Price: <strong>₹{agg.baseMarketPricePerKg}/kg</strong> ➔ Bulk Contract Rate:{' '}
                  <strong className="text-emerald-800 text-sm">₹{agg.finalBulkPricePerKg}/kg (+₹{agg.bulkPremiumPerKg}/kg)</strong>
                </p>
                <p className="font-bold text-emerald-900">
                  Total Gross Revenue: ₹{agg.totalAggregatedRevenue.toLocaleString()} • Additional Profit: +₹{agg.additionalCollectiveGain.toLocaleString()}
                </p>
              </div>

              <Button variant="emerald" size="lg" onClick={handleCreateBulk} className="font-bold shadow-md">
                <Truck className="w-4 h-4 mr-1.5" /> Dispatch Consolidated Bulk Lot
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
