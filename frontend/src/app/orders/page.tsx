'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package } from 'lucide-react';

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  garment: { name: string; collar: string; sleeve: string; fabric: { name: string } };
  measurement: { label: string };
}

const STATUS_STEPS = [
  'PAYMENT_PENDING',
  'PAYMENT_CONFIRMED',
  'CUTTING',
  'STITCHING',
  'QUALITY_CHECK',
  'DISPATCHED',
  'DELIVERED',
];

const STATUS_LABELS: Record<string, string> = {
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  CUTTING: 'Cutting Fabric',
  STITCHING: 'Stitching',
  QUALITY_CHECK: 'Quality Check',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-gray-500 mb-8">Track your custom garments from production to delivery</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Package size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No orders yet.</p>
          <a href="/catalog" className="text-gray-900 font-medium underline text-sm mt-2 inline-block">Browse catalog</a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIndex = STATUS_STEPS.indexOf(order.status);
            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.garment.name}</h3>
                    <p className="text-sm text-gray-500">{order.garment.fabric.name} · {order.measurement.label}</p>
                    <p className="text-sm text-gray-400 mt-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{order.totalPrice}</p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                      order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' :
                      order.status === 'PAYMENT_PENDING' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div className={`w-3 h-3 rounded-full mb-1 ${
                          i <= stepIndex ? 'bg-gray-900' : 'bg-gray-200'
                        }`} />
                        <p className="text-xs text-gray-400 text-center hidden md:block">
                          {STATUS_LABELS[step].split(' ')[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="relative h-1 bg-gray-200 rounded-full mt-1">
                    <div
                      className="absolute h-1 bg-gray-900 rounded-full transition-all"
                      style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
