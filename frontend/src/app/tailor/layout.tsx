'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  FiGrid, FiPackage, FiDollarSign, FiStar, FiUser,
  FiLogOut, FiScissors, FiCheckCircle, FiPower
} from 'react-icons/fi';
import { getTailorPortalProfile, updateTailorPortalProfile } from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Overview', href: '/tailor/dashboard', icon: FiGrid },
  { label: 'Order Queue', href: '/tailor/orders', icon: FiPackage },
  { label: 'Earnings', href: '/tailor/earnings', icon: FiDollarSign },
  { label: 'Reviews', href: '/tailor/reviews', icon: FiStar },
  { label: 'Shop Profile', href: '/tailor/profile', icon: FiUser },
];

export default function TailorPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [updatingAvail, setUpdatingAvail] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'TAILOR' && user?.role !== 'ADMIN') {
      router.push('/profile');
      return;
    }
    setAuthorized(true);
    // Fetch availability status
    getTailorPortalProfile()
      .then(p => setIsAvailable(p.isAvailable))
      .catch(() => {});
  }, [isLoggedIn, user, router]);

  const toggleAvailability = async () => {
    setUpdatingAvail(true);
    try {
      const next = !isAvailable;
      await updateTailorPortalProfile({ isAvailable: next });
      setIsAvailable(next);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingAvail(false);
    }
  };

  if (!isLoggedIn || !authorized) {
    return (
      <div className="vt-admin-loading-screen">
        <div className="vt-spinner" />
        <p>Loading Tailor Workshop Console...</p>
      </div>
    );
  }

  return (
    <div className="vt-tailor-layout">
      {/* Top Header */}
      <header className="vt-tailor-header">
        <div className="vt-tailor-brand">
          <div className="vt-brand-icon"><FiScissors size={18} /></div>
          <div>
            <div className="vt-brand-title">VINGT TRIOS</div>
            <div className="vt-brand-sub">TAILOR WORKSHOP CONSOLE</div>
          </div>
        </div>

        <div className="vt-header-actions">
          {/* Capacity Availability Toggle */}
          <button
            className={`vt-avail-btn ${isAvailable ? 'available' : 'paused'}`}
            onClick={toggleAvailability}
            disabled={updatingAvail}
            title="Toggle accepting new orders"
          >
            <FiPower size={13} />
            <span>{isAvailable ? 'Accepting Orders' : 'Capacity Paused'}</span>
          </button>

          <button className="vt-logout-icon-btn" onClick={logout} title="Sign Out">
            <FiLogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="vt-tailor-body">
        {/* Desktop Left Sidebar */}
        <aside className="vt-tailor-desktop-sidebar">
          <div className="vt-sidebar-user-box">
            <div className="vt-user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'T'}</div>
            <div className="vt-user-info">
              <div className="vt-user-name">{user?.name}</div>
              <div className="vt-user-role-tag">MASTER TAILOR</div>
            </div>
          </div>

          <nav className="vt-tailor-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/tailor/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`vt-tailor-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page Content Pane */}
        <main className="vt-tailor-main-pane">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <nav className="vt-tailor-mobile-bar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/tailor/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`vt-mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
