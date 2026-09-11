import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CropBatch } from '../../types';
import { getMyCropsApi, createOfferApi } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CropPassportModal } from '../../components/common/CropPassportModal';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  QrCode,
  Send,
  CheckCircle2,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { resolveCropImageUrl, handleImageFallback } from '../../utils/cropImages';

export const FarmerMarketplacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<CropBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCrop, setFilterCrop] = useState(searchParams.get('crop') || 'ALL');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');

  // Offer Modal State
  const [selectedCrop, setSelectedCrop] = useState<CropBatch | null>(null);
  const [bidPrice, setBidPrice] = useState('29');
  const [bidQuantity, setBidQuantity] = useState('2000');
  const [bidNotes, setBidNotes] = useState('Direct procurement with escrow settlement.');
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Passport Modal
  const [activePassport, setActivePassport] = useState<any | null>(null);
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMyCropsApi()
      .then((res) => {
        if (res?.success && res.crops) setCrops(res.crops);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleOpenOfferModal = (crop: CropBatch) => {
    setSelectedCrop(crop);
    setBidQuantity(String(crop.remainingKg));
    setBidPrice(crop.cropName === 'Tomato' ? '29' : crop.cropName === 'Onion' ? '31' : '24');
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop) return;
    setIsSending(true);
    try {
      const res = await createOfferApi({
        cropBatchId: selectedCrop.id,
        receiverId: selectedCrop.farmerId,
        offeredPricePerKg: parseFloat(bidPrice),
        quantityKg: parseFloat(bidQuantity),
        notes: bidNotes,
      });
      if (res?.success) {
        setSuccessMessage(`Trade proposal submitted to ${selectedCrop.farmer?.name || 'Farmer'} at ₹${bidPrice}/kg!`);
        setTimeout(() => {
          setSelectedCrop(null);
          setSuccessMessage('');
          navigate('/negotiations');
        }, 1200);
      }
    } catch (e) {
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenPassport = (crop: CropBatch) => {
    setActivePassport(
      crop.passport || {
        passportCode: crop.passportCode,
        cropName: crop.cropName,
        farmerName: crop.farmer?.name || 'Ramesh Patil',
        farmLocation: crop.location,
        harvestDate: crop.harvestDate,
        grade: `${crop.grade} (AI Verified)`,
        shelfLifeHours: crop.shelfLifeHours,
        currentOwner: 'Ramesh Patil (Origin Farm)',
        destination: 'Pune Retail Hub',
        transportType: 'Smart Refrigerated Direct Transit',
        provenanceJson: JSON.stringify([
          { stage: 'Crop Sown', date: '2026-06-15', detail: 'Organic certified seeds, drip irrigation' },
          { stage: 'Quality Inspection', date: '2026-09-07', detail: 'Grade A, 91% quality certified' },
        ]),
      }
    );
    setIsPassportOpen(true);
  };

  const filteredCrops = crops.filter((c) => {
    const matchCrop = filterCrop === 'ALL' || c.cropName.toLowerCase() === filterCrop.toLowerCase();
    const matchGrade = filterGrade === 'ALL' || c.grade === filterGrade;
    const matchSearch =
      !searchQuery ||
      c.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCrop && matchGrade && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Direct Farmer Marketplace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse verified farm harvests, inspect Digital Crop Passports, and submit direct purchase bids.
          </p>
        </div>

        <Button variant="emerald" size="sm" onClick={() => navigate('/post-requirement')}>
          Post a Requirement
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Search Marketplace</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop, farmer name, or location..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <Select
            label="Commodity"
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Commodities' },
              { value: 'Tomato', label: 'Tomato' },
              { value: 'Onion', label: 'Onion' },
              { value: 'Potato', label: 'Potato' },
              { value: 'Wheat', label: 'Wheat' },
            ]}
          />

          <Select
            label="Quality Grade"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Grades' },
              { value: 'GRADE_A', label: 'Grade A (Premium)' },
              { value: 'GRADE_B', label: 'Grade B (Standard)' },
            ]}
          />
        </div>
      </Card>

      {/* Results Count & Grid */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {filteredCrops.length} active farm-gate batches</span>
        <span className="text-emerald-700 font-semibold">100% Verified Traceability</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCrops.map((crop) => (
          <Card key={crop.id} className="overflow-hidden flex flex-col justify-between" hoverEffect>
            <div>
              <div className="h-40 relative bg-slate-100 overflow-hidden">
                <img
                  src={resolveCropImageUrl(crop.imageUrl, crop.cropName)}
                  alt={crop.cropName}
                  onError={(e) => handleImageFallback(e, crop.cropName)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5">
                  <Badge variant="success" size="sm" className="bg-white font-bold shadow-xs">
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
                    <h3 className="text-base font-bold text-slate-900">{crop.cropName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {crop.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      {crop.remainingKg.toLocaleString()} {crop.unit}
                    </span>
                    <p className="text-[10px] text-slate-400">Harvest Lot</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Farmer</span>
                    <span className="font-semibold text-slate-700">{crop.farmer?.name || 'Ramesh Patil'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Harvest Date</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(crop.harvestDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-medium">Fair Market Value:</span>
                  <span className="font-extrabold text-emerald-800 text-sm">₹28 – ₹31/kg</span>
                </div>
              </CardContent>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenPassport(crop)}
                className="text-xs"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-700 mr-1" /> Passport
              </Button>
              <Button
                variant="emerald"
                size="sm"
                onClick={() => handleOpenOfferModal(crop)}
                className="font-semibold"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Make Bid / Offer
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Make Bid Modal */}
      <Modal
        isOpen={Boolean(selectedCrop)}
        onClose={() => setSelectedCrop(null)}
        title={`Submit Purchase Offer for ${selectedCrop?.cropName}`}
        description="Connect directly with the grower. Funds will be held securely in escrow until delivery verification."
        maxWidth="md"
      >
        {successMessage ? (
          <div className="py-6 text-center text-emerald-700 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
            <p className="font-bold text-sm">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitOffer} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Offer Price (₹/kg)"
                type="number"
                step="0.5"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                required
              />
              <Input
                label="Quantity (kg)"
                type="number"
                value={bidQuantity}
                onChange={(e) => setBidQuantity(e.target.value)}
                required
              />
            </div>

            <Input
              label="Delivery / Pickup Terms"
              value={bidNotes}
              onChange={(e) => setBidNotes(e.target.value)}
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setSelectedCrop(null)}>
                Cancel
              </Button>
              <Button variant="emerald" size="sm" type="submit" isLoading={isSending}>
                Send Offer to Farmer
              </Button>
            </div>
          </form>
        )}
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
