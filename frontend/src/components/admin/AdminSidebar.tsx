'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid, FiPackage, FiUsers, FiScissors, FiFeather,
  FiLayers, FiDollarSign, FiHelpCircle, FiTag, FiShield,
  FiSliders, FiBell, FiLogOut
} from 'react-icons/fi';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin/dashboard', icon: FiGrid },
  { label: 'Orders Control', href: '/admin/orders', icon: FiPackage },
  { label: 'Customers', href: '/admin/customers', icon: FiUsers },
  { label: 'Tailors', href: '/admin/tailors', icon: FiScissors },
  { label: 'Designers', href: '/admin/designers', icon: FiFeather },
  {
    label: 'Catalog & Pricing',
    icon: FiLayers,
    children: [
      { label: 'Fabrics', href: '/admin/catalog/fabrics' },
      { label: 'Styles', href: '/admin/catalog/styles' },
      { label: 'Pricing Rules', href: '/admin/catalog/pricing' },
    ],
  },
  { label: 'Finance & Payouts', href: '/admin/finance', icon: FiDollarSign },
  { label: 'Support Queue', href: '/admin/support', icon: FiHelpCircle },
  { label: 'Marketing', href: '/admin/marketing', icon: FiTag },
  { label: 'Audit Trail', href: '/admin/audit', icon: FiShield },
  { label: 'System Settings', href: '/admin/settings', icon: FiSliders },
];

export function AdminSidebar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="vt-admin-sidebar">
      {/* Brand Header */}
      <div className="vt-sidebar-brand">
        <div className="vt-brand-logo">VT</div>
        <div className="vt-brand-text">
          <span className="vt-brand-name">VINGT TRIOS</span>
          <span className="vt-brand-sub">CONTROL DASHBOARD</span>
        </div>
      </div>

      {/* Sub-account Badge */}
      <div className="vt-sidebar-user-card">
        <div className="vt-user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="vt-user-info">
          <div className="vt-user-name">{user?.name || 'Administrator'}</div>
          <div className="vt-user-role-tag">
            {user?.adminRole || 'SUPER ADMIN'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="vt-sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const isChildActive = item.children.some(c => pathname === c.href);
            return (
              <div key={item.label} className="vt-nav-group">
                <div className={`vt-nav-item parent ${isChildActive ? 'active' : ''}`}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                <div className="vt-nav-sub">
                  {item.children.map(c => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={`vt-nav-sub-item ${pathname === c.href ? 'active' : ''}`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`vt-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="vt-sidebar-footer">
        <button className="vt-sidebar-logout-btn" onClick={onLogout}>
          <FiLogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
