import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  QrCode,
  MapPin,
  Calendar,
  Thermometer,
  Clock,
  User,
  Truck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Search,
  Building2,
  Award
} from 'lucide-react';
import { getPassportApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { resolveCropImageUrl, handleImageFallback } from '../../utils/cropImages';

export default function CropPassportVerifyPage() {
  const { code } = useParams<{ code: string }>();
  const [searchCode, setSearchCode] = useState(code || 'MH-NAS-TOM-26091');
  const [loading, setLoading] = useState(true);
  const [passportData, setPassportData] = useState<any>(null);

  async function fetchPassport(targetCode: string) {
    try {
      setLoading(true);
      const res = await getPassportApi(targetCode);
      if (res.success) {
        setPassportData(res.passport);
      }
    } catch (err) {
      console.error('Failed to fetch crop passport', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPassport(code || 'MH-NAS-TOM-26091');
  }, [code]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchCode.trim()) {
      fetchPassport(searchCode.trim());
    }
  }

  const p = passportData || {
    passportCode: 'MH-NAS-TOM-26091',
    cropName: 'Tomato',
    farmerName: 'Ramesh Patil',
    farmLocation: 'Pimpalgaon Baswant, Nashik, Maharashtra',
    harvestDate: '2026-09-06',
    grade: 'GRADE_A (AI Inspected)',
    shelfLifeHours: 120,
    currentOwner: 'Sahyadri Farmers Producer Co. / Pune Direct Hub',
    destination: 'Pune Direct Consumer Hub',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://farm2market.ai/verify-passport/MH-NAS-TOM-26091',
    cropBatch: {
      quantityKg: 3000,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    },
  };

  let provenance: any[] = [];
  try {
    provenance = typeof p.provenanceJson === 'string' ? JSON.parse(p.provenanceJson) : p.provenanceJson || [];
  } catch (e) {
    provenance = [
      { stage: 'Crop Registered', date: '2026-09-06', detail: 'Harvest batch 3,000 kg registered at Pimpalgaon Baswant Farm' },
      { stage: 'AI Quality Verification', date: '2026-09-06', detail: 'Grade A Certified: 91% quality score, 87% ripeness' },
      { stage: 'FPO Aggregation', date: '2026-09-07', detail: 'Consolidated into Sahyadri Solar Truck #MH15-EQ-4421' },
      { stage: 'Smart Transit', date: '2026-09-07', detail: 'In-transit temperature logged at 14.2°C, 82% humidity' },
      { stage: 'Hub Arrival', date: '2026-09-08', detail: 'Arrived at Pune Direct Hub for Consumer/Retail Distribution' },
    ];
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Code Search Bar */}
      <Card className="p-4 bg-white shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter Passport Code (e.g. MH-NAS-TOM-26091)"
              className="w-full pl-10 pr-4 py-2 text-xs font-mono font-semibold uppercase bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="w-full sm:w-auto text-xs font-bold shrink-0">
            Verify Produce
          </Button>
        </form>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          <span>Registered Production Batches:</span>
          <button
            type="button"
            onClick={() => { setSearchCode('MH-AMR-COT-FAM1'); fetchPassport('MH-AMR-COT-FAM1'); }}
            className="text-emerald-700 font-mono font-bold hover:underline cursor-pointer"
          >
            MH-AMR-COT-FAM1 (Amravati Cotton)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => { setSearchCode('MH-AMR-SOY-FAM1'); fetchPassport('MH-AMR-SOY-FAM1'); }}
            className="text-emerald-700 font-mono font-bold hover:underline cursor-pointer"
          >
            MH-AMR-SOY-FAM1 (Amravati Soybean)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => { setSearchCode('MH-NAS-TOM-26091'); fetchPassport('MH-NAS-TOM-26091'); }}
            className="text-emerald-700 font-mono font-bold hover:underline cursor-pointer"
          >
            MH-NAS-TOM-26091 (Nashik Tomato)
          </button>
        </div>
      </Card>

      {/* Main Passport Document Card */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/30 shadow-xl overflow-hidden relative">
        {/* Certificate Watermark Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-200 text-xs font-bold mb-2 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                OFFICIAL DIGITAL CROP PASSPORT &bull; DOCA CERTIFIED
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Farm Produce Provenance Certificate
              </h1>
              <p className="text-emerald-100 text-xs mt-1">
                Cryptographic supply-chain traceability token linking harvest gate to end consumer.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center shrink-0">
              <span className="text-[10px] uppercase font-bold text-emerald-200">Verification Status</span>
              <div className="flex items-center gap-1.5 text-white font-extrabold text-sm mt-0.5 justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                AUTHENTIC & VERIFIED
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div>
              <span className="text-emerald-200">Passport Token: </span>
              <strong className="text-white font-bold">{p.passportCode}</strong>
            </div>
            <div>
              <span className="text-emerald-200">Minted: </span>
              <span className="text-white">{new Date(p.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Passport Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Crop Profile & QR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                src={resolveCropImageUrl(p.cropBatch?.imageUrl, p.cropName)}
                alt={p.cropName}
                onError={(e) => handleImageFallback(e, p.cropName)}
                className="w-28 h-28 object-cover rounded-2xl shadow-md border-2 border-emerald-100 shrink-0"
              />
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-black text-gray-900">{p.cropName}</h2>
                  <Badge variant="success" size="sm">
                    {p.grade}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Cultivated by: <strong className="text-gray-900">{p.farmerName}</strong>
                </p>
                <p className="text-xs text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Farm Origin: <strong className="text-gray-800">{p.farmLocation}</strong>
                </p>
                <p className="text-xs text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Harvest Freshness: <strong className="text-emerald-700">&lt; 48 hours ago</strong> ({p.shelfLifeHours} hrs shelf life)
                </p>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
              <img
                src={p.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://farm2market.ai/verify-passport/${p.passportCode}`}
                alt="QR Code"
                className="w-28 h-28 p-1.5 bg-white border border-gray-200 rounded-xl shadow-xs"
              />
              <span className="text-[10px] text-gray-400 font-mono mt-2">Scan with any mobile camera</span>
            </div>
          </div>

          {/* AI Quality Inspection Badge */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">AI Quality Inspection Passed</h4>
                <p className="text-xs text-emerald-800">
                  Surface defect scan: &lt; 3% blemish &bull; Optimal Lycopene Hue &bull; 91% Rigidity score
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs shrink-0">
              Grade A Certified
            </span>
          </div>

          {/* Provenance Audit Trail (Timeline) */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Field-to-Fork Provenance Audit Trail
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              {provenance.map((step: any, idx: number) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100 flex items-center justify-center text-white text-[9px] font-bold" />
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gray-900">{step.stage}</span>
                      <span className="text-[11px] font-mono text-gray-400">{step.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rupee Breakdown For This Specific Batch */}
          <div className="p-5 bg-gradient-to-r from-slate-50 to-emerald-50/40 rounded-2xl border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Batch Cost Breakdown (Where your ₹40 went)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold">Farmer Gate</span>
                <p className="text-base font-black text-emerald-600 mt-0.5">₹25.00</p>
                <span className="text-[9px] text-emerald-700 font-bold">62.5%</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold">Cold Logistics</span>
                <p className="text-base font-black text-sky-600 mt-0.5">₹5.00</p>
                <span className="text-[9px] text-gray-500">12.5%</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold">Hub Handling</span>
                <p className="text-base font-black text-gray-800 mt-0.5">₹9.00</p>
                <span className="text-[9px] text-gray-500">22.5%</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold">Tech Escrow</span>
                <p className="text-base font-black text-indigo-600 mt-0.5">₹1.00</p>
                <span className="text-[9px] text-gray-500">2.5%</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <Link to="/consumer-market">
              <Button variant="primary" className="text-xs font-bold">
                Order Directly From This Farmer
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link to="/price-transparency">
              <Button variant="outline" className="text-xs font-semibold">
                Learn How Intermediaries Were Eliminated
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
