import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { downloadFarmerEarningsCsvUrl } from '../../services/api';
import {
  Wallet,
  Download,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const FarmerEarningsPage: React.FC = () => {
  const monthlyData = [
    { month: 'Apr', gross: 32000, net: 26500 },
    { month: 'May', gross: 45000, net: 38200 },
    { month: 'Jun', gross: 38000, net: 31500 },
    { month: 'Jul', gross: 58000, net: 49200 },
    { month: 'Aug', gross: 64000, net: 55400 },
    { month: 'Sep (MTD)', gross: 72000, net: 62800 },
  ];

  const cropShareData = [
    { name: 'Tomato', value: 92000, color: '#16a34a' },
    { name: 'Onion', value: 58000, color: '#0284c7' },
    { name: 'Potato', value: 34500, color: '#f59e0b' },
  ];

  const feeBreakdown = [
    { category: 'Gross Direct Sales', amount: 220000, percent: '100%' },
    { category: 'Smart Transport (Consolidated)', amount: -18500, percent: '8.4%' },
    { category: 'Packaging & Loading', amount: -6500, percent: '2.9%' },
    { category: 'Platform Technology Fee (1%)', amount: -2200, percent: '1.0%' },
    { category: 'Net Banked Realization', amount: 192800, percent: '87.6%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farmer Earnings & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent revenue tracking, deductions breakdown, and value gained through AI recommendations.
          </p>
        </div>

        <a href={downloadFarmerEarningsCsvUrl()} download="farmer_earnings_report.csv">
          <Button variant="emerald" size="sm">
            <Download className="w-4 h-4 mr-1.5" /> Export Earnings CSV
          </Button>
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Realization"
          value="₹192,800"
          subtitle="Net pocket earnings"
          icon={<Wallet className="w-5 h-5 text-emerald-700" />}
          variant="agri"
        />
        <StatCard
          title="This Month (Sep)"
          value="₹62,800"
          subtitle="Active season peak"
          trend={{ value: '+24%', isPositive: true }}
        />
        <StatCard
          title="AI Recommendation Gain"
          value="+₹28,400"
          subtitle="Gained vs baseline APMC"
          icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
          trend={{ value: '+14.7%', isPositive: true }}
        />
        <StatCard
          title="Escrow In Clearing"
          value="₹31,000"
          subtitle="In Transit (MH-15-EG)"
          icon={<DollarSign className="w-5 h-5 text-sky-600" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Earnings Chart */}
        <Card className="p-6 lg:col-span-2 bg-white">
          <CardTitle className="text-base mb-1">Monthly Gross vs Net Pocket Realization (₹)</CardTitle>
          <p className="text-xs text-slate-500 mb-4">Tracking income trajectory after consolidated transport deductions</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip formatter={(val: any) => [`₹${val.toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="gross" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Gross Sales" />
                <Bar dataKey="net" fill="#16a34a" radius={[4, 4, 0, 0]} name="Net Realized" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Crop Contribution Donut */}
        <Card className="p-6 bg-white flex flex-col justify-between">
          <div>
            <CardTitle className="text-base mb-1">Revenue by Commodity</CardTitle>
            <p className="text-xs text-slate-500 mb-4">Contribution by crop</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cropShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => `₹${val.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            {cropShareData.map((c) => (
              <div key={c.name} className="flex justify-between py-0.5">
                <span className="text-slate-600 font-medium">{c.name}:</span>
                <span className="font-bold text-slate-900">₹{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transparent Ledger & Cost Breakdown Table */}
      <Card className="p-6 bg-white">
        <CardTitle className="text-base mb-1">Deductions & Pocket Value Audit</CardTitle>
        <p className="text-xs text-slate-500 mb-4">
          Complete breakdown of gross sales to bank account realization without hidden intermediary cuts.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Financial Ledger Component</th>
                <th className="py-2.5 px-4">Share (%)</th>
                <th className="py-2.5 px-4 text-right">Cumulative Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeBreakdown.map((row) => (
                <tr key={row.category} className={row.amount > 100000 ? 'font-bold bg-slate-50/50' : ''}>
                  <td className="py-3 px-4 text-slate-800">{row.category}</td>
                  <td className="py-3 px-4 text-slate-600">{row.percent}</td>
                  <td
                    className={`py-3 px-4 text-right font-extrabold ${
                      row.amount < 0 ? 'text-rose-600' : 'text-emerald-700 text-sm'
                    }`}
                  >
                    {row.amount < 0 ? `-₹${Math.abs(row.amount).toLocaleString()}` : `₹${row.amount.toLocaleString()}`}
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
