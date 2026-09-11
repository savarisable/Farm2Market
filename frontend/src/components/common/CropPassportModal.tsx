import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CropPassport } from '../../types';
import { QrCode, ShieldCheck, MapPin, Calendar, Truck, User, CheckCircle2 } from 'lucide-react';

interface CropPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: CropPassport | null;
}

export const CropPassportModal: React.FC<CropPassportModalProps> = ({ isOpen, onClose, passport }) => {
  if (!passport) return null;

  let timeline: any[] = [];
  try {
    timeline = JSON.parse(passport.provenanceJson);
  } catch (e) {
    timeline = [
      { stage: 'Harvesting', date: passport.harvestDate, detail: 'Hand-picked at peak maturity in Dindori' },
      { stage: 'AI Grading', date: passport.harvestDate, detail: `${passport.grade} certified via Computer Vision` },
    ];
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-5">
        {/* Certificate Header Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-forest-900 to-agri-800 text-white flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <h3 className="text-base font-bold tracking-tight">Digital Crop Passport</h3>
              <Badge variant="success" size="sm" className="bg-emerald-400 text-forest-950 font-bold">
                VERIFIED BATCH
              </Badge>
            </div>
            <p className="text-xs text-agri-200 mt-0.5">Ministry of Consumer Affairs (DoCA) Traceability Standard</p>
          </div>
          <div className="text-right font-mono text-xs font-bold text-agri-300">
            ID: {passport.passportCode}
          </div>
        </div>

        {/* QR Code & Key Specs Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Simulated QR Code Canvas */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-white rounded-lg shadow-xs border border-slate-200">
              {/* Clean SVG QR Pattern */}
              <svg className="w-28 h-28" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="19" y="19" width="7" height="7" fill="#0f172a" />
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="74" y="19" width="7" height="7" fill="#0f172a" />
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                <rect x="19" y="74" width="7" height="7" fill="#0f172a" />
                <rect x="42" y="15" width="15" height="10" fill="#0f172a" />
                <rect x="42" y="32" width="20" height="8" fill="#16a34a" />
                <rect x="15" y="42" width="10" height="15" fill="#0f172a" />
                <rect x="65" y="42" width="15" height="15" fill="#0f172a" />
                <rect x="42" y="65" width="12" height="20" fill="#0f172a" />
                <rect x="60" y="65" width="25" height="8" fill="#16a34a" />
                <rect x="60" y="78" width="25" height="12" fill="#0f172a" />
              </svg>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-2 tracking-wider">SCAN TO VERIFY ORIGIN</p>
          </div>

          {/* Core Batch Metadata */}
          <div className="sm:col-span-2 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" /> Origin Farmer:
              </span>
              <span className="font-bold text-slate-800">{passport.farmerName}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Farm Location:
              </span>
              <span className="font-bold text-slate-800">{passport.farmLocation}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Harvest Date:
              </span>
              <span className="font-bold text-slate-800">{new Date(passport.harvestDate).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Certified Quality:
              </span>
              <span className="font-bold text-emerald-700">{passport.grade}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Truck className="w-3.5 h-3.5 text-slate-400" /> Cold-Chain Transit:
              </span>
              <span className="font-bold text-slate-800">{passport.transportType}</span>
            </div>
          </div>
        </div>

        {/* Provenance Trail */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Immutable Provenance Trail</h4>
          <div className="space-y-2 border-l-2 border-emerald-400/80 pl-3.5 ml-1.5">
            {timeline.map((step: any, idx: number) => (
              <div key={idx} className="relative text-xs">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{step.stage}</span>
                  <span className="text-[10px] text-slate-400">{step.date}</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => {
              window.open(`/passport/${passport.passportCode}`, '_blank');
            }}
          >
            Open Public Verification Page
          </Button>
        </div>
      </div>
    </Modal>
  );
};
