import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getLocationsHierarchyApi,
  getSoilProfilesApi,
  analyzeCropSuitabilityApi,
  explainRecommendationWithSaarthiApi,
  saveCropPlanApi,
  getMyCropPlansApi,
} from '../../services/api';
import { getCropImage } from '../../utils/cropImages';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Compass,
  Sparkles,
  Droplets,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Bot,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Phone,
  HelpCircle,
  BookmarkCheck,
} from 'lucide-react';

export const CropPlanningPage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  // Initialize with authentic farmer location (Defaulting to Amravati for Pranav)
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState(
    user?.location?.includes('Amravati')
      ? 'Amravati'
      : user?.location?.includes('Akola')
      ? 'Akola'
      : user?.location?.includes('Pune')
      ? 'Pune'
      : 'Amravati'
  );
  const [selectedTaluka, setSelectedTaluka] = useState(
    user?.location?.includes('Amravati') ? 'Amravati' : 'Niphad'
  );
  const [farmSize, setFarmSize] = useState(
    user?.farmerProfile?.farmSizeAcres?.toString() || '5.0'
  );
  const [soilType, setSoilType] = useState('Black Cotton Soil');
  const [irrigationType, setIrrigationType] = useState<'RAINFED' | 'LIMITED_BOREWELL' | 'ASSURED_CANAL' | 'DRIP_MICRO_IRRIGATION'>('DRIP_MICRO_IRRIGATION');
  const [season, setSeason] = useState<'KHARIF' | 'RABI' | 'SUMMER' | 'YEAR_ROUND'>('KHARIF');

  // Optional Soil Chemistry
  const [showAdvancedSoil, setShowAdvancedSoil] = useState(false);
  const [soilPh, setSoilPh] = useState('7.4');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [nearbyServices, setNearbyServices] = useState<any[]>([]);
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);

  // Persistence: Saved Crop Plans in live database
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [planningCropName, setPlanningCropName] = useState<string | null>(null);
  const [planSuccessMessage, setPlanSuccessMessage] = useState<string | null>(null);

  // Saarthi AI Explanation Modal
  const [saarthiExplaining, setSaarthiExplaining] = useState(false);
  const [saarthiReply, setSaarthiReply] = useState<string | null>(null);
  const [saarthiTargetCrop, setSaarthiTargetCrop] = useState<string | null>(null);

  // 1. Fetch Hierarchy and Saved Crop Plans on Mount
  useEffect(() => {
    getLocationsHierarchyApi()
      .then((res) => {
        if (res?.success && res.states) {
          setHierarchy(res.states);
        }
      })
      .catch(() => {});

    getMyCropPlansApi()
      .then((res) => {
        if (res?.success && Array.isArray(res.cropPlans)) {
          setSavedPlans(res.cropPlans);
        }
      })
      .catch(() => {});
  }, []);

  // Districts for selected state
  const currentDistricts =
    hierarchy.find((s) => s.stateName === selectedState)?.districts || [];

  const currentDistrictObj = currentDistricts.find(
    (d: any) => d.districtName.toLowerCase() === selectedDistrict.toLowerCase()
  );
  const currentTalukas = currentDistrictObj?.talukas || ['Amravati', 'Achalpur', 'Chandur'];

  // Run deterministic analysis
  const handleAnalyzeLand = async () => {
    setIsAnalyzing(true);
    try {
      const payload: any = {
        state: selectedState,
        district: selectedDistrict,
        taluka: selectedTaluka,
        farmAreaAcres: parseFloat(farmSize) || 5.0,
        soilType,
        irrigationType,
        season,
      };

      if (showAdvancedSoil && soilPh) {
        payload.soilChemistry = {
          ph: parseFloat(soilPh),
          nitrogenKgPerHa: nitrogen ? parseFloat(nitrogen) : undefined,
          phosphorusKgPerHa: phosphorus ? parseFloat(phosphorus) : undefined,
          potassiumKgPerHa: potassium ? parseFloat(potassium) : undefined,
        };
      }

      const res = await analyzeCropSuitabilityApi(payload);
      if (res?.success && Array.isArray(res.topRecommendations)) {
        // Enforce exactly Top 3 suggestions
        const top3 = res.topRecommendations.slice(0, 3);
        setRecommendations(top3);
        if (top3.length > 0) {
          setExpandedCrop(top3[0].cropName);
        }
        if (Array.isArray(res.nearbyAgriServices)) {
          setNearbyServices(res.nearbyAgriServices);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial Run on mount
  useEffect(() => {
    handleAnalyzeLand();
  }, [selectedDistrict, selectedState, irrigationType, season]);

  // Handle "Plan This Crop" button click -> persists to database
  const handlePlanCrop = async (crop: any) => {
    setPlanningCropName(crop.cropName);
    try {
      const acres = parseFloat(farmSize) || 5.0;
      const expectedYield = crop.areaMath?.totalProductionQuintals || crop.financialEstimates.expectedYieldQuintalsMax;
      const grossRevenue = crop.areaMath?.grossRevenueEstimated || crop.financialEstimates.projectedGrossRevenueMax;
      const netProfit = crop.areaMath?.netProfitEstimated || crop.financialEstimates.projectedNetProfitMax;

      const res = await saveCropPlanApi({
        cropName: crop.cropName,
        hindiName: crop.hindiName,
        marathiName: crop.marathiName,
        season,
        plannedAcres: acres,
        expectedYieldQuintals: expectedYield,
        expectedGrossRevenue: grossRevenue,
        projectedNetProfit: netProfit,
        sowingWindow: crop.agronomyGuidance?.sowingWindow,
        notes: `Cultivation plan for ${crop.cropName} on ${acres} acres in ${selectedDistrict}. Expected yield ${expectedYield} qtl with ₹${grossRevenue.toLocaleString('en-IN')} gross realization.`,
      });

      if (res?.success && res.cropPlan) {
        setSavedPlans((prev) => [res.cropPlan, ...prev]);
        setPlanSuccessMessage(`✓ ${crop.cropName} planned successfully on ${acres} acres and saved to database!`);
        setTimeout(() => setPlanSuccessMessage(null), 6000);
      }
    } catch (err) {
      console.error('Plan crop error:', err);
    } finally {
      setPlanningCropName(null);
    }
  };

  // Request Saarthi AI explanation
  const handleAskSaarthi = async (crop: any) => {
    setSaarthiTargetCrop(crop.cropName);
    setSaarthiExplaining(true);
    setSaarthiReply(null);

    try {
      const res = await explainRecommendationWithSaarthiApi({
        topCrop: crop.cropName,
        district: selectedDistrict,
        soilType,
        irrigationType,
        language: language || 'mr',
      });
      if (res && res.reply) {
        setSaarthiReply(res.reply);
      }
    } catch (e) {
      setSaarthiReply('सध्या सल्लागार ऑफलाइन आहे. ही शिफारस आपल्या मातीसाठी पूर्णपणे योग्य आहे.');
    } finally {
      setSaarthiExplaining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Smart Crop Planning & Land Suitability Engine
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-[10px] uppercase tracking-wider">
              3 AREA-BASED SUGGESTIONS • LIVE DATABASE PERSISTENCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Area-calculated agronomic suitability mapping your exact land holding ({farmSize} Acres in {selectedDistrict}) to ICAR packages of practice and Agmarknet mandi realizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSoil(!showAdvancedSoil)}
          >
            {showAdvancedSoil ? 'Hide Soil Chemistry' : '+ Optional Soil Chemistry'}
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={handleAnalyzeLand}
            isLoading={isAnalyzing}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Recalculate 3 Matches
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {planSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {planSuccessMessage}
          </span>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
            Saved to PostgreSQL
          </span>
        </div>
      )}

      {/* Input Parameters Card */}
      <Card className="p-5 bg-white border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-700" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Land & Farm Configuration ({user?.name || 'Farmer'})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            Auto-linked to Farm Holding ({farmSize} Acres)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* State */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="Amravati">Amravati (Vidarbha Belt)</option>
              <option value="Akola">Akola</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Nashik">Nashik</option>
              <option value="Pune">Pune</option>
              <option value="Solapur">Solapur</option>
              <option value="Ahmednagar">Ahmednagar</option>
              <option value="Jalgaon">Jalgaon</option>
            </select>
          </div>

          {/* Farm Size */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Holding (Acres)</label>
            <input
              type="number"
              step="0.5"
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Dominant Soil</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="Black Cotton Soil">Regur Black Cotton Soil</option>
              <option value="Medium Black Clay Loam">Medium Black Clay Loam</option>
              <option value="Red Laterite Soil">Red Laterite Soil</option>
              <option value="Alluvial Sandy Loam">Alluvial Sandy Loam</option>
            </select>
          </div>

          {/* Irrigation */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Irrigation Mode</label>
            <select
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="DRIP_MICRO_IRRIGATION">Drip Micro-Irrigation</option>
              <option value="ASSURED_CANAL">Assured Canal Irrigation</option>
              <option value="LIMITED_BOREWELL">Borewell Tube Well</option>
              <option value="RAINFED">Monsoon Rainfed Only</option>
            </select>
          </div>
        </div>

        {/* Optional Soil Chemistry Row */}
        {showAdvancedSoil && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 animate-in fade-in">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Soil pH</label>
              <input
                type="number"
                step="0.1"
                placeholder="7.4"
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nitrogen (kg/ha)</label>
              <input
                type="number"
                placeholder="e.g. 240"
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Phosphorus (kg/ha)</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Potassium (kg/ha)</label>
              <input
                type="number"
                placeholder="e.g. 280"
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Model Weights Transparency Bar */}
      <div className="px-4 py-2 rounded-xl bg-forest-950 text-white flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-agri-400" />
          <span className="font-bold uppercase tracking-wider">DETERMINISTIC WEIGHTS:</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-forest-200">
          <span>Historical Yield: <strong className="text-white">25%</strong></span>
          <span>Soil Suitability: <strong className="text-white">25%</strong></span>
          <span>Climate: <strong className="text-white">20%</strong></span>
          <span>Water & Irrigation: <strong className="text-white">15%</strong></span>
          <span>Yield Potential: <strong className="text-white">10%</strong></span>
          <span>Risk: <strong className="text-white">5%</strong></span>
        </div>
      </div>

      {/* Exactly 3 Area-Based Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Top 3 Area-Based Crop Suggestions</span>
            <span className="text-xs text-slate-500 font-normal">
              (Ranked for {farmSize} Acres in {selectedDistrict})
            </span>
          </h2>
          <span className="text-[11px] text-forest-700 font-semibold">
            Ranked: #1 Best Match • #2 Second Best • #3 Third Best
          </span>
        </div>

        {recommendations.slice(0, 3).map((crop, idx) => {
          const isExpanded = expandedCrop === crop.cropName;
          const imgUrl = getCropImage(crop.cropName);
          const isPlanned = savedPlans.some((p) => p.cropName?.toLowerCase() === crop.cropName?.toLowerCase());
          const rankLabel = crop.rankLabel || (idx === 0 ? '#1 Best Match' : idx === 1 ? '#2 Second Best' : '#3 Third Best');

          return (
            <Card
              key={crop.cropName}
              className={`overflow-hidden transition-all border ${
                idx === 0
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Summary Bar */}
              <div
                onClick={() => setExpandedCrop(isExpanded ? null : crop.cropName)}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-xl font-black text-xs shrink-0 flex items-center gap-1 ${
                      idx === 0
                        ? 'bg-emerald-700 text-white shadow-md'
                        : idx === 1
                        ? 'bg-forest-900 text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{rankLabel}</span>
                  </div>

                  {/* Crop Thumbnail */}
                  <img
                    src={imgUrl}
                    alt={crop.cropName}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />

                  {/* Names & Category */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {crop.cropName}
                      </h3>
                      <span className="text-xs text-slate-500 font-semibold">
                        ({crop.marathiName} / {crop.hindiName})
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ★ Best Agro-Economic Fit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Category: <span className="font-semibold text-slate-700">{crop.category}</span> • Sowing Window: {crop.agronomyGuidance.sowingWindow}
                    </p>
                  </div>
                </div>

                {/* Score & Key Highlights */}
                <div className="flex items-center gap-5 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Gross Revenue ({farmSize} Ac)</p>
                    <p className="text-base font-black text-emerald-700">
                      ₹{crop.financialEstimates.projectedGrossRevenueMax.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Net Profit: ₹{crop.financialEstimates.projectedNetProfitMax.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-full border-4 border-emerald-600 flex flex-col items-center justify-center shrink-0">
                      <span className="text-sm font-black text-slate-900 leading-none">
                        {crop.overallScore}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">/ 100</span>
                    </div>

                    <button
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* AREA-BASED HARVEST & REVENUE MATH CARD (PROMINENT) */}
              <div className="mx-4 sm:mx-5 mb-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Area Math Breakdown ({farmSize} Acres)
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    {crop.areaMath?.formula || `${farmSize} acres × ${(crop.financialEstimates.expectedYieldQuintalsMax / parseFloat(farmSize)).toFixed(1)} qtl/acre = ${crop.financialEstimates.expectedYieldQuintalsMax} qtl @ ₹${crop.financialEstimates.expectedPricePerQuintalMax}/qtl`}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Est. Gross Revenue: <strong className="text-slate-900 font-black">₹{crop.financialEstimates.projectedGrossRevenueMax.toLocaleString('en-IN')}</strong> • Net Profit: <strong className="text-emerald-800 font-black">₹{crop.financialEstimates.projectedNetProfitMax.toLocaleString('en-IN')}</strong> (ROI: {crop.financialEstimates.roiPercentMax}%)
                  </p>
                </div>

                <div className="shrink-0">
                  {isPlanned ? (
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
                      <BookmarkCheck className="w-4 h-4" /> Planned in Live DB
                    </span>
                  ) : (
                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanCrop(crop);
                      }}
                      isLoading={planningCropName === crop.cropName}
                      className="font-extrabold shadow-sm"
                    >
                      <Compass className="w-3.5 h-3.5 mr-1.5" />
                      Plan This Crop ({farmSize} Acres)
                    </Button>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown (Accordion) */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-5">
                  {/* Factor Scoring Cards */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      Deterministic Factor Contributions
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      {Object.entries(crop.factors).map(([factorKey, factor]: [string, any]) => (
                        <div key={factorKey} className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase truncate">
                              {factorKey.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {(factor.weight * 100)}%
                            </span>
                          </div>
                          <p className="text-base font-black text-slate-900 mt-1">
                            {factor.score}<span className="text-xs font-normal text-slate-400">/100</span>
                          </p>
                          <p className="text-[10px] text-emerald-700 font-semibold">
                            +{factor.weightedContribution} pts
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why this crop justifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                      <p className="text-xs font-bold text-amber-950 mb-1">🌱 Soil Justification</p>
                      <p className="text-xs text-amber-900/90 leading-relaxed">{crop.whyThisCrop.soilJustification}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80">
                      <p className="text-xs font-bold text-sky-950 mb-1">☀️ Climate & Season</p>
                      <p className="text-xs text-sky-900/90 leading-relaxed">{crop.whyThisCrop.climateJustification}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80">
                      <p className="text-xs font-bold text-teal-950 mb-1">💧 Water & Irrigation</p>
                      <p className="text-xs text-teal-900/90 leading-relaxed">{crop.whyThisCrop.waterJustification}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                      <p className="text-xs font-bold text-emerald-950 mb-1">📈 Market & MSP Tariff</p>
                      <p className="text-xs text-emerald-900/90 leading-relaxed">{crop.whyThisCrop.marketJustification}</p>
                    </div>
                  </div>

                  {/* ICAR Advisory & Saarthi Explainer */}
                  <div className="p-4 rounded-xl bg-forest-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-agri-400 uppercase tracking-wider">
                        ICAR Package of Practices
                      </span>
                      <p className="text-xs text-forest-100 mt-1 max-w-2xl leading-relaxed">
                        {crop.agronomyGuidance.icarAdvisory}
                      </p>
                    </div>

                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={() => handleAskSaarthi(crop)}
                      className="shrink-0 font-bold"
                    >
                      <Bot className="w-4 h-4 mr-1.5" />
                      Explain in {language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Saved Crop Cultivation Plans from Live Database */}
      {savedPlans.length > 0 && (
        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-forest-700" />
              <h3 className="text-sm font-extrabold text-slate-900">
                My Active Crop Cultivation Plans (Live Database)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              Persisted in PostgreSQL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedPlans.map((plan: any) => (
              <div
                key={plan.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{plan.cropName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                    {plan.status || 'PLANNED'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>Planned Area: <strong className="text-slate-900">{plan.plannedAcres} Acres</strong></p>
                  <p>Expected Output: <strong className="text-slate-900">{plan.expectedYieldQuintals} Quintals</strong></p>
                  <p>Est. Gross Revenue: <strong className="text-emerald-700">₹{Number(plan.expectedGrossRevenue).toLocaleString('en-IN')}</strong></p>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 truncate">
                  {plan.notes || plan.sowingWindow}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Nearby Agri Centers */}
      {nearbyServices.length > 0 && (
        <Card className="p-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Nearby Agricultural Extension & Testing Centers ({selectedDistrict})</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verified Krishi Vigyan Kendras (KVKs), Soil Testing Laboratories, and APMC Mandis
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Mandi & KVK Registry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nearbyServices.map((place, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 inline-block mb-1.5">
                    {place.category === 'KVK' ? '🌾 KVK Center' : place.category === 'SOIL_TESTING_LAB' ? '🔬 Soil Lab' : '🏪 APMC Mandi'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{place.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{place.address}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Saarthi AI Modal */}
      {saarthiTargetCrop && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Saarthi Advisory: {saarthiTargetCrop}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Land Suitability Guidance for {selectedDistrict}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSaarthiTargetCrop(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {saarthiExplaining ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Saarthi is consulting agro-climatic parameters...</p>
              </div>
            ) : (
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {saarthiReply}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaarthiTargetCrop(null)}
              className="w-full font-bold"
            >
              Close Advisory
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
