import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  MapPin,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Truck,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  Zap,
  Info,
  ShieldCheck,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

interface RegionNode {
  id: string;
  name: string;
  state: string;
  type: 'CONSUMER_METRO' | 'PRODUCTION_HUB' | 'TRANSIT_CORRIDOR';
  demandScore: number;
  supplyScore: number;
  gapPercent: number; // positive = shortage, negative = surplus
  spotPrice: number;
  forecastPrice: number;
  dailyDeficitTonnes: number;
  alertLevel: 'HIGH_SHORTAGE' | 'MODERATE_SHORTAGE' | 'BALANCED' | 'SURPLUS';
  coordinates: { x: number; y: number }; // percentage on map layout
}

export default function RegionalIntelligencePage() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedHub, setSelectedHub] = useState<string>('Pune');

  // Rebalancing Simulator state
  const [simOrigin, setSimOrigin] = useState('Nashik Hub');
  const [simDestination, setSimDestination] = useState('Pune Urban');
  const [simQuantityTonnes, setSimQuantityTonnes] = useState(10);
  const [simResult, setSimResult] = useState<any>(null);

  const regionNodes: RegionNode[] = [
    {
      id: 'pune',
      name: 'Pune',
      state: 'Maharashtra',
      type: 'CONSUMER_METRO',
      demandScore: 89,
      supplyScore: 61,
      gapPercent: 28,
      spotPrice: selectedCrop === 'Tomato' ? 30 : selectedCrop === 'Onion' ? 32 : 45,
      forecastPrice: selectedCrop === 'Tomato' ? 34 : selectedCrop === 'Onion' ? 36 : 48,
      dailyDeficitTonnes: 1350,
      alertLevel: 'HIGH_SHORTAGE',
      coordinates: { x: 38, y: 55 },
    },
    {
      id: 'mumbai',
      name: 'Mumbai',
      state: 'Maharashtra',
      type: 'CONSUMER_METRO',
      demandScore: 94,
      supplyScore: 56,
      gapPercent: 38,
      spotPrice: selectedCrop === 'Tomato' ? 34 : selectedCrop === 'Onion' ? 36 : 48,
      forecastPrice: selectedCrop === 'Tomato' ? 39 : selectedCrop === 'Onion' ? 40 : 52,
      dailyDeficitTonnes: 2200,
      alertLevel: 'HIGH_SHORTAGE',
      coordinates: { x: 26, y: 48 },
    },
    {
      id: 'nashik',
      name: 'Nashik',
      state: 'Maharashtra',
      type: 'PRODUCTION_HUB',
      demandScore: 63,
      supplyScore: 94,
      gapPercent: -31,
      spotPrice: selectedCrop === 'Tomato' ? 25 : selectedCrop === 'Onion' ? 27 : 38,
      forecastPrice: selectedCrop === 'Tomato' ? 26 : selectedCrop === 'Onion' ? 28 : 40,
      dailyDeficitTonnes: -1600, // surplus
      alertLevel: 'SURPLUS',
      coordinates: { x: 34, y: 38 },
    },
    {
      id: 'surat',
      name: 'Surat',
      state: 'Gujarat',
      type: 'CONSUMER_METRO',
      demandScore: 82,
      supplyScore: 65,
      gapPercent: 17,
      spotPrice: selectedCrop === 'Tomato' ? 32 : selectedCrop === 'Onion' ? 34 : 44,
      forecastPrice: selectedCrop === 'Tomato' ? 35 : selectedCrop === 'Onion' ? 37 : 47,
      dailyDeficitTonnes: 850,
      alertLevel: 'MODERATE_SHORTAGE',
      coordinates: { x: 24, y: 26 },
    },
    {
      id: 'nagpur',
      name: 'Nagpur',
      state: 'Maharashtra',
      type: 'TRANSIT_CORRIDOR',
      demandScore: 84,
      supplyScore: 68,
      gapPercent: 16,
      spotPrice: selectedCrop === 'Tomato' ? 29 : selectedCrop === 'Onion' ? 31 : 46,
      forecastPrice: selectedCrop === 'Tomato' ? 32 : selectedCrop === 'Onion' ? 33 : 49,
      dailyDeficitTonnes: 720,
      alertLevel: 'MODERATE_SHORTAGE',
      coordinates: { x: 74, y: 35 },
    },
    {
      id: 'akola',
      name: 'Akola',
      state: 'Maharashtra',
      type: 'PRODUCTION_HUB',
      demandScore: 68,
      supplyScore: 86,
      gapPercent: -18,
      spotPrice: selectedCrop === 'Tomato' ? 26 : selectedCrop === 'Onion' ? 28 : 64,
      forecastPrice: selectedCrop === 'Tomato' ? 27 : selectedCrop === 'Onion' ? 29 : 68,
      dailyDeficitTonnes: -680,
      alertLevel: 'SURPLUS',
      coordinates: { x: 58, y: 42 },
    },
    {
      id: 'delhi',
      name: 'Delhi NCR',
      state: 'Delhi',
      type: 'CONSUMER_METRO',
      demandScore: 96,
      supplyScore: 54,
      gapPercent: 42,
      spotPrice: selectedCrop === 'Tomato' ? 38 : selectedCrop === 'Onion' ? 42 : 55,
      forecastPrice: selectedCrop === 'Tomato' ? 44 : selectedCrop === 'Onion' ? 46 : 60,
      dailyDeficitTonnes: 3400,
      alertLevel: 'HIGH_SHORTAGE',
      coordinates: { x: 42, y: 10 },
    },
  ];

  const activeHubData = regionNodes.find((n) => n.name.toLowerCase() === selectedHub.toLowerCase()) || regionNodes[0];

  function runSimulation() {
    const origin = regionNodes.find((n) => n.name.includes(simOrigin.split(' ')[0])) || regionNodes[2];
    const dest = regionNodes.find((n) => n.name.includes(simDestination.split(' ')[0])) || regionNodes[0];

    const kg = simQuantityTonnes * 1000;
    const originPrice = origin.spotPrice;
    const destPrice = dest.spotPrice;
    const grossSpreadPerKg = Math.max(0, destPrice - originPrice);
    const transportPerKg = 3.2; // cold freight rate
    const netGainPerKg = Math.max(0, grossSpreadPerKg - transportPerKg);
    const totalNetGain = Math.round(netGainPerKg * kg);
    const totalLogisticsCost = Math.round(transportPerKg * kg);
    const deficitReliefPercent = Math.min(100, Math.round(((simQuantityTonnes) / Math.abs(dest.dailyDeficitTonnes || 1000)) * 100 * 10) / 10);

    setSimResult({
      origin: origin.name,
      destination: dest.name,
      quantityTonnes: simQuantityTonnes,
      originSpot: originPrice,
      destSpot: destPrice,
      grossSpreadPerKg,
      transportPerKg,
      netGainPerKg,
      totalNetGain,
      totalLogisticsCost,
      deficitReliefPercent,
    });
  }

  const chartData = regionNodes.map((r) => ({
    name: r.name,
    'Demand Index': r.demandScore,
    'Supply Index': r.supplyScore,
    DeficitGap: r.gapPercent,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4" />
            DoCA National Supply-Demand Heatmap
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Regional Market Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Surveillance of production surpluses and consumption deficits to rebalance supply chains and mitigate food price spikes.
          </p>
        </div>

        {/* Commodity Filter */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-xs">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          <span className="text-xs font-semibold text-gray-500">Crop:</span>
          {['Tomato', 'Onion', 'Potato', 'Soybean', 'Cotton'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedCrop === crop
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map Visual & Hub Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Geographic Corridor Canvas */}
        <div className="lg:col-span-8">
          <Card className="p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  Western & Northern India Agri-Corridor Nodes
                </h3>
                <p className="text-xs text-gray-400">Click any hub node to inspect local supply-demand telemetry</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-red-600">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  Shortage Deficit (&gt;15%)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Surplus Production Hub
                </span>
              </div>
            </div>

            {/* Simulated Interactive Map Region */}
            <div className="relative w-full h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl border border-slate-700 p-6 overflow-hidden">
              {/* Background grid lines simulating radar map */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />

              {/* Transit corridor links (lines) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-emerald-500/30 stroke-dasharray-4">
                <line x1="34%" y1="38%" x2="38%" y2="55%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="34%" y1="38%" x2="26%" y2="48%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="34%" y1="38%" x2="24%" y2="26%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="58%" y1="42%" x2="74%" y2="35%" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="34%" y1="38%" x2="42%" y2="10%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 6" />
              </svg>

              {/* Hub Nodes */}
              {regionNodes.map((node) => {
                const isSelected = selectedHub.toLowerCase() === node.name.toLowerCase();
                const isShortage = node.gapPercent > 0;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedHub(node.name)}
                    style={{ left: `${node.coordinates.x}%`, top: `${node.coordinates.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                    }`}
                  >
                    <div
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all ${
                        isSelected
                          ? 'bg-white text-gray-900 border-white ring-4 ring-indigo-500/50'
                          : isShortage
                          ? 'bg-red-950/80 text-red-200 border-red-500/60 hover:border-red-400'
                          : 'bg-emerald-950/80 text-emerald-200 border-emerald-500/60 hover:border-emerald-400'
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          isShortage ? 'bg-red-400 animate-ping' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-xs font-black tracking-tight">{node.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1 rounded ${
                          isSelected
                            ? 'bg-gray-100 text-gray-800'
                            : isShortage
                            ? 'bg-red-900/60 text-red-300'
                            : 'bg-emerald-900/60 text-emerald-300'
                        }`}
                      >
                        {isShortage ? `+${node.gapPercent}%` : `${node.gapPercent}%`}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Legend overlay */}
              <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
                Corridor lines indicate active FPO multi-stop direct cold corridors
              </div>
            </div>

            {/* Hub Details Panel */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-gray-900">{activeHubData.name} ({activeHubData.state})</h4>
                  <Badge variant={activeHubData.gapPercent > 0 ? 'danger' : 'success'}>
                    {activeHubData.alertLevel.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500 font-medium">Type: {activeHubData.type.replace('_', ' ')}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span>Demand Index: <strong className="text-indigo-600">{activeHubData.demandScore}/100</strong></span>
                  <span>Supply Index: <strong className="text-emerald-600">{activeHubData.supplyScore}/100</strong></span>
                  <span>Spot Price: <strong>₹{activeHubData.spotPrice}/kg</strong></span>
                  <span>Forecast (3d): <strong className="text-indigo-700">₹{activeHubData.forecastPrice}/kg</strong></span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (activeHubData.gapPercent > 0) {
                    setSimDestination(`${activeHubData.name} Urban`);
                  } else {
                    setSimOrigin(`${activeHubData.name} Hub`);
                  }
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
              >
                Load into Route Simulator
              </button>
            </div>
          </Card>
        </div>

        {/* Rebalancing & Arbitrage Simulator */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">AI Rebalancer</span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">Supply Arbitrage Simulator</h3>
              </div>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>

            <p className="text-xs text-gray-600 mt-3">
              Calculate producer earnings and urban deficit relief by routing surplus produce to highest-demand metros.
            </p>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Origin Surplus Hub:</label>
                <select
                  value={simOrigin}
                  onChange={(e) => setSimOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Nashik Hub">Nashik Hub (Surplus -31%)</option>
                  <option value="Akola Hub">Akola Hub (Surplus -18%)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Destination Deficit Market:</label>
                <select
                  value={simDestination}
                  onChange={(e) => setSimDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Pune Urban">Pune Urban (Shortage +28%)</option>
                  <option value="Mumbai Urban">Mumbai Urban (Shortage +38%)</option>
                  <option value="Surat Urban">Surat Urban (Shortage +17%)</option>
                  <option value="Delhi Urban">Delhi NCR (Shortage +42%)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-gray-700">Shipment Volume:</label>
                  <span className="font-bold text-indigo-700">{simQuantityTonnes} Tonnes ({simQuantityTonnes * 1000} kg)</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="2"
                  value={simQuantityTonnes}
                  onChange={(e) => setSimQuantityTonnes(Number(e.target.value))}
                  className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <Button
                variant="primary"
                onClick={runSimulation}
                className="w-full py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 border-none shadow-md mt-2"
              >
                Compute Rebalance Economics
              </Button>
            </div>

            {simResult && (
              <div className="mt-5 p-4 bg-white rounded-xl border border-indigo-200 shadow-sm space-y-2.5 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Price Spread ({simResult.origin} &rarr; {simResult.destination}):</span>
                  <strong className="text-gray-900">+₹{simResult.grossSpreadPerKg}/kg</strong>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Freight & Cold Chain Cost:</span>
                  <span className="text-gray-700">₹{simResult.transportPerKg}/kg (₹{simResult.totalLogisticsCost.toLocaleString()})</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Net Producer Extra Gain:</span>
                  <strong className="text-emerald-600 text-sm font-black">+₹{simResult.totalNetGain.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center text-gray-600 pt-2 border-t border-gray-100">
                  <span>Urban Deficit Relief:</span>
                  <strong className="text-indigo-600">{simResult.deficitReliefPercent}% deficit alleviated</strong>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Cross-Regional Indices Bar Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Supply-Demand Parity Across All Monitored Hubs</h3>
            <p className="text-xs text-gray-500">Comparative index for {selectedCrop} showing supply strength vs. consumer pull</p>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="Demand Index" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Supply Index" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
