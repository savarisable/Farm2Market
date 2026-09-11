import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFPODashboardApi, createBulkShipmentApi } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import {
  Layers,
  Users,
  TrendingUp,
  Truck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Package,
} from 'lucide-react';

export const FPODashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fpoData, setFpoData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispatchAlert, setDispatchAlert] = useState<string | null>(null);

  const fetchFpo = () => {
    setLoading(true);
    getFPODashboardApi()
      .then((res) => {
        if (res?.success) setFpoData(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFpo();
  }, []);

  const handleCreateShipment = async () => {
    try {
      const res = await createBulkShipmentApi({ cropName: 'Tomato', targetQuantityKg: 2600 });
      if (res?.success) {
        setDispatchAlert(res.message);
        setTimeout(() => {
          navigate('/logistics');
        }, 1500);
      }
    } catch (e) {}
  };

  const agg = fpoData?.aggregationAnalysis;
  const members = fpoData?.fpo?.members || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            FPO Aggregation Cockpit: {fpoData?.fpo?.fpoName || 'Sahyadri Agro Producer Co.'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {fpoData?.fpo?.location || 'Niphad, Nashik'} • {fpoData?.fpo?.memberCount || 165} Member Farmers • Trust Score: 95/100
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="emerald" size="sm" onClick={() => navigate('/fpo-aggregation')}>
            <Layers className="w-4 h-4" /> Run Pool Aggregator
          </Button>
        </div>
      </div>

      {dispatchAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{dispatchAlert}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="FPO Members"
          value={`${fpoData?.fpo?.memberCount || 165} Farmers`}
          subtitle="Nashik & Dindori clusters"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          variant="agri"
        />
        <StatCard
          title="Pooled Volume"
          value="2,600 kg"
          subtitle="Tomato Grade A ready"
          icon={<Package className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          title="Bulk Premium Unlocked"
          value="+₹3.0 / kg"
          subtitle="₹7,800 collective bonus"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          trend={{ value: '+11.5% premium', isPositive: true }}
        />
        <StatCard
          title="Freight Savings"
          value="₹4,200"
          subtitle="Consolidated direct transit"
          icon={<Truck className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Aggregation Feature Banner */}
      {agg && (
        <Card className="p-6 bg-gradient-to-r from-emerald-50/80 via-white to-white border-emerald-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <CardTitle className="text-base">Nearby Matching Smallholders Aggregated</CardTitle>
                <Badge variant="ai" size="sm">
                  {agg.isBulkUnlocked ? 'Bulk Order Unlocked' : 'Pending'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">{agg.statusMessage}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">Total Collective Volume</span>
              <span className="text-2xl font-black text-emerald-700">
                {agg.totalAggregatedQuantityKg.toLocaleString()} kg
              </span>
            </div>
          </div>

          {/* Members Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {agg.memberLots.map((m: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block truncate">{m.farmerName}</span>
                <span className="text-slate-500 block">{m.location}</span>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="font-bold text-slate-800">{m.quantityKg} kg</span>
                  <span className="font-semibold text-emerald-700">₹{m.allocatedRevenue?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Economics & Dispatch Action */}
          <div className="p-4 rounded-xl bg-forest-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
            <div className="text-xs space-y-1">
              <p className="text-forest-200">
                Bulk Market Rate: <strong className="text-white">₹{agg.finalBulkPricePerKg}/kg</strong> (vs standard ₹{agg.baseMarketPricePerKg}/kg)
              </p>
              <p className="text-agri-300 font-bold">
                Additional Revenue Generated: ₹{agg.additionalCollectiveGain.toLocaleString()} (₹{agg.averageGainPerFarmer.toLocaleString()} avg/farmer)
              </p>
            </div>

            <Button variant="emerald" size="md" onClick={handleCreateShipment} className="font-bold px-6">
              <Truck className="w-4 h-4 mr-1.5" /> Create Bulk Shipment
            </Button>
          </div>
        </Card>
      )}

      {/* Member Directory */}
      <Card className="p-6 bg-white">
        <CardTitle className="text-base mb-1">Registered Smallholder Cluster</CardTitle>
        <p className="text-xs text-slate-500 mb-4">Farmers eligible for automated volume aggregation in Niphad/Dindori</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Farmer Name</th>
                <th className="py-2.5 px-4">Taluka Location</th>
                <th className="py-2.5 px-4">Commodity</th>
                <th className="py-2.5 px-4">Available Quantity</th>
                <th className="py-2.5 px-4">Holding Size</th>
                <th className="py-2.5 px-4 text-right">Cluster Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                  <td className="py-3 px-4 text-slate-600">{m.location}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{m.crop}</td>
                  <td className="py-3 px-4 font-extrabold text-emerald-700">{m.quantityKg} kg</td>
                  <td className="py-3 px-4 text-slate-600">{m.landAcres} Acres</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="success" size="sm">
                      Aggregated
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
