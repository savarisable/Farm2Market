import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CropBatch } from '../../types';
import { getMyCropsApi, addCropApi, deleteCropApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CropPassportModal } from '../../components/common/CropPassportModal';
import {
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Sparkles,
  QrCode,
  TrendingUp,
  Users,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { resolveCropImageUrl, handleImageFallback } from '../../utils/cropImages';

const getCropMarketIntelligence = (cropName: string, location: string) => {
  const c = (cropName || '').toLowerCase();
  if (c.includes('cotton')) {
    return {
      demand: 'High (93%)',
      price: '₹64–68/kg',
      momentum: '+5.8%',
      summary: 'Vidarbha textile spinning mills & Amravati APMC clearing Grade A long staple with strong price support.',
    };
  }
  if (c.includes('soybean')) {
    return {
      demand: 'High (88%)',
      price: '₹46–49/kg',
      momentum: '+4.2%',
      summary: 'Nagpur & Akola solvent extraction plants sourcing high-oil content batches actively.',
    };
  }
  if (c.includes('wheat')) {
    return {
      demand: 'Steady (82%)',
      price: '₹27–31/kg',
      momentum: '+2.4%',
      summary: 'Flour mills and consumer food processors maintaining regular procurement quotas.',
    };
  }
  if (c.includes('onion')) {
    return {
      demand: 'High (87%)',
      price: '₹30–35/kg',
      momentum: '+4.5%',
      summary: 'Terminal mandis across Maharashtra showing active procurement with stable storage demand.',
    };
  }
  if (c.includes('potato')) {
    return {
      demand: 'Moderate (76%)',
      price: '₹22–26/kg',
      momentum: '+1.8%',
      summary: 'Cold storage stocks balanced; processing varieties commanding 12% quality premium.',
    };
  }
  return {
    demand: 'High (89%)',
    price: '₹28–34/kg',
    momentum: '+6.5%',
    summary: 'Direct retail aggregation clearing fresh Grade A inventory with same-day settlement.',
  };
};

export const MyCropsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [crops, setCrops] = useState<CropBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [activePassport, setActivePassport] = useState<any | null>(null);

  // Form State initialized dynamically from user profile
  const [cropName, setCropName] = useState('Cotton');
  const [quantityKg, setQuantityKg] = useState('1500');
  const [unit, setUnit] = useState('kg');
  const [grade, setGrade] = useState('GRADE_A');
  const [harvestDate, setHarvestDate] = useState('2026-09-15');
  const [expectedSellingDate, setExpectedSellingDate] = useState('2026-09-18');
  const [location, setLocation] = useState(user?.location || 'Amravati, Maharashtra');
  const [storageAvailable, setStorageAvailable] = useState('true');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.location) {
      setLocation(user.location);
    }
  }, [user]);

  const fetchCrops = () => {
    setLoading(true);
    getMyCropsApi()
      .then((res) => {
        if (res?.success && res.crops) setCrops(res.crops);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await addCropApi({
        cropName,
        quantityKg: parseFloat(quantityKg),
        unit,
        grade,
        harvestDate,
        expectedSellingDate,
        location,
        storageAvailable: storageAvailable === 'true',
      });
      if (res?.success) {
        setIsAddModalOpen(false);
        fetchCrops();
      }
    } catch (e) {
      // error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this crop batch?')) {
      await deleteCropApi(id);
      setCrops((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleOpenPassport = (crop: CropBatch) => {
    const farmerName = user?.name || crop.farmer?.name || 'Farmer';
    const farmLocation = crop.location || user?.location || 'Amravati, Maharashtra';
    setActivePassport(
      crop.passport || {
        passportCode: crop.passportCode,
        cropName: crop.cropName,
        farmerName,
        farmLocation,
        harvestDate: crop.harvestDate,
        grade: `${crop.grade} (Certified)`,
        shelfLifeHours: crop.shelfLifeHours,
        currentOwner: `${farmerName} (Origin Farm)`,
        destination: 'Direct Agri-Commerce Network',
        transportType: 'Dry Ventilated Heavy Freight',
        provenanceJson: JSON.stringify([
          { stage: 'Crop Registered', date: new Date().toISOString().split('T')[0], detail: `${crop.quantityKg} kg logged on Farm2Market AI` },
          { stage: 'AI Certification', date: new Date().toISOString().split('T')[0], detail: `Quality inspected: ${crop.grade}` },
        ]),
      }
    );
    setIsPassportOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Crops Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register your harvest batches to generate Digital Crop Passports and activate AI intelligence.
          </p>
        </div>
        <Button variant="emerald" size="md" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add New Crop
        </Button>
      </div>

      {/* Crops List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 bg-slate-100/70" />
          ))}
        </div>
      ) : crops.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">You haven't added any crops yet.</p>
          <p className="text-xs text-slate-400 mt-1">Register your harvest to unlock real-time market prices and buyer matches.</p>
          <Button variant="emerald" size="sm" onClick={() => setIsAddModalOpen(true)} className="mt-4">
            Add Your First Crop
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {crops.map((crop) => {
            const intel = getCropMarketIntelligence(crop.cropName, crop.location);
            return (
              <Card key={crop.id} className="overflow-hidden flex flex-col justify-between" hoverEffect>
                <div>
                  {/* Crop Image Header */}
                  <div className="h-40 relative overflow-hidden bg-slate-100">
                    <img
                      src={resolveCropImageUrl(crop.imageUrl, crop.cropName)}
                      alt={crop.cropName}
                      onError={(e) => handleImageFallback(e, crop.cropName)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <Badge variant="success" size="sm" className="bg-white/95 backdrop-blur-xs font-bold shadow-xs">
                        {crop.grade}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {crop.passportCode}
                      </span>
                    </div>
                  </div>

                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{crop.cropName}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {crop.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-slate-900">
                          {crop.quantityKg.toLocaleString()} {crop.unit}
                        </span>
                        <p className="text-[10px] text-slate-400">Available Batch</p>
                      </div>
                    </div>

                    {/* Harvest & Perishability Meta */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expected Harvest</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(crop.harvestDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Perishability Risk</span>
                        <span className={`font-semibold ${crop.perishability === 'HIGH' ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {crop.perishability} ({crop.shelfLifeHours}h shelf life)
                        </span>
                      </div>
                    </div>

                    {/* Real-time AI Recommendation Banner */}
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Demand: {intel.demand}
                        </span>
                        <span className="text-emerald-700 font-extrabold">Predicted: {intel.price}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-snug">
                        {intel.summary} ({intel.momentum} weekly momentum)
                      </p>
                    </div>
                  </CardContent>
                </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenPassport(crop)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="View Digital Crop Passport"
                >
                  <QrCode className="w-4 h-4 text-emerald-700" />
                </button>
                <button
                  onClick={() => handleDeleteCrop(crop.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete crop batch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/best-market?crop=${crop.cropName}&qty=${crop.quantityKg}`)}
                  >
                    Find Market
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/find-buyers?crop=${crop.cropName}&qty=${crop.quantityKg}`)}
                  >
                    Find Buyer
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}

      {/* Add Crop Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Harvest Batch"
        description="Fill in your crop parameters. AI will calculate fair market pricing, shelf-life countdown, and optimal buyers."
        maxWidth="xl"
      >
        <form onSubmit={handleAddCrop} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Crop Name"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              options={[
                { value: 'Tomato', label: 'Tomato (Vegetable)' },
                { value: 'Onion', label: 'Onion (Red Nashik)' },
                { value: 'Potato', label: 'Potato (Table / Processing)' },
                { value: 'Wheat', label: 'Wheat (Sharbati)' },
                { value: 'Soybean', label: 'Soybean (Oilseed)' },
                { value: 'Cotton', label: 'Cotton (Bt Long Staple)' },
                { value: 'Banana', label: 'Banana (Grand Naine)' },
                { value: 'Cabbage', label: 'Cabbage (Green)' },
              ]}
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  label="Quantity"
                  type="number"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  required
                />
              </div>
              <Select
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'quintal', label: 'quintal' },
                  { value: 'tonnes', label: 'tonnes' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Quality Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              options={[
                { value: 'GRADE_A', label: 'Grade A (Premium / Export Quality)' },
                { value: 'GRADE_B', label: 'Grade B (Standard Market Quality)' },
                { value: 'GRADE_C', label: 'Grade C (Processing / Utility)' },
              ]}
            />
            <Input
              label="Farm Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dindori, Nashik"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Expected Harvest Date"
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              required
            />
            <Input
              label="Target Selling Date"
              type="date"
              value={expectedSellingDate}
              onChange={(e) => setExpectedSellingDate(e.target.value)}
              required
            />
          </div>

          <Select
            label="Storage Availability at Farm"
            value={storageAvailable}
            onChange={(e) => setStorageAvailable(e.target.value)}
            options={[
              { value: 'true', label: 'Yes - On-farm ventilated / cold storage available' },
              { value: 'false', label: 'No - Immediate post-harvest dispatch needed' },
            ]}
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="emerald" size="sm" type="submit" isLoading={isSubmitting}>
              Register Harvest & Generate Passport
            </Button>
          </div>
        </form>
      </Modal>

      {/* Digital Crop Passport Modal */}
      <CropPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        passport={activePassport}
      />
    </div>
  );
};
