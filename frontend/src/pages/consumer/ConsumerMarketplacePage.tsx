import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsumerProductsApi, consumerCheckoutApi } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ShoppingCart, QrCode, MapPin, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { resolveCropImageUrl, handleImageFallback } from '../../utils/cropImages';

export const ConsumerMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<{ product: any; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Green Meadows, Kothrud, Pune - 411038');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    getConsumerProductsApi()
      .then((res) => {
        if (res?.success && res.products) setProducts(res.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { product, qty: 2 }];
    });
    setIsCartOpen(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);
    try {
      const items = cart.map((c) => ({
        productId: c.product.id,
        quantity: c.qty,
        price: c.product.consumerPricePerKg,
      }));
      const res = await consumerCheckoutApi({ items, deliveryAddress });
      if (res?.success && res.receipt) {
        setOrderReceipt(res.receipt);
        setCart([]);
      }
    } catch (e) {
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.consumerPricePerKg * item.qty, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farm Direct Consumer Market</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Farm-to-fork fresh produce delivered directly from verified Maharashtra farmers with full price transparency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/transparency')}>
            View Rupee Transparency Breakdown
          </Button>
          <Button variant="emerald" size="sm" onClick={() => setIsCartOpen(true)} className="relative">
            <ShoppingCart className="w-4 h-4 mr-1.5" /> Cart ({cart.reduce((a, b) => a + b.qty, 0)})
          </Button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((prod) => (
          <Card key={prod.id} className="overflow-hidden flex flex-col justify-between" hoverEffect>
            <div>
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <img
                  src={resolveCropImageUrl(prod.imageUrl, prod.rawCropName || prod.cropName)}
                  alt={prod.cropName}
                  onError={(e) => handleImageFallback(e, prod.rawCropName || prod.cropName)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5">
                  <Badge variant="success" size="sm" className="bg-white font-bold shadow-xs">
                    {prod.grade}
                  </Badge>
                </div>
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                    Passport: {prod.passportCode}
                  </span>
                </div>
              </div>

              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{prod.cropName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Grower: <strong className="text-slate-800">{prod.farmerName}</strong> ({prod.originLocation})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">₹{prod.consumerPricePerKg}</span>
                    <span className="text-xs text-slate-500"> / kg</span>
                  </div>
                </div>

                {/* Transparent Price Breakdown Pill */}
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-emerald-950">
                    <span>Farmer Realization:</span>
                    <span className="text-emerald-700 font-black">
                      ₹{prod.farmerRealizationPerKg}/kg ({prod.farmerSharePercent}% of price)
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${prod.farmerSharePercent}%` }} />
                  </div>
                  <p className="text-[10px] text-emerald-800">
                    Vs traditional APMC where farmer gets only 25% of your money.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Harvest: {prod.harvestDate}</span>
                  <span>Direct Transit: {prod.distanceKm} km</span>
                </div>
              </CardContent>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/passport/${prod.passportCode}`)}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-700 mr-1" /> Passport
              </Button>
              <Button
                variant="emerald"
                size="sm"
                onClick={() => addToCart(prod)}
                className="font-bold"
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Buy Direct (₹{prod.consumerPricePerKg}/kg)
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Shopping Cart & Checkout Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          setOrderReceipt(null);
        }}
        title="Your Farm Direct Basket"
        description="Fresh harvests reserved directly with the origin grower. 100% fair trade verified."
        maxWidth="md"
      >
        {orderReceipt ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Order Confirmed!</h3>
            <p className="text-xs text-slate-600">
              Receipt: <strong>{orderReceipt.orderId}</strong> • Total:{' '}
              <strong className="text-emerald-700">₹{orderReceipt.totalAmount}</strong>
            </p>
            <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              🎉 By buying direct on Farm2Market SmartMandi, you saved ₹{orderReceipt.farmerShareSaved} and ensured the farmer received 68% of the transaction.
            </p>
            <div className="pt-3">
              <Button
                variant="emerald"
                size="sm"
                onClick={() => {
                  setIsCartOpen(false);
                  setOrderReceipt(null);
                  navigate(`/passport/${orderReceipt.traceabilityPassport}`);
                }}
              >
                View Dispatch Passport
              </Button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Your basket is empty. Add farm fresh produce above!
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.product.cropName}</span>
                    <span className="text-slate-500">₹{item.product.consumerPricePerKg}/kg • Grower: {item.product.farmerName}</span>
                  </div>
                  <div className="text-right font-bold text-slate-900">
                    {item.qty} kg = ₹{item.product.consumerPricePerKg * item.qty}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Payable:</span>
              <span className="text-emerald-700">₹{cartTotal}</span>
            </div>

            <Input
              label="Delivery Address in Pune / Mumbai"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsCartOpen(false)}>
                Continue Browsing
              </Button>
              <Button variant="emerald" size="md" type="submit" isLoading={isCheckingOut} className="font-bold">
                Place Order (₹{cartTotal})
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
