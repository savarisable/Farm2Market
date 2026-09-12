import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  DollarSign,
  Scale,
  Sparkles,
  ShoppingBag,
  QrCode,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { getPriceTransparencyApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function PriceTransparencyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [monthlySpend, setMonthlySpend] = useState(3000);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getPriceTransparencyApi();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load price transparency data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cropPriceProfiles: Record<string, { consumerPrice: number; farmerShare: number; logistics: number; retail: number; traditionalFarmerShare: number }> = {
    Tomato: { consumerPrice: 40, farmerShare: 25, logistics: 5, retail: 7, traditionalFarmerShare: 11 },
    Onion: { consumerPrice: 38, farmerShare: 26, logistics: 4.5, retail: 5.5, traditionalFarmerShare: 10 },
    Potato: { consumerPrice: 32, farmerShare: 21, logistics: 3.8, retail: 5.2, traditionalFarmerShare: 8.5 },
    Grapes: { consumerPrice: 95, farmerShare: 64, logistics: 11, retail: 14, traditionalFarmerShare: 28 },
    Soybean: { consumerPrice: 62, farmerShare: 46, logistics: 5.5, retail: 8.5, traditionalFarmerShare: 22 },
  };

  const currentProfile = cropPriceProfiles[selectedCrop] || cropPriceProfiles['Tomato'];

  const dynamicBreakdown = [
    { name: 'Farmer Direct Realization', amount: currentProfile.farmerShare, color: '#16a34a', percent: Math.round((currentProfile.farmerShare / currentProfile.consumerPrice) * 100) },
    { name: 'Cold Transport & Freight', amount: currentProfile.logistics, color: '#0284c7', percent: Math.round((currentProfile.logistics / currentProfile.consumerPrice) * 100) },
    { name: 'Solar Storage & Quality Pack', amount: 2.0, color: '#f59e0b', percent: Math.round((2 / currentProfile.consumerPrice) * 100) },
    { name: 'Retail Hub Distribution', amount: currentProfile.retail, color: '#64748b', percent: Math.round((currentProfile.retail / currentProfile.consumerPrice) * 100) },
    { name: 'Platform AI Tech Fee', amount: 1.0, color: '#10b981', percent: Math.round((1 / currentProfile.consumerPrice) * 100) },
  ];

  const comparisonBarData = [
    {
      category: 'Farmer Share (₹)',
      Traditional: currentProfile.traditionalFarmerShare,
      Farm2Market: currentProfile.farmerShare,
    },
    {
      category: 'Intermediary Leakage (₹)',
      Traditional: currentProfile.consumerPrice * 1.22 - currentProfile.traditionalFarmerShare - currentProfile.logistics,
      Farm2Market: currentProfile.retail + 3.0,
    },
    {
      category: 'Consumer End Price (₹)',
      Traditional: Math.round(currentProfile.consumerPrice * 1.22),
      Farm2Market: currentProfile.consumerPrice,
    },
  ];

  // Live calculator metrics
  const calculatedFarmerExtra = Math.round(monthlySpend * 0.38);
  const calculatedConsumerSaved = Math.round(monthlySpend * 0.185);
  const calculatedFoodWastedAvoidedKg = Math.round((monthlySpend / currentProfile.consumerPrice) * 0.24);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-200 text-xs font-semibold mb-4 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            DoCA Problem Statement ID 26033: Elimination of Intermediaries
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Radical Price Transparency
          </h1>
          <p className="text-emerald-100 text-base leading-relaxed">
            In conventional agricultural supply chains, up to 6 layers of intermediaries extract 70%+ of consumer rupees.
            Farm2Market SmartMandi routes farm produce directly from source farms and FPOs to end consumers with mathematically transparent economics.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <Link to="/consumer-market">
              <Button variant="emerald" size="md" className="font-bold shadow-lg">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop Farm-Fresh Produce
              </Button>
            </Link>
            <Link to="/verify-passport/MH-NAS-TOM-26091">
              <Button variant="darkOutline" size="md" className="font-semibold">
                <QrCode className="w-4 h-4 mr-2 text-emerald-300" />
                Scan Crop QR Passport
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 3 Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 sm:p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Farmer Price Realization</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">62.5% - 68%</h3>
              <p className="text-xs text-gray-600 mt-1">vs. Only 22% - 28% in Traditional APMC chains</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            +140% higher direct net income to farmer
          </div>
        </Card>

        <Card className="p-5 sm:p-6 border-l-4 border-l-sky-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Intermediary Layers</p>
              <h3 className="text-3xl font-extrabold text-sky-600 mt-2">2 Stages</h3>
              <p className="text-xs text-gray-600 mt-1">Direct Farm/FPO Hub &rarr; Verified Consumer</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-sky-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Eliminates 4 speculative commission middlemen
          </div>
        </Card>

        <Card className="p-5 sm:p-6 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Consumer Net Savings</p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-2">18.5% Lower</h3>
              <p className="text-xs text-gray-600 mt-1">Guaranteed freshness harvested &lt; 24 hrs prior</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-amber-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Zero hidden mandi levies or unrecorded deductions
          </div>
        </Card>
      </div>

      {/* Interactive Crop Price Breakdown Section */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-600" />
              Where Does Your Rupee Go?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a commodity to inspect the real-time cost composition per kilogram.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Commodity:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Tomato', 'Onion', 'Potato', 'Grapes', 'Soybean'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedCrop === crop
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-center">
          {/* Donut Chart */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {dynamicBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`₹${value}/kg`, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400 font-medium">Retail Consumer Price</p>
              <p className="text-2xl font-black text-gray-900">₹{currentProfile.consumerPrice}.00 / kg</p>
              <span className="inline-block mt-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                Farmer gets ₹{currentProfile.farmerShare}.00 / kg ({Math.round((currentProfile.farmerShare / currentProfile.consumerPrice) * 100)}%)
              </span>
            </div>
          </div>

          {/* Slices Legend Table */}
          <div className="lg:col-span-6 space-y-3">
            {dynamicBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/70 hover:bg-gray-100/70 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    <p className="text-xs text-gray-400">
                      {item.name.includes('Farmer')
                        ? 'Direct payment to grower bank account via ESCROW'
                        : item.name.includes('Logistics')
                        ? 'Optimized direct corridor aggregated route freight'
                        : item.name.includes('Storage')
                        ? 'IoT solar cold storage & grading certification'
                        : item.name.includes('Retail')
                        ? 'Last-mile urban hub micro-fulfillment'
                        : 'Algorithmic matching, dispute safety & servers'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-gray-900">₹{item.amount.toFixed(2)}</p>
                  <span className="text-xs font-bold text-gray-500">{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Comparison: Traditional Supply Chain vs. Farm2Market AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traditional */}
        <Card className="p-6 border-red-100 bg-gradient-to-br from-white to-red-50/20">
          <div className="flex items-center justify-between pb-4 border-b border-red-100">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Legacy System</span>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">Traditional Mandi Supply Chain</h3>
            </div>
            <div className="p-2 bg-red-100 text-red-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <p className="text-gray-700"><strong>Village Kachha Aggregator:</strong> Takes 10-15% margin for transport from farm gate.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <p className="text-gray-700"><strong>APMC Commission Agent (Adatiya):</strong> 6-8% commission + unrecorded weighment deductions.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <p className="text-gray-700"><strong>Primary Wholesaler:</strong> 10-12% markup with 18-24 hour transit storage delay.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
              <p className="text-gray-700"><strong>Secondary Wholesaler / Sub-trader:</strong> 12-15% markup with manual re-bagging.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</div>
              <p className="text-gray-700"><strong>Local Mandi Retailer / Hawker:</strong> 25-30% markup to absorb 22% spoilage loss.</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-red-100 bg-red-50/50 -mx-6 -mb-6 p-6 rounded-b-xl">
            <div className="flex justify-between items-center text-xs text-red-900 font-semibold">
              <span>Total Transit Time: <strong>48 - 72 Hours</strong></span>
              <span>Post-Harvest Loss: <strong>22% - 28%</strong></span>
            </div>
            <div className="mt-2 text-xs text-red-700">
              Farmer Realization: <strong>₹11/kg</strong> | Consumer Pays: <strong>₹48.80/kg</strong> (Farmer receives only 22.5%)
            </div>
          </div>
        </Card>

        {/* Farm2Market Direct Corridor */}
        <Card className="p-6 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Farm2Market AI</span>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">Direct Corridor Supply Chain</h3>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <p className="text-gray-700">
                <strong>Farm Gate / FPO Aggregation Point:</strong> AI grade inspection & Digital Crop Passport minted. Farmer price locked before loading.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <p className="text-gray-700">
                <strong>Direct Cold Transit:</strong> Shared vehicle routing directly connecting FPO to urban distribution center in &lt; 8 hours.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <p className="text-gray-700">
                <strong>Smart Consumer Hub / Direct Buyer:</strong> Retail delivery with full provenance QR code showing origin farm and real price breakdown.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-emerald-100 bg-emerald-50/50 -mx-6 -mb-6 p-6 rounded-b-xl">
            <div className="flex justify-between items-center text-xs text-emerald-900 font-semibold">
              <span>Total Transit Time: <strong>8 - 14 Hours</strong></span>
              <span>Post-Harvest Loss: <strong>&lt; 3.5%</strong></span>
            </div>
            <div className="mt-2 text-xs text-emerald-800 font-bold">
              Farmer Realization: <strong>₹{currentProfile.farmerShare}/kg</strong> | Consumer Pays: <strong>₹{currentProfile.consumerPrice}/kg</strong> (Farmer receives {Math.round((currentProfile.farmerShare / currentProfile.consumerPrice) * 100)}%)
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Cost & Share Comparison (₹ per kg)</h3>
        <p className="text-xs text-gray-500 mb-6">Direct comparison of {selectedCrop} between Traditional Middleman vs. Farm2Market AI Model</p>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonBarData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip formatter={(val: any) => [`₹${val}`, '']} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="Traditional" fill="#ef4444" radius={[6, 6, 0, 0]} name="Traditional Middlemen" />
              <Bar dataKey="Farm2Market" fill="#10b981" radius={[6, 6, 0, 0]} name="Farm2Market AI" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Interactive Impact Calculator */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Interactive Simulator</span>
            <h3 className="text-xl font-bold text-gray-900 mt-1">Your Household Impact Calculator</h3>
            <p className="text-xs text-gray-600 mt-1">
              Adjust your family's estimated monthly produce budget to see the direct economic redirection achieved through Farm2Market AI.
            </p>

            <div className="mt-6">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-2">
                <span>Monthly Vegetable & Fruit Spend:</span>
                <span className="text-lg font-extrabold text-emerald-700">₹{monthlySpend.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>₹1,000 / mo</span>
                <span>₹5,000 / mo</span>
                <span>₹10,000 / mo</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto shrink-0">
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-medium">Direct Farmer Extra</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">+₹{calculatedFarmerExtra}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">redirected from middlemen</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-medium">Your Family Savings</p>
              <p className="text-2xl font-black text-sky-600 mt-1">₹{calculatedConsumerSaved}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">saved on purchase</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-medium">Wastage Saved</p>
              <p className="text-2xl font-black text-amber-600 mt-1">~{calculatedFoodWastedAvoidedKg} kg</p>
              <p className="text-[10px] text-gray-400 mt-0.5">edible food saved</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
