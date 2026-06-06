'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Garment {
  id: string;
  name: string;
  basePrice: number;
  collar: string;
  sleeve: string;
  cuff: string;
  pocket: string;
  buttons: string;
  length: string;
  fabric: { name: string; material: string; color: string; isDeadstock: boolean };
}

interface Measurement {
  id: string;
  label: string;
  chest: number;
  waist: number;
}

interface Options {
  collar: string[];
  sleeve: string[];
  cuff: string[];
  pocket: string[];
  buttons: string[];
  length: string[];
}

export default function CustomizePage() {
  const { id } = useParams();
  const router = useRouter();
  const [garment, setGarment] = useState<Garment | null>(null);
  const [options, setOptions] = useState<Options | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selected, setSelected] = useState({
    collar: '', sleeve: '', cuff: '', pocket: '', buttons: '', length: '',
    measurementId: '', notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/garments/${id}`),
      api.get('/garments/options'),
      api.get('/measurements'),
    ]).then(([g, o, m]) => {
      setGarment(g.data);
      setOptions(o.data);
      setMeasurements(m.data);
      setSelected({
        collar: g.data.collar,
        sleeve: g.data.sleeve,
        cuff: g.data.cuff,
        pocket: g.data.pocket,
        buttons: g.data.buttons,
        length: g.data.length,
        measurementId: m.data[0]?.id || '',
        notes: '',
      });
      setLoading(false);
    });
  }, [id]);

  const handleOrder = async () => {
    if (!selected.measurementId) {
      alert('Please add measurements first at /measurements');
      return;
    }
    setPlacing(true);
    try {
      await api.post('/orders', {
        garmentId: id,
        measurementId: selected.measurementId,
        totalPrice: garment?.basePrice,
      });
      router.push('/orders');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12"><p className="text-gray-500">Loading...</p></div>;
  if (!garment || !options) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{garment.name}</h1>
      <p className="text-gray-500 mb-8">{garment.fabric.name} · {garment.fabric.material} · ₹{garment.basePrice}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {([
            { key: 'collar', label: 'Collar style', opts: options.collar },
            { key: 'sleeve', label: 'Sleeve style', opts: options.sleeve },
            { key: 'cuff', label: 'Cuff style', opts: options.cuff },
            { key: 'pocket', label: 'Pocket style', opts: options.pocket },
            { key: 'buttons', label: 'Button style', opts: options.buttons },
            { key: 'length', label: 'Length', opts: options.length },
          ] as { key: keyof typeof selected; label: string; opts: string[] }[]).map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelected({ ...selected, [key]: opt })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      selected[key] === opt
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional notes</label>
            <textarea
              value={selected.notes}
              onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Any special instructions for the tailor..."
              rows={3}
            />
          </div>
        </div>

        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order summary</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between"><span>Garment</span><span>{garment.name}</span></div>
              <div className="flex justify-between"><span>Fabric</span><span>{garment.fabric.name}</span></div>
              <div className="flex justify-between"><span>Collar</span><span>{selected.collar}</span></div>
              <div className="flex justify-between"><span>Sleeve</span><span>{selected.sleeve}</span></div>
              <div className="flex justify-between"><span>Cuff</span><span>{selected.cuff}</span></div>
              <div className="flex justify-between"><span>Buttons</span><span>{selected.buttons}</span></div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-900 text-base">
                <span>Total</span><span>₹{garment.basePrice}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select measurements</label>
              {measurements.length === 0 ? (
                <p className="text-sm text-red-500">No measurements saved. <a href="/measurements" className="underline">Add measurements</a></p>
              ) : (
                <select
                  value={selected.measurementId}
                  onChange={(e) => setSelected({ ...selected, measurementId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {measurements.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} (Chest: {m.chest}", Waist: {m.waist}")
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleOrder}
              disabled={placing || measurements.length === 0}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {placing ? 'Placing order...' : `Place order — ₹${garment.basePrice}`}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Prepaid only. Production starts after payment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
