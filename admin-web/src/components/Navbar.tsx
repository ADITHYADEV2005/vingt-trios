'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { FiShield, FiLogOut, FiUser } from 'react-icons/fi';

export default function AdminNavbar() {
  const { user, isLoggedIn, logout } = useApp();
  const router = useRouter();

  return (
    <nav className="nav admin-nav">
      <div className="nav-logo">
        <FiShield size={22} style={{ color: 'var(--gold)' }} />
        <span className="nav-logo-text">Vingt Trios <span>ADMIN CONSOLE</span></span>
      </div>

      <div className="nav-actions">
        {isLoggedIn ? (
          <div className="vt-flex-align-gap">
            <span className="vt-chip danger">ADMIN STAFF</span>
            <span className="vt-text-sub">{user?.name} ({user?.adminRole || 'SUPER_ADMIN'})</span>
            <button className="vt-btn vt-btn-secondary vt-btn-sm" onClick={() => { logout(); router.push('/login'); }}>
              <FiLogOut size={13} /> Sign Out
            </button>
          </div>
        ) : (
          <Link href="/login" className="nav-account-btn"><FiUser size={14} /> Admin Sign In</Link>
        )}
      </div>
    </nav>
  );
}
