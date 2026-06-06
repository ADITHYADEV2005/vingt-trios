'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, ShoppingBag, Package, Leaf } from 'lucide-react';

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  tailorId: string | null;
  createdAt: string;
  user: { name: string; email: string };
  garment: { name: string };
}

interface Tailor {
  id: string;
  name: string;
  email: string;
  orders: { id: string; status: string }[];
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [tab, setTab] = useState<'orders' | 'tailors' | 'fabrics'>('orders');
  const [loading, setLoading] = useState(true);
  const [newFabric, setNewFabric] = useState({ name: '', material: '', color: '', pricePerMtr: '', stock: '', isDeadstock: false, origin: '' });
  const [savingFabric, setSavingFabric] = useState(false);

  const fetchData = async () => {
    const [o, t] = await Promise.all([
      api.get('/orders/all'),
      api.get('/tailors'),
    ]);
    setOrders(o.data);
    setTailors(t.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const assignTailor = async (orderId: string, tailorId: string) => {
    await api.patch(`/orders/${orderId}/assign-tailor`, { tailorId });
    fetchData();
  };

  const confirmPayment = async (orderId: string) => {
    await api.patch(`/orders/${orderId}/confirm-payment`);
    fetchData();
  };

  const addFabric = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFabric(true);
    try {
      await api.post('/fabrics', {
        ...newFabric,
        pricePerMtr: parseFloat(newFabric.pricePerMtr),
        stock: parseFloat(newFabric.stock),
      });
      setNewFabric({ name: '', material: '', color: '', pricePerMtr: '', stock: '', isDeadstock: false, origin: '' });
      alert('Fabric added successfully');
    } catch (err) {
      alert('Failed to add fabric');
    } finally {
      setSavingFabric(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="flex gap-2 mb-8">
        {(['orders', 'tailors', 'fabrics'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize ${
              tab === t ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <>
          {tab === 'orders' && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.garment.name}</h3>
                      <p className="text-sm text-gray-500">{order.user.name} · ₹{order.totalPrice}</p>
                      <p className="text-xs text-gray-400 mt-1">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' :
                        order.status === 'PAYMENT_PENDING' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>{order.status.replace(/_/g, ' ')}</span>

                      {order.status === 'PAYMENT_PENDING' && (
                        <button
                          onClick={() => confirmPayment(order.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-green-700"
                        >
                          Confirm payment
                        </button>
                      )}

                      {!order.tailorId && order.status !== 'PAYMENT_PENDING' && (
                        <select
                          onChange={(e) => e.target.value && assignTailor(order.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-xs"
                          defaultValue=""
                        >
                          <option value="">Assign tailor</option>
                          {tailors.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      )}

                      {order.tailorId && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ {tailors.find(t => t.id === order.tailorId)?.name || 'Assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'tailors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tailors.map((tailor) => (
                <div key={tailor.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900">{tailor.name}</h3>
                  <p className="text-sm text-gray-500">{tailor.email}</p>
                  <p className="text-sm text-gray-400 mt-2">{tailor.orders.length} orders assigned</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'fabrics' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Leaf size={16} className="text-green-600" />
                Add new fabric
              </h2>
              <form onSubmit={addFabric}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { key: 'name', label: 'Fabric name', placeholder: 'Premium White Cotton' },
                    { key: 'material', label: 'Material', placeholder: 'cotton' },
                    { key: 'color', label: 'Color', placeholder: 'white' },
                    { key: 'pricePerMtr', label: 'Price per metre (₹)', placeholder: '250' },
                    { key: 'stock', label: 'Stock (metres)', placeholder: '100' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        type={key === 'pricePerMtr' || key === 'stock' ? 'number' : 'text'}
                        required
                        value={newFabric[key as keyof typeof newFabric] as string}
                        onChange={(e) => setNewFabric({ ...newFabric, [key]: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="deadstock"
                    checked={newFabric.isDeadstock}
                    onChange={(e) => setNewFabric({ ...newFabric, isDeadstock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="deadstock" className="text-sm font-medium text-gray-700">This is a deadstock Eco-Luxury fabric</label>
                </div>
                {newFabric.isDeadstock && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin story</label>
                    <input
                      type="text"
                      value={newFabric.origin}
                      onChange={(e) => setNewFabric({ ...newFabric, origin: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Surplus wool from a Milanese fashion house, 2023 season"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={savingFabric}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                >
                  {savingFabric ? 'Adding...' : 'Add fabric'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
