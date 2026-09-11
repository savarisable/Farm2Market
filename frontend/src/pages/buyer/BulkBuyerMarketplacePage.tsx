import React, { useState, useEffect } from 'react';
import { getBulkMarketplaceApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import { Layers, CheckCircle2, Truck, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BulkBuyerMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [bulkList, setBulkList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createdOrderAlert, setCreatedOrderAlert] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getBulkMarketplaceApi()
      .then((res) => {
        if (res?.success && res.bulkOpportunities) {
          setBulkList(res.bulkOpportunities);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreateOrder = (req: any) => {
    setCreatedOrderAlert(`Master Contract Created! 10,000 kg order pooled across Sahyadri Agro FPO, Mahavrudhi FPO, and Kisan Kranti Cluster. Consolidated shipment dispatched.`);
    setTimeout(() => {
      navigate('/orders');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Bulk Procurement</h1>
            <AIInsightBadge confidence={96} label="FPO POOLING ENGINE" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated multi-FPO aggregation for large-scale 10,000+ kg food processors, supermarkets, and export orders.
          </p>
        </div>

        <Button variant="emerald" size="sm" onClick={() => navigate('/post-requirement')}>
          Post 10,000+ kg Requirement
        </Button>
      </div>

      {createdOrderAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{createdOrderAlert}</span>
        </div>
      )}

      {/* Bulk Demand Contract Cards */}
      <div className="space-y-6">
        {loading ? (
          <Card className="h-64 animate-pulse bg-slate-100" />
        ) : bulkList.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 text-xs">
            No active institutional bulk requirements currently open.
          </Card>
        ) : (
          bulkList.map((bulk) => (
            <Card key={bulk.requirementId} className="p-6 bg-white border-slate-200 shadow-sm space-y-5">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥔</span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {bulk.requiredQuantityKg.toLocaleString()} kg {bulk.cropName} (Grade A)
                    </h3>
                    <Badge variant="ai" size="sm">
                      100% Fulfilled by FPO Clusters
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Buyer: <strong className="text-slate-800">{bulk.buyerName}</strong> • Delivery Hub:{' '}
                    <strong>{bulk.location}</strong> • Due: {bulk.deliveryDate}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">Institutional Target Rate</span>
                  <span className="text-2xl font-black text-emerald-700">₹{bulk.budgetPricePerKg}/kg</span>
                </div>
              </div>

              {/* Multi-FPO Pooled Supply Allocation Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" /> Automated Multi-FPO Supply Pool Allocation:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {bulk.fulfillmentAllocation.map((fpo: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-slate-900">{fpo.supplierName}</span>
                        <Badge variant="success" size="sm">
                          {fpo.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-slate-500">Allocated Supply:</span>
                        <strong className="text-emerald-700 font-extrabold">{fpo.suppliedKg.toLocaleString()} kg</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${fpo.percentage}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 block text-right">{fpo.percentage}% of requirement</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats & Fulfillment Progress */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-emerald-800 block text-[10px] font-semibold">Total Pool Assembled:</span>
                    <strong className="text-sm font-extrabold text-emerald-950">
                      {bulk.totalFulfillmentKg.toLocaleString()} / {bulk.requiredQuantityKg.toLocaleString()} kg (100%)
                    </strong>
                  </div>
                  <div className="border-l border-emerald-300 pl-4">
                    <span className="text-emerald-800 block text-[10px] font-semibold">Consolidated Freight:</span>
                    <strong className="text-sm font-extrabold text-emerald-950">2 Medium Heavy Trucks (Saved ₹8,400)</strong>
                  </div>
                </div>

                <Button
                  variant="emerald"
                  size="md"
                  onClick={() => handleCreateOrder(bulk)}
                  className="w-full sm:w-auto font-bold px-6 shadow-md"
                >
                  Create Master Order & Secure Escrow <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
