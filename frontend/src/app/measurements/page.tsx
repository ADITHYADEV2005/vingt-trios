'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Ruler, Plus, Trash2 } from 'lucide-react';

interface Measurement {
  id: string;
  label: string;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  sleeveLen: number;
  neck: number;
  createdAt: string;
}

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: '', chest: '', waist: '', hips: '',
    shoulder: '', sleeveLen: '', neck: '',
  });

  const fetchMeasurements = async () => {
    try {
      const res = await api.get('/measurements');
      setMeasurements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeasurements(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/measurements', {
        label: form.label,
        chest: parseFloat(form.chest),
        waist: parseFloat(form.waist),
        hips: parseFloat(form.hips),
        shoulder: parseFloat(form.shoulder),
        sleeveLen: parseFloat(form.sleeveLen),
        neck: parseFloat(form.neck),
      });
      setForm({ label: '', chest: '', waist: '', hips: '', shoulder: '', sleeveLen: '', neck: '' });
      setShowForm(false);
      fetchMeasurements();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this measurement profile?')) return;
    await api.delete(`/measurements/${id}`);
    fetchMeasurements();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Measurements</h1>
          <p className="text-gray-500 mt-1">Save your body measurements for perfect fitting garments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-700"
        >
          <Plus size={16} />
          Add measurements
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">New measurement profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile label</label>
              <input
                type="text"
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g. My Shirt Size"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { key: 'chest', label: 'Chest (inches)' },
                { key: 'waist', label: 'Waist (inches)' },
                { key: 'hips', label: 'Hips (inches)' },
                { key: 'shoulder', label: 'Shoulder (inches)' },
                { key: 'sleeveLen', label: 'Sleeve length (inches)' },
                { key: 'neck', label: 'Neck (inches)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="0.0"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save measurements'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : measurements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Ruler size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No measurements saved yet.</p>
          <p className="text-gray-400 text-sm mt-1">Add your first measurement profile to start ordering.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {measurements.map((m) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{m.label}</h3>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { label: 'Chest', value: m.chest },
                  { label: 'Waist', value: m.waist },
                  { label: 'Hips', value: m.hips },
                  { label: 'Shoulder', value: m.shoulder },
                  { label: 'Sleeve', value: m.sleeveLen },
                  { label: 'Neck', value: m.neck },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-lg font-semibold text-gray-900">{value}"</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
