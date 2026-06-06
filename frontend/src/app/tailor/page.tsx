'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CheckCircle, Clock, Scissors } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  user: { name: string; email: string };
  garment: { name: string; collar: string; sleeve: string; cuff: string; pocket: string; buttons: string; length: string; fabric: { name: string; material: string } };
  measurement: { label: string; chest: number; waist: number; hips: number; shoulder: number; sleeveLen: number; neck: number };
}

const NEXT_STATUS: Record<string, string> = {
  PAYMENT_CONFIRMED: 'CUTTING',
  CUTTING: 'STITCHING',
  STITCHING: 'QUALITY_CHECK',
  QUALITY_CHECK: 'DISPATCHED',
  DISPATCHED: 'DELIVERED',
};

export default function TailorPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total: 0, delivered: 0, inProgress: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = async () => {
    const [o, s] = await Promise.all([
      api.get('/tailors/my-orders'),
      api.get('/tailors/my-stats'),
    ]);
    setOrders(o.data);
    setStats(s.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await api.patch(`/tailors/my-orders/${orderId}/status`, { status });
    fetchData();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tailor Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total orders', value: stats.total, icon: <Scissors size={20} /> },
          { label: 'In progress', value: stats.inProgress, icon: <Clock size={20} /> },
          { label: 'Delivered', value: stats.delivered, icon: <CheckCircle size={20} /> },
          { label: 'Pending', value: stats.pending, icon: <Clock size={20} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-gray-400 mb-2">{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{order.garment.name}</h3>
                  <p className="text-sm text-gray-500">Customer: {order.user.name} · ₹{order.totalPrice}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' :
                    order.status === 'PAYMENT_CONFIRMED' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>{order.status.replace('_', ' ')}</span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(order.id, NEXT_STATUS[order.status]); }}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-700"
                    >
                      Mark as {NEXT_STATUS[order.status].replace('_', ' ')}
                    </button>
                  )}
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-gray-100 p-6 bg-gray-50 grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Garment specs</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Fabric:</span> {order.garment.fabric.name} ({order.garment.fabric.material})</p>
                      <p><span className="font-medium">Collar:</span> {order.garment.collar}</p>
                      <p><span className="font-medium">Sleeve:</span> {order.garment.sleeve}</p>
                      <p><span className="font-medium">Cuff:</span> {order.garment.cuff}</p>
                      <p><span className="font-medium">Pocket:</span> {order.garment.pocket}</p>
                      <p><span className="font-medium">Buttons:</span> {order.garment.buttons}</p>
                      <p><span className="font-medium">Length:</span> {order.garment.length}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Measurements — {order.measurement.label}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Chest', value: order.measurement.chest },
                        { label: 'Waist', value: order.measurement.waist },
                        { label: 'Hips', value: order.measurement.hips },
                        { label: 'Shoulder', value: order.measurement.shoulder },
                        { label: 'Sleeve', value: order.measurement.sleeveLen },
                        { label: 'Neck', value: order.measurement.neck },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-lg p-2 text-center border border-gray-100">
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="font-semibold text-gray-900">{value}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
