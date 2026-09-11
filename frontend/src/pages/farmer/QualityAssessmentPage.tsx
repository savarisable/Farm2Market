import React, { useState, useRef, useEffect } from 'react';
import { assessQualityApi, getMyCropsApi, attachInspectionApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  Camera,
  CameraOff,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  Check,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const isDefectTrait = (feature: string) => {
  const lower = (feature || '').toLowerCase();
  return (
    lower.includes('rot') ||
    lower.includes('mold') ||
    lower.includes('mould') ||
    lower.includes('defect') ||
    lower.includes('damage') ||
    lower.includes('lesion') ||
    lower.includes('spot') ||
    lower.includes('borer') ||
    lower.includes('trash') ||
    lower.includes('discolor') ||
    lower.includes('spoilage') ||
    lower.includes('stain') ||
    lower.includes('cut') ||
    lower.includes('blemish') ||
    lower.includes('bruis') ||
    lower.includes('pest') ||
    lower.includes('contamin') ||
    lower.includes('humidity') ||
    lower.includes('clump') ||
    lower.includes('necrotic') ||
    lower.includes('decay')
  );
};

export const QualityAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, t, tcrop, tcity, tgrade } = useLanguage();
  const [crops, setCrops] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [cropName, setCropName] = useState('Cotton');
  const [quantityKg, setQuantityKg] = useState('1500');
  const [location, setLocation] = useState('Amravati, Maharashtra');

  // Multi-photo state (up to 3 photos)
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);
  const [assessment, setAssessment] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachedSuccess, setAttachedSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getMyCropsApi()
      .then((res) => {
        if (res?.success && res.crops && res.crops.length > 0) {
          setCrops(res.crops);
          const firstCrop = res.crops[0];
          setSelectedBatchId(firstCrop.id);
          setCropName(firstCrop.cropName);
          setQuantityKg(firstCrop.quantityKg.toString());
          if (firstCrop.location) setLocation(firstCrop.location);
        }
      })
      .catch(() => {});
  }, []);

  const handleBatchSelect = (batchId: string) => {
    setSelectedBatchId(batchId);
    const found = crops.find((c) => c.id === batchId);
    if (found) {
      setCropName(found.cropName);
      setQuantityKg(found.quantityKg.toString());
      if (found.location) setLocation(found.location);
    }
  };

  // Start live camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera failed:', err);
      setCameraError('Camera access unavailable or permission not granted. You can still upload produce photos below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from active video
  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (photos.length < 3) {
      setPhotos((prev) => {
        const next = [...prev, dataUrl];
        setSelectedPhotoIdx(next.length - 1);
        return next;
      });
    } else {
      setPhotos([dataUrl]);
      setSelectedPhotoIdx(0);
    }
  };

  // Upload photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (photos.length < 3) {
        setPhotos((prev) => {
          const next = [...prev, base64];
          setSelectedPhotoIdx(next.length - 1);
          return next;
        });
      } else {
        setPhotos([base64]);
        setSelectedPhotoIdx(0);
      }
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (selectedPhotoIdx >= next.length) {
        setSelectedPhotoIdx(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  // Run AI Quality Assessment & Market Valuation
  const handleRunAssessment = async () => {
    setIsScanning(true);
    setAttachedSuccess(false);
    try {
      const res = await assessQualityApi({
        cropName,
        location,
        quantityKg: parseFloat(quantityKg) || 1500,
        images: photos.length > 0 ? photos : undefined,
        base64Image: photos.length > 0 ? photos[0] : undefined,
        language,
      });

      if (res?.success && res.assessment) {
        setAssessment(res.assessment);
      }
    } catch (e) {
      console.error('Inspection error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  // Attach inspection certificate to batch in database
  const handleAttachToBatch = async () => {
    if (!assessment) return;
    setIsAttaching(true);
    try {
      const res = await attachInspectionApi({
        cropBatchId: selectedBatchId || undefined,
        cropName: assessment.cropName,
        grade: assessment.grade,
        overallScore: assessment.qualityScorePercent,
        estimatedPricePerKg: assessment.pricing.estimatedPricePerKg,
        estimatedPricePerQtl: assessment.pricing.estimatedPricePerQtl,
        priceRangeMinPerQtl: assessment.pricing.priceRangeMinPerQtl,
        priceRangeMaxPerQtl: assessment.pricing.priceRangeMaxPerQtl,
        estimatedBatchValue: assessment.pricing.estimatedBatchValue,
        referenceMarketName: assessment.pricing.referenceMarket,
        referenceModalPrice: assessment.pricing.referenceModalPricePerKg,
        imageQualityStatus: assessment.imageQuality?.status || 'GOOD',
        observations: assessment.observations,
        imageUrl: photos[0] || undefined,
      });

      if (res?.success) {
        setAttachedSuccess(true);
      }
    } catch (err) {
      console.error('Attach inspection error:', err);
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('qualityAssessmentTitle')}
            </h1>
            <Badge variant="success" size="sm" className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> AI Visual Valuation
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('qualityAssessmentSubtitle')}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/my-crops')}>
          {t('backToMyCrops')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera / Multi-Photo Capture (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-white space-y-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <CardTitle>{t('cameraAndProduceInput')}</CardTitle>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('camera');
                    if (!isCameraActive) startCamera();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'camera'
                      ? 'bg-white text-forest-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" /> {t('liveSensor')}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    stopCamera();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-white text-forest-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5" /> {t('uploadPhotosTab')}
                  </div>
                </button>
              </div>
            </div>

            {/* Select Registered Crop Batch */}
            {crops.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('selectRegisteredCropBatch')}
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => handleBatchSelect(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {tcrop(c.cropName)} — {c.quantityKg} kg ({tcity(c.location || 'Amravati')}) [{c.passportCode}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Commodity & Batch Size Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Select
                  label={t('produceCommodity')}
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  options={[
                    { value: 'Cotton', label: `${tcrop('Cotton')} (Bt Long Staple)` },
                    { value: 'Soybean', label: `${tcrop('Soybean')} (Yellow JS-335)` },
                    { value: 'Wheat', label: `${tcrop('Wheat')} (Sharbati / Lokwan)` },
                    { value: 'Tomato', label: `${tcrop('Tomato')} (Red Salad / Processing)` },
                    { value: 'Onion', label: `${tcrop('Onion')} (Red Nashik)` },
                    { value: 'Grapes', label: `${tcrop('Grapes')} (Thomson Seedless)` },
                    { value: 'Banana', label: `${tcrop('Banana')} (Grand Naine)` },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('batchQuantityKg')}
                </label>
                <input
                  type="number"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  placeholder="e.g. 1500"
                />
              </div>
            </div>

            {/* Video Viewport / Capture Canvas */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-200 shadow-inner">
              {activeTab === 'camera' ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
                  />

                  {!isCameraActive && (
                    <div className="text-center p-5 space-y-2.5">
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{t('liveCameraInactive')}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t('noAssessmentRunDesc')}
                        </p>
                      </div>
                      {cameraError && (
                        <p className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                          {cameraError}
                        </p>
                      )}
                      <Button variant="emerald" size="sm" onClick={startCamera} className="font-bold">
                        <Camera className="w-3.5 h-3.5 mr-1.5" /> {t('launchCameraSensor')}
                      </Button>
                    </div>
                  )}

                  {isCameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-3">
                      <div className="w-full flex items-center justify-between text-[10px] text-white/90 font-mono bg-slate-950/50 backdrop-blur-xs px-2.5 py-1 rounded-md">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          {t('opticalSensorActive')}
                        </span>
                        <span>{tcrop(cropName).toUpperCase()} DETECTION</span>
                      </div>

                      <div className="w-44 h-44 border-2 border-dashed border-emerald-400/80 rounded-2xl relative">
                        <span className="absolute top-1 left-1.5 text-[8px] font-bold text-emerald-400 tracking-wider">
                          {t('targetFocus')}
                        </span>
                      </div>

                      <div className="text-[10px] text-white/80 bg-slate-950/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Hold produce within focus box • Capture up to 3 photos
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* UPLOAD TAB - Show active photo if available */
                photos.length > 0 ? (
                  <div className="relative w-full h-full group bg-slate-950 flex items-center justify-center">
                    <img
                      src={photos[selectedPhotoIdx] || photos[0]}
                      alt="Harvest Produce"
                      className="w-full h-full object-contain"
                    />

                    {/* Laser Scan Animation when isScanning is true */}
                    {isScanning && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                        <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[0.5px]" />
                      </div>
                    )}

                    {/* Optical inspection reticle overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-3">
                      <div className="w-full flex items-center justify-between text-[10px] text-white/90 font-mono bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-md">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                          {isScanning ? t('processingScanner') : t('opticalSensorActive')}
                        </span>
                        <span>{tcrop(cropName).toUpperCase()} • PHOTO {(selectedPhotoIdx || 0) + 1}/{photos.length}</span>
                      </div>

                      <div className="w-48 h-48 border-2 border-dashed border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                        <span className="absolute top-1.5 left-2 text-[9px] font-mono font-bold text-emerald-400 tracking-wider">
                          {t('targetFocus')}
                        </span>
                        <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-emerald-300">
                          AI OPTICAL ANALYSIS
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-between text-[10px] text-white/90">
                        <span className="bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-xs">
                          {tcrop(cropName)} • {quantityKg} kg
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="pointer-events-auto bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors flex items-center gap-1 shadow"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          {t('changePhoto')}
                        </button>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">{t('clickToUploadPhoto')}</p>
                    <p className="text-[10px] text-slate-400">{t('orUploadImages')}</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Photo Tray (Up to 3 photos) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{t('multiPhotoInspectionTray')} ({photos.length}/3)</span>
                {photos.length > 0 && (
                  <button
                    onClick={() => setPhotos([])}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    {t('clearAll')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((idx) => {
                  const photo = photos[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => photo && setSelectedPhotoIdx(idx)}
                      className={`aspect-square rounded-xl border ${
                        selectedPhotoIdx === idx && photo
                          ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                          : 'border-slate-200'
                      } bg-slate-50 relative overflow-hidden flex items-center justify-center cursor-pointer transition-all`}
                    >
                      {photo ? (
                        <>
                          <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(idx);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-slate-900/70 px-1 py-0.5 rounded">
                            Photo {idx + 1}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 text-center px-1">
                          {idx === 0 ? 'Overview' : idx === 1 ? 'Close-up' : 'Texture'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Camera Controls & Action Button */}
            <div className="space-y-2 pt-1">
              {isCameraActive && (
                <div className="flex gap-2">
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={captureFrame}
                    className="flex-1 font-bold"
                    disabled={photos.length >= 3}
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" />
                    {t('takeSnapshot')} ({photos.length}/3)
                  </Button>
                  <Button variant="outline" size="sm" onClick={stopCamera}>
                    <CameraOff className="w-3.5 h-3.5 mr-1" /> {t('stopLiveCamera')}
                  </Button>
                </div>
              )}

              <Button
                variant="emerald"
                size="lg"
                onClick={handleRunAssessment}
                isLoading={isScanning}
                className="w-full font-extrabold shadow-md text-sm py-2.5"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('runAiQualityEngine')}
              </Button>
            </div>

            {/* Image Quality Pre-check status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-forest-700" /> {t('imageQualityPreCheck')}
                </span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {photos.length > 0 ? 'GOOD (OPTIMAL)' : 'READY'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {photos.length > 0
                  ? 'High dynamic range lighting & sharp subject edge detected. Calibrated for color hue and staple/surface uniformity.'
                  : 'Capture or upload photos to inspect surface defects, ripeness index, and size uniformity.'}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Inspection Results & Valuation Engine (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isScanning ? (
            <Card className="p-12 bg-white text-center space-y-4 border border-slate-200">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {t('processingScanner')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Performing color spectrum analysis, evaluating optical defect ratio, querying APMC modal rates for {tcrop(cropName)}, and computing quality-adjusted batch realization.
                </p>
              </div>
            </Card>
          ) : assessment ? (
            <div className="space-y-4 animate-in fade-in">
              {/* 1. ESTIMATED MARKET VALUE CARD */}
              <Card className="p-5 bg-gradient-to-br from-forest-950 via-forest-900 to-slate-950 text-white shadow-lg border-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-forest-800/80">
                  <div>
                    <span className="text-[10px] font-bold text-agri-400 tracking-wider uppercase">
                      {t('estimatedMarketValueTitle')}
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      {t('estimatedMarketValueTitle')}: {tcrop(assessment.cropName)}
                    </h3>
                  </div>
                  <Badge variant="success" size="sm" className="font-mono text-xs">
                    {assessment.inspectionCode}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Left: Per Unit Pricing */}
                  <div className="space-y-1">
                    <span className="text-xs text-forest-200 font-semibold">{t('estimatedQualityPrice')}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        ₹{Number(assessment.pricing.estimatedPricePerQtl).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-forest-300">/ quintal</span>
                    </div>
                    <p className="text-xs text-agri-300 font-bold">
                      ₹{assessment.pricing.estimatedPricePerKg.toFixed(2)} / kg
                    </p>
                    <div className="text-[11px] text-forest-300 pt-1">
                      {t('expectedMandiRange')}:{' '}
                      <span className="font-bold text-white">
                        ₹{assessment.pricing.priceRangeMinPerQtl.toLocaleString('en-IN')} – ₹{assessment.pricing.priceRangeMaxPerQtl.toLocaleString('en-IN')}
                      </span>{' '}
                      / qtl
                    </div>
                  </div>

                  {/* Right: Total Batch Value */}
                  <div className="space-y-1 bg-forest-900/60 p-3 rounded-xl border border-forest-800">
                    <span className="text-xs text-forest-200 font-semibold">
                      {t('totalBatchValue')} ({assessment.pricing.batchQuantityQuintals} qtl / {assessment.pricing.batchQuantityKg} kg)
                    </span>
                    <p className="text-2xl font-black text-white">
                      ₹{Number(assessment.pricing.estimatedBatchValue).toLocaleString('en-IN')}
                    </p>
                    {assessment.pricing.directFarmerGain >= 0 ? (
                      <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 pt-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +₹{Number(assessment.pricing.directFarmerGain).toLocaleString('en-IN')} {t('premiumOverModal')}
                      </div>
                    ) : (
                      <div className="text-[11px] text-rose-400 font-bold flex items-center gap-1 pt-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        -₹{Number(Math.abs(assessment.pricing.directFarmerGain)).toLocaleString('en-IN')} {t('discountUnderModal')}
                      </div>
                    )}
                    <p className="text-[10px] text-forest-300">
                      {t('mandiModalBaseline')}: ₹{Number(assessment.pricing.mandiBenchmarkBatchValue).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* AI Summary note */}
                <p className="text-xs text-forest-200 mt-3 pt-3 border-t border-forest-800/80 leading-relaxed">
                  {assessment.aiSummary}
                </p>
              </Card>

              {/* 2. 4 OPTICAL GRADE METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">{t('qualityGrade')}</span>
                  <p className="text-lg font-black text-forest-900 mt-0.5">
                    {tgrade(assessment.grade)}
                  </p>
                  <span className={`text-[10px] font-bold ${assessment.grade === 'GRADE_C' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {assessment.grade === 'GRADE_A' ? 'Premium Export' : assessment.grade === 'GRADE_B' ? 'Standard APMC' : 'Industrial / Discount'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">{t('opticalScore')}</span>
                  <p className={`text-2xl font-black mt-0.5 ${assessment.qualityScorePercent < 70 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {assessment.qualityScorePercent}%
                  </p>
                  <span className="text-[10px] text-slate-500">Benchmark: 85%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">{t('ripenessIndex')}</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {assessment.ripenessPercent}%
                  </p>
                  <span className="text-[10px] text-slate-500">Retail Ready</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">{t('visibleDefects')}</span>
                  <p className={`text-2xl font-black mt-0.5 ${assessment.visibleDamagePercent > 10 ? 'text-rose-600' : assessment.visibleDamagePercent > 4 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {assessment.visibleDamagePercent}%
                  </p>
                  <span className={`text-[10px] font-semibold ${assessment.visibleDamagePercent > 10 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {assessment.visibleDamagePercent > 10 ? 'High Defect (>10%)' : '< 5% Tolerated'}
                  </span>
                </div>
              </div>

              {/* 3. STRUCTURED VISUAL OBSERVATIONS (3 States with Smart Defect Color Coding) */}
              <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{t('structuredObservationsTitle')}</CardTitle>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {t('threeStateVerification')}
                  </span>
                </div>

                <div className="space-y-2">
                  {assessment.observations?.map((obs: any, idx: number) => {
                    const isDetected = obs.status === 'DETECTED';
                    const isNotDetected = obs.status === 'NOT_DETECTED';
                    const isNotAssessable = obs.status === 'NOT_ASSESSABLE';
                    const isDefect = isDefectTrait(obs.feature);

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                          isDetected && isDefect
                            ? 'bg-rose-50/60 border-rose-200'
                            : isDetected
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">{obs.feature}</p>
                          <p className="text-[11px] text-slate-600">{obs.detail}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isDetected && isDefect && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-rose-600" /> {t('detected')} ({(obs.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                          {isDetected && !isDefect && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> {t('detected')} ({(obs.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                          {isNotDetected && isDefect && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> {t('notDetected')}
                            </span>
                          )}
                          {isNotDetected && !isDefect && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                              <X className="w-3 h-3 text-slate-500" /> {t('notDetected')}
                            </span>
                          )}
                          {isNotAssessable && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1" title="Requires laboratory assay">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> {t('notAssessable')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* 4. PRICE BY QUALITY COMPARISON TABLE */}
              <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-3">
                <CardTitle>{t('priceComparisonByGrade')}</CardTitle>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">{t('grade', 'Grade')}</th>
                        <th className="py-2 px-3">{t('qualityRule', 'Quality Rule')}</th>
                        <th className="py-2 px-3">{t('ratePerKg', 'Rate (₹/kg)')}</th>
                        <th className="py-2 px-3">{t('ratePerQtl', 'Rate (₹/qtl)')}</th>
                        <th className="py-2 px-3">{t('batchValue', 'Batch Value')}</th>
                        <th className="py-2 px-3 text-right">{t('status', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assessment.pricing?.priceComparison?.map((row: any, idx: number) => {
                        const rowBatchValue = Math.round(row.pricePerKg * assessment.pricing.batchQuantityKg);
                        return (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              row.isCurrent ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <span className="font-extrabold text-slate-900">{tgrade(row.grade)}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-slate-600">{row.adjustment}</span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">
                              ₹{row.pricePerKg.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              ₹{row.pricePerQtl.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 font-black text-forest-900">
                              ₹{rowBatchValue.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {row.isCurrent ? (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                                  {t('currentBatchGrade')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold">Tier</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 5. EXPANDABLE: HOW WAS THIS PRICE CALCULATED? */}
              <Card className="p-4 bg-slate-50 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-700" />
                    {t('howWasPriceCalculated')}
                  </span>
                  {isExplanationOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExplanationOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-2 text-slate-600 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 font-medium">{t('referenceMandi', 'Reference Mandi')}:</span>
                        <p className="font-bold text-slate-800">
                          {tcity(assessment.pricing.calculationBreakdown.referenceMandi)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">{t('baseMandiModalPrice', 'Base Mandi Modal Price')}:</span>
                        <p className="font-bold text-slate-800">
                          {assessment.pricing.calculationBreakdown.baseModalRate}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">{t('qualityRuleApplied', 'Quality Rule Applied')}:</span>
                        <p className="font-bold text-emerald-700">
                          {assessment.pricing.calculationBreakdown.qualityScoreApplied}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">{t('calculationFormula', 'Calculation Formula')}:</span>
                        <p className="font-mono text-slate-900 font-bold">
                          {assessment.pricing.calculationBreakdown.formula}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <span className="font-bold">{t('disclaimer', 'Disclaimer')}:</span> {assessment.pricing.disclaimer}
                    </p>
                  </div>
                )}
              </Card>

              {/* 6. ATTACH INSPECTION CERTIFICATE & WORKFLOW BUTTONS */}
              <div className="space-y-2 pt-2">
                {attachedSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {t('inspectionAttachedSuccess')} ({assessment.inspectionCode})
                    </span>
                    <Button variant="outline" size="sm" onClick={() => navigate('/my-crops')}>
                      {t('viewInMyCrops')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      variant="emerald"
                      size="lg"
                      onClick={handleAttachToBatch}
                      isLoading={isAttaching}
                      className="w-full sm:w-auto flex-1 font-extrabold shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      {t('attachInspectionBtn')}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/my-crops')}
                      className="w-full sm:w-auto font-bold"
                    >
                      {t('manageListings')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-12 bg-white text-center space-y-3 border border-slate-200 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{t('noAssessmentRunYet')}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {t('noAssessmentRunDesc')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
