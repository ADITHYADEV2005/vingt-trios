'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { ShoppingBag, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
          Vingt Trios
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/catalog" className="text-sm text-gray-600 hover:text-gray-900">
            Catalog
          </Link>

          {user ? (
            <>
              <Link href="/orders" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <ShoppingBag size={16} />
                Orders
              </Link>
              <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <User size={16} />
                {user.name.split(' ')[0]}
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Admin
                </Link>
              )}
              {user.role === 'TAILOR' && (
                <Link href="/tailor" className="text-sm text-green-600 hover:text-green-800 font-medium">
                  Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
