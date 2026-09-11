import React, { useState, useEffect } from 'react';
import { PriceForecastResult, DemandForecastResult } from '../../types';
import { getPriceForecastApi, getDemandForecastApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const MarketIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedLocation, setSelectedLocation] = useState('Nashik');
  const [selectedRegion, setSelectedRegion] = useState('Pune');
  const [selectedHorizon, setSelectedHorizon] = useState(3);

  const [priceData, setPriceData] = useState<PriceForecastResult | null>(null);
  const [demandData, setDemandData] = useState<DemandForecastResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPriceForecastApi(selectedCrop, selectedLocation, selectedHorizon),
      getDemandForecastApi(selectedCrop, selectedRegion),
    ])
      .then(([priceRes, demandRes]) => {
        setPriceData(priceRes);
        setDemandData(demandRes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCrop, selectedLocation, selectedRegion, selectedHorizon]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Market Intelligence & Forecasting</h1>
            <Badge variant="ai" size="sm">
              AI Predictive Forecast
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predicts wholesale price trajectories and regional demand spikes across Maharashtra consumption hubs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/best-market')}>
            <MapPin className="w-4 h-4 text-emerald-600" /> Find Best Market
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/find-buyers')}>
            Find Matched Buyers
          </Button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select
            label="Commodity"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            options={[
              { value: 'Tomato', label: 'Tomato (Grade A/B)' },
              { value: 'Onion', label: 'Onion (Red Nashik)' },
              { value: 'Potato', label: 'Potato (Table)' },
              { value: 'Wheat', label: 'Wheat (Sharbati)' },
              { value: 'Soybean', label: 'Soybean (Oilseed)' },
              { value: 'Cotton', label: 'Cotton (Bt Long Staple)' },
              { value: 'Banana', label: 'Banana (Cavendish)' },
              { value: 'Cabbage', label: 'Cabbage' },
            ]}
          />

          <Select
            label="Origin / Mandi"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            options={[
              { value: 'Nashik', label: 'Nashik APMC / Dindori' },
              { value: 'Pune', label: 'Pune Gultekdi Market Yard' },
              { value: 'Mumbai', label: 'Vashi APMC Navi Mumbai' },
              { value: 'Nagpur', label: 'Nagpur Kalamna Market' },
              { value: 'Surat', label: 'Surat Wholesale Yard' },
            ]}
          />

          <Select
            label="Target Demand Region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            options={[
              { value: 'Pune', label: 'Pune Consumption Hub' },
              { value: 'Mumbai', label: 'Mumbai Metro Terminal' },
              { value: 'Nashik', label: 'Nashik Production Belt' },
              { value: 'Surat', label: 'Surat Industrial Hub' },
              { value: 'Nagpur', label: 'Nagpur Central Hub' },
            ]}
          />

          <Select
            label="Forecast Time Horizon"
            value={String(selectedHorizon)}
            onChange={(e) => setSelectedHorizon(parseInt(e.target.value))}
            options={[
              { value: '1', label: 'Tomorrow (+24 Hours)' },
              { value: '3', label: '+3 Days (Recommended)' },
              { value: '7', label: '+7 Days (Weekly Window)' },
              { value: '14', label: '+14 Days (Mid-term)' },
              { value: '30', label: '+30 Days (Monthly Outlook)' },
            ]}
          />
        </div>
      </Card>

      {/* AI Key Insights Metric Cards */}
      {priceData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-slate-200">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Current Spot Price</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">₹{priceData.currentPrice}</span>
              <span className="text-xs text-slate-500">/ kg</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Local Mandi spot rate</p>
          </Card>

          <Card className="p-4 bg-emerald-50/70 border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-emerald-800">Predicted (+{selectedHorizon}d)</span>
              <AIInsightBadge confidence={priceData.confidencePercent} label="AI FORECAST" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-950">₹{priceData.predictedPrice}</span>
              <span className="text-xs font-bold text-emerald-700">
                {priceData.trendPercent > 0 ? '↑' : '↓'} {Math.abs(priceData.trendPercent)}%
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-1">
              Expected Band: ₹{priceData.expectedRange.min} – ₹{priceData.expectedRange.max}/kg
            </p>
          </Card>

          <Card className="p-4 bg-white border-slate-200">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Strategic Directive</span>
            <div className="mt-1.5">
              <span
                className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wide ${
                  priceData.recommendation === 'SELL WITHIN 3 DAYS' || priceData.recommendation === 'SELL NOW'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {priceData.recommendation}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{priceData.explanation}</p>
          </Card>

          <Card className="p-4 bg-white border-slate-200">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Demand Pressure in {selectedRegion}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-sky-900">{demandData?.currentDemandPercent || 89}%</span>
              <span className="text-xs font-semibold text-sky-700">
                Gap: +{demandData?.shortageSurplusGapPercent || 28}% deficit
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Supply vs Consumption deficit</p>
          </Card>
        </div>
      )}

      {/* Recharts Price Prediction Chart */}
      {priceData && (
        <Card className="p-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <CardTitle className="text-base">Historical Spot & Forward Price Projections</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates supply arrivals, seasonal factors, and terminal hub demand elasticity.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Projected Spot Rate
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-400 ml-2">
                <span className="w-3 h-3 rounded-full bg-emerald-200" /> Confidence Band
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData.forecasts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  domain={['dataMin - 3', 'dataMax + 3']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-agri-300">{data.dayLabel}</p>
                          <p>
                            Predicted Price:{' '}
                            <strong className="text-white text-sm">₹{data.predictedPrice}/kg</strong>
                          </p>
                          <p className="text-slate-300 text-[11px]">
                            Range: ₹{data.minPrice} – ₹{data.maxPrice}/kg
                          </p>
                          <p className="text-emerald-400 text-[10px] font-semibold">
                            Confidence: {data.confidencePercent}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="predictedPrice"
                  stroke="#15803d"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Algorithmic Explanation:</strong> {priceData.explanation} Mandi data refreshed using daily APMC arrivals and consumption index.
            </p>
          </div>
        </Card>
      )}

      {/* Regional Demand Forecasting Section */}
      {demandData && (
        <Card className="p-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Regional Consumption vs Incoming Supply ({selectedRegion})</CardTitle>
                <Badge
                  variant={demandData.alertLevel === 'HIGH' ? 'danger' : demandData.alertLevel === 'MEDIUM' ? 'warning' : 'success'}
                  size="sm"
                >
                  {demandData.gapStatus}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{demandData.recommendation}</p>
            </div>
            {demandData.crossDistrictOpportunity && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                ⚡ {demandData.crossDistrictOpportunity}
              </span>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandData.timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${value}%`,
                    name === 'demand' ? 'Consumer Demand Index' : 'Mandi Supply Index',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="demand" fill="#0284c7" radius={[4, 4, 0, 0]} name="Consumer Demand Index" />
                <Bar dataKey="supply" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Mandi Supply Inflow" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};
