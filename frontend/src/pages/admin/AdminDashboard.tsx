import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  Users,
  TrendingUp,
  Download,
  FileSpreadsheet,
  MapPin,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Truck,
  Activity,
  BarChart3,
  Globe2,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { getAdminOverviewApi, downloadTransactionsCsvUrl, downloadFarmerEarningsCsvUrl } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getAdminOverviewApi();
      if (res.success) {
        setOverview(res);
      }
    } catch (err) {
      console.error('Failed to load admin overview', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const metrics = overview?.metrics || {
    totalFarmers: 143,
    totalFPOs: 19,
    totalBuyers: 85,
    todaysTransactionsVolume: 342000,
    averageFarmerRealization: '68.4%',
    consumerSavings: '19.5%',
    activeTransitTrucks: 14,
    activeMilkRunTrucks: 14,
  };

  const regionalIntelligence = overview?.regionalIntelligence || [
    { region: 'Pune', crop: 'Tomato', demandIndex: 89, supplyIndex: 61, gapPercent: 28, alert: 'ACUTE SHORTAGE', currentPrice: 30, expectedPrice: 34 },
    { region: 'Mumbai', crop: 'Tomato', demandIndex: 92, supplyIndex: 58, gapPercent: 34, alert: 'ACUTE SHORTAGE', currentPrice: 34, expectedPrice: 38 },
    { region: 'Nashik', crop: 'Tomato', demandIndex: 63, supplyIndex: 91, gapPercent: -28, alert: 'SURPLUS / SUPPLY HUB', currentPrice: 25, expectedPrice: 26 },
    { region: 'Surat', crop: 'Tomato', demandIndex: 82, supplyIndex: 65, gapPercent: 17, alert: 'MODERATE SHORTAGE', currentPrice: 33, expectedPrice: 35 },
    { region: 'Nagpur', crop: 'Soybean', demandIndex: 85, supplyIndex: 62, gapPercent: 23, alert: 'MODERATE SHORTAGE', currentPrice: 46, expectedPrice: 49 },
    { region: 'Akola', crop: 'Cotton', demandIndex: 88, supplyIndex: 59, gapPercent: 29, alert: 'ACUTE SHORTAGE', currentPrice: 64, expectedPrice: 68 },
  ];

  const supplyHotspots = overview?.supplyHotspots || [
    { district: 'Nashik', state: 'Maharashtra', mainCrops: 'Tomato, Onion, Grapes', surplusCapacityTonnes: 1420, activeFarmers: 380 },
    { district: 'Ahmednagar', state: 'Maharashtra', mainCrops: 'Onion, Pomegranate', surplusCapacityTonnes: 890, activeFarmers: 240 },
    { district: 'Amravati', state: 'Maharashtra', mainCrops: 'Soybean, Orange', surplusCapacityTonnes: 650, activeFarmers: 190 },
  ];

  const demandHotspots = overview?.demandHotspots || [
    { district: 'Mumbai Suburban', state: 'Maharashtra', dailyDeficitTonnes: 2100, priceSpikeRisk: 'HIGH' },
    { district: 'Pune Urban', state: 'Maharashtra', dailyDeficitTonnes: 1350, priceSpikeRisk: 'HIGH' },
    { district: 'Surat Industrial', state: 'Gujarat', dailyDeficitTonnes: 820, priceSpikeRisk: 'MEDIUM' },
  ];

  const chartData = regionalIntelligence.map((r: any) => ({
    region: r.region,
    'Demand Index': r.demandIndex,
    'Supply Index': r.supplyIndex,
    'Price (₹/kg)': r.currentPrice,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Ministry Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-300 text-xs font-semibold mb-3 border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Department of Consumer Affairs (DoCA) &bull; Problem Statement ID 26033
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              National Agricultural Market Oversight
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Real-time monitoring of farmer price realizations, consumer inflation dampening, inter-district supply-demand deficits, and intermediary reduction metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <a
              href={downloadTransactionsCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Transactions CSV
            </a>
            <a
              href={downloadFarmerEarningsCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Farmer Audit CSV
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Farmers</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.totalFarmers}</p>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Active Direct</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">FPO Clusters</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{metrics.totalFPOs}</p>
          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Aggregated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Buyers & Retail</p>
          <p className="text-2xl font-black text-sky-600 mt-1">{metrics.totalBuyers}</p>
          <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded">Verified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Farmer Share</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.averageFarmerRealization}</p>
          <span className="text-[10px] text-gray-500">vs 27.5% APMC</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Consumer Save</p>
          <p className="text-2xl font-black text-teal-600 mt-1">{metrics.consumerSavings}</p>
          <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Inflation Damp</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pilot Volume</p>
          <p className="text-2xl font-black text-gray-900 mt-1">₹{(metrics.todaysTransactionsVolume / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-emerald-700 font-bold">100% Escrow</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Direct Corridors</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{metrics.activeMilkRunTrucks || 14}</p>
          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">91% Utilization</span>
        </div>
      </div>

      {/* Regional Intelligence Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Regional Supply vs. Demand Index
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  AI monitored demand indices across Maharashtra and Western India markets
                </p>
              </div>
              <Link to="/regional-intelligence">
                <Button variant="outline" size="sm" className="text-xs">
                  <Globe2 className="w-3.5 h-3.5 mr-1" />
                  View Heatmap Details
                </Button>
              </Link>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="region" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: 12 }} />
                  <Bar dataKey="Demand Index" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Supply Index" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Price (₹/kg)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6 border-indigo-100 bg-indigo-50/20">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              DoCA Deficit Alerts
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Real-time warnings triggered by AI supply-demand gap calculations.
            </p>
            <div className="space-y-3">
              {regionalIntelligence.slice(0, 3).map((r: any, idx: number) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{r.region} ({r.crop})</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      r.alert.includes('ACUTE') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.alert}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Demand Gap: <strong className="text-red-600">+{r.gapPercent}%</strong></span>
                    <span>Expected: <strong className="text-emerald-700">₹{r.expectedPrice}/kg</strong></span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-indigo-100">
              <Link to="/regional-intelligence" className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center justify-between">
                <span>Investigate All Hub Deficits</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 border-emerald-100 bg-emerald-50/20">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Impact Simulator
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Macro socio-economic impact metrics of middleman elimination.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Farmer Net Income Increase:</span>
                <strong className="text-emerald-700 font-bold">+38.2%</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Consumer Inflation Shield:</span>
                <strong className="text-teal-700 font-bold">-19.5% price</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Post-Harvest Waste Averted:</span>
                <strong className="text-indigo-700 font-bold">24.8% reduction</strong>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/impact-dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50">
                  Open Interactive Impact Model
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Regional Intelligence Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">National Commodity Flow Table</h3>
            <p className="text-xs text-gray-500">Live surveillance across production hubs and consuming metros</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={downloadTransactionsCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Dataset
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Market / Region</th>
                <th className="py-3 px-4">Monitored Crop</th>
                <th className="py-3 px-4">Demand Index</th>
                <th className="py-3 px-4">Supply Index</th>
                <th className="py-3 px-4">Supply-Demand Gap</th>
                <th className="py-3 px-4">Current Spot</th>
                <th className="py-3 px-4">AI Forecast Price</th>
                <th className="py-3 px-4">Regulatory Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {regionalIntelligence.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {r.region}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700">{r.crop}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{r.demandIndex}</span>
                      <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${r.demandIndex}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{r.supplyIndex}</span>
                      <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full" style={{ width: `${r.supplyIndex}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${r.gapPercent > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {r.gapPercent > 0 ? `+${r.gapPercent}% (Deficit)` : `${r.gapPercent}% (Surplus)`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">₹{r.currentPrice}/kg</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">₹{r.expectedPrice}/kg</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      r.alert.includes('ACUTE')
                        ? 'bg-red-100 text-red-700'
                        : r.alert.includes('SURPLUS')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.alert}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Surplus and Deficit Clusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Surplus Production Hubs (Aggregators)
            </h3>
            <span className="text-xs text-gray-400 font-medium">Maharashtra Corridor</span>
          </div>
          <div className="space-y-3">
            {supplyHotspots.map((s: any, idx: number) => (
              <div key={idx} className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{s.district}, {s.state}</h4>
                  <p className="text-xs text-gray-500">Crops: {s.mainCrops}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">{s.activeFarmers} direct enrolled farmers</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-medium">Surplus Cap</span>
                  <p className="text-base font-extrabold text-emerald-800">{s.surplusCapacityTonnes} T</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Urban High Deficit Hubs (Demand Centers)
            </h3>
            <span className="text-xs text-gray-400 font-medium">Spike Risk Watchlist</span>
          </div>
          <div className="space-y-3">
            {demandHotspots.map((d: any, idx: number) => (
              <div key={idx} className="p-3 bg-red-50/40 rounded-xl border border-red-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{d.district}, {d.state}</h4>
                  <p className="text-xs text-gray-500">Daily Demand Deficit: {d.dailyDeficitTonnes} Tonnes</p>
                  <span className="inline-block mt-1 text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    {d.priceSpikeRisk} Risk of Inflation
                  </span>
                </div>
                <div className="text-right">
                  <Link to="/regional-intelligence">
                    <Button variant="outline" size="sm" className="text-xs bg-white text-gray-700">
                      Route Produce
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
