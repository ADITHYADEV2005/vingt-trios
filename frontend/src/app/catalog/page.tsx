'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Leaf, ShoppingBag } from 'lucide-react';

interface Garment {
  id: string;
  name: string;
  basePrice: number;
  collar: string;
  sleeve: string;
  fabric: {
    name: string;
    material: string;
    color: string;
    isDeadstock: boolean;
  };
}

export default function CatalogPage() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/garments').then((res) => {
      setGarments(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Catalog</h1>
        <p className="text-gray-500 mt-1">Choose a garment and customize it exactly to your taste</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : garments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <ShoppingBag size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No garments available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garments.map((garment) => (
            <div key={garment.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <span className="text-6xl">👔</span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{garment.name}</h3>
                  {garment.fabric.isDeadstock && (
                    <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <Leaf size={10} />
                      Eco-Luxury
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-1">{garment.fabric.name} · {garment.fabric.material}</p>
                <p className="text-sm text-gray-500 mb-4">{garment.collar} collar · {garment.sleeve}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-900">₹{garment.basePrice}</p>
                  <Link
                    href={`/customize/${garment.id}`}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
                  >
                    Customize
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
