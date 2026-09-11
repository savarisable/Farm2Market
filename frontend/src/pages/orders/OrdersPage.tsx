import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { getOrdersApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, Clock, DollarSign } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrdersApi()
      .then((res) => {
        if (res?.success && res.orders) setOrders(res.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAYMENT_RELEASED':
      case 'DELIVERED':
        return <Badge variant="success" size="sm">{status.replace('_', ' ')}</Badge>;
      case 'IN_TRANSIT':
      case 'PICKED_UP':
        return <Badge variant="info" size="sm">{status.replace('_', ' ')}</Badge>;
      case 'PAYMENT_SECURED':
      case 'PREPARING':
        return <Badge variant="warning" size="sm">{status.replace('_', ' ')}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Lifecycle & Escrow Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            10-stage verifiable fulfillment pipeline with automated payment escrow settlement.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <Card key={i} className="h-36 bg-slate-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No orders found. Accept an offer or post a requirement to initialize trade.
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-5 bg-white border-slate-200" hoverEffect>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">#{order.id.substring(0, 8)}</span>
                    <h3 className="text-base font-bold text-slate-900">
                      {order.quantityKg.toLocaleString()} kg {order.cropName}
                    </h3>
                    {getStatusBadge(order.status)}
                  </div>

                  <p className="text-xs text-slate-600">
                    Farmer: <strong>{order.farmer?.name || 'Ramesh Patil'}</strong> • Buyer:{' '}
                    <strong>{order.buyer?.name || 'Pune Retail Hub'}</strong>
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Rate: <strong className="text-slate-800">₹{order.pricePerKg}/kg</strong></span>
                    <span>Total Value: <strong className="text-emerald-700 font-extrabold">₹{order.totalAmount.toLocaleString()}</strong></span>
                    <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Escrow: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    Manage Lifecycle <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
