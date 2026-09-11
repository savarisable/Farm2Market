import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [role, setRole] = useState<Role>('FARMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');

  // Role-specific fields
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSize, setFarmSize] = useState('2.5');
  const [preferredCrops, setPreferredCrops] = useState('Tomato, Onion');
  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState('RETAILER');
  const [fpoName, setFpoName] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      email,
      mobile,
      password,
      role,
      location,
      farmLocation,
      farmSize,
      preferredCrops,
      businessName,
      buyerType,
      fpoName,
    };

    const success = await register(payload);
    if (success) {
      if (role === 'FARMER') navigate('/dashboard');
      else if (role === 'BUYER') navigate('/buyer');
      else if (role === 'FPO') navigate('/fpo');
      else if (role === 'CONSUMER') navigate('/consumer');
      else navigate('/admin');
    } else {
      setError('Registration failed. Please check your inputs or try a different email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-3xl">🌾</span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Farm2Market <span className="text-agri-600">AI</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">I am registering as a:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['FARMER', 'BUYER', 'FPO', 'CONSUMER'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      role === r
                        ? 'bg-forest-900 text-white border-forest-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r === 'FARMER' ? '👨‍🌾 Farmer' : r === 'BUYER' ? '🏢 Buyer' : r === 'FPO' ? '📦 FPO' : '🥗 Consumer'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98XXX XXXXX" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <Input label="City / Base Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nashik, Maharashtra" required />

            {/* Role-specific details */}
            {role === 'FARMER' && (
              <div className="p-3.5 rounded-xl bg-forest-50/60 border border-forest-200 space-y-3">
                <p className="text-xs font-bold text-forest-900">Farm Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Farm Location / Taluka" value={farmLocation} onChange={(e) => setFarmLocation(e.target.value)} placeholder="e.g. Dindori, Nashik" />
                  <Input label="Farm Size (Acres)" type="number" step="0.5" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} />
                </div>
                <Input label="Preferred Crops" value={preferredCrops} onChange={(e) => setPreferredCrops(e.target.value)} placeholder="e.g. Tomato, Onion, Potato" />
              </div>
            )}

            {role === 'BUYER' && (
              <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200 space-y-3">
                <p className="text-xs font-bold text-sky-950">Buyer Organization Details</p>
                <Input label="Business / Establishment Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Pune Fresh Supermarkets" />
                <Select
                  label="Buyer Type"
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value)}
                  options={[
                    { value: 'RETAILER', label: 'Retailer / Supermarket' },
                    { value: 'RESTAURANT', label: 'Restaurant / Hotel Chain' },
                    { value: 'FOOD_PROCESSOR', label: 'Food Processor / Agro Industry' },
                    { value: 'WHOLESALER', label: 'Wholesaler / Trader' },
                    { value: 'INSTITUTIONAL', label: 'Institutional / Canteen Buyer' },
                  ]}
                />
              </div>
            )}

            {role === 'FPO' && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <p className="text-xs font-bold text-amber-950">Farmer Producer Organization</p>
                <Input label="FPO Registered Name" value={fpoName} onChange={(e) => setFpoName(e.target.value)} placeholder="e.g. Sahyadri Agro Producer Co." />
              </div>
            )}

            <Button type="submit" variant="primary" size="md" className="w-full mt-3" isLoading={isLoading}>
              Complete Registration
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
