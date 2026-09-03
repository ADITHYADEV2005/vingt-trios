'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  FiGrid, FiFeather, FiPlusCircle, FiDollarSign,
  FiUser, FiLogOut, FiExternalLink, FiCompass
} from 'react-icons/fi';
import { getDesignerPortalProfile } from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Studio Overview', href: '/designer/dashboard', icon: FiGrid },
  { label: 'Design Portfolio', href: '/designer/designs', icon: FiFeather },
  { label: 'Upload Design', href: '/designer/designs/new', icon: FiPlusCircle },
  { label: 'Monetization', href: '/designer/monetization', icon: FiDollarSign },
  { label: 'Brand Profile', href: '/designer/profile', icon: FiUser },
];

export default function DesignerPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'DESIGNER' && user?.role !== 'ADMIN') {
      router.push('/profile');
      return;
    }
    setAuthorized(true);

    getDesignerPortalProfile()
      .then(p => setProfileId(p.id))
      .catch(() => {});
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !authorized) {
    return (
      <div className="vt-admin-loading-screen">
        <div className="vt-spinner" />
        <p>Loading Designer Creative Studio...</p>
      </div>
    );
  }

  return (
    <div className="vt-designer-layout">
      {/* Studio Header */}
      <header className="vt-designer-header">
        <div className="vt-designer-brand">
          <div className="vt-brand-icon"><FiCompass size={18} /></div>
          <div>
            <div className="vt-brand-title">VINGT TRIOS</div>
            <div className="vt-brand-sub">DESIGNER CREATIVE STUDIO</div>
          </div>
        </div>

        <div className="vt-header-actions">
          {profileId && (
            <Link
              href={`/designers/${profileId}`}
              target="_blank"
              className="vt-live-site-link"
            >
              <span>Public Storefront</span>
              <FiExternalLink size={13} />
            </Link>
          )}

          <button className="vt-logout-icon-btn" onClick={logout} title="Sign Out">
            <FiLogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="vt-designer-body">
        {/* Left Sidebar */}
        <aside className="vt-designer-sidebar">
          <div className="vt-sidebar-user-box">
            <div className="vt-user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'D'}</div>
            <div className="vt-user-info">
              <div className="vt-user-name">{user?.name}</div>
              <div className="vt-user-role-tag">COUTURE DESIGNER</div>
            </div>
          </div>

          <nav className="vt-designer-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/designer/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`vt-designer-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="vt-designer-main-pane">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="vt-designer-mobile-bar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/designer/dashboard' && pathname.startsWith(item.href));
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
