import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postRequirementApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { AIInsightBadge } from '../../components/ui/AIInsightBadge';
import { PlusCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const PostRequirementPage: React.FC = () => {
  const navigate = useNavigate();

  const [cropName, setCropName] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState('2000');
  const [grade, setGrade] = useState('GRADE_A');
  const [location, setLocation] = useState('Gultekdi, Pune');
  const [requiredByDate, setRequiredByDate] = useState('2026-09-12');
  const [budgetPricePerKg, setBudgetPricePerKg] = useState('30');
  const [isBulk, setIsBulk] = useState(false);
  const [notes, setNotes] = useState('Direct farm-gate pickup preferred. High firmness required for retail store shelves.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await postRequirementApi({
        cropName,
        quantityKg: parseFloat(quantityKg),
        grade,
        location,
        requiredByDate,
        budgetPricePerKg: parseFloat(budgetPricePerKg),
        isBulk,
        notes,
      });
      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/farmer-marketplace');
        }, 1200);
      }
    } catch (e) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Post Procurement Requirement</h1>
          <AIInsightBadge confidence={96} label="REVERSE MARKETPLACE" />
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Broadcast volume, quality specs, and target budget. The matching engine notifies verified farmers & FPOs in the production belt.
        </p>
      </div>

      <Card className="p-6 bg-white border-slate-200 shadow-md">
        {success ? (
          <div className="py-10 text-center text-emerald-700 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold">Procurement Requirement Broadcasted!</h3>
            <p className="text-xs text-slate-500">Redirecting to matched farmer supplies...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Commodity Needed"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                options={[
                  { value: 'Tomato', label: 'Tomato (Vegetable)' },
                  { value: 'Onion', label: 'Onion (Red Nashik)' },
                  { value: 'Potato', label: 'Potato (Processing / Table)' },
                  { value: 'Wheat', label: 'Wheat (Sharbati)' },
                  { value: 'Soybean', label: 'Soybean' },
                  { value: 'Banana', label: 'Banana' },
                ]}
              />

              <Input
                label="Required Volume (kg)"
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Quality Grade Standard"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                options={[
                  { value: 'GRADE_A', label: 'Grade A (Retail / Premium Display)' },
                  { value: 'GRADE_B', label: 'Grade B (Standard Commercial)' },
                  { value: 'GRADE_C', label: 'Grade C (Industrial Puree / Processing)' },
                ]}
              />

              <Input
                label="Target Budget Price (₹/kg)"
                type="number"
                step="0.5"
                value={budgetPricePerKg}
                onChange={(e) => setBudgetPricePerKg(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Delivery Destination Hub"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />

              <Input
                label="Required by Date"
                type="date"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isBulk"
                checked={isBulk}
                onChange={(e) => setIsBulk(e.target.checked)}
                className="rounded text-forest-700 focus:ring-forest-600 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="isBulk" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Institutional Bulk Order (10,000+ kg poolable across multiple FPOs)
              </label>
            </div>

            <Input
              label="Quality & Packaging Instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 25kg plastic crates, firmness > 4.5 kg/cm²"
            />

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => navigate('/buyer')}>
                Cancel
              </Button>
              <Button variant="emerald" size="md" type="submit" isLoading={isSubmitting}>
                Publish Requirement & Find Matching Harvests
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
