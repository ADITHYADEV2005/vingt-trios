'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { FiScissors, FiCompass, FiLogOut, FiUser } from 'react-icons/fi';

export default function PartnerNavbar() {
  const { user, isLoggedIn, logout } = useApp();
  const router = useRouter();

  return (
    <nav className="nav partner-nav">
      <Link href="/partner" className="nav-logo">
        {user?.role === 'DESIGNER' ? <FiCompass size={22} style={{ color: '#06b6d4' }} /> : <FiScissors size={22} style={{ color: 'var(--gold)' }} />}
        <span className="nav-logo-text">Vingt Trios <span>PARTNER NETWORK</span></span>
      </Link>

      <div className="nav-actions">
        {isLoggedIn ? (
          <div className="vt-flex-align-gap">
            <span className={`vt-chip ${user?.role === 'DESIGNER' ? 'success' : 'warning'}`}>
              {user?.role === 'DESIGNER' ? 'COUTURE DESIGNER' : 'MASTER TAILOR'}
            </span>
            <span className="vt-text-sub">{user?.name}</span>
            <button className="vt-btn vt-btn-secondary vt-btn-sm" onClick={() => { logout(); router.push('/partner'); }}>
              <FiLogOut size={13} /> Sign Out
            </button>
          </div>
        ) : (
          <Link href="/partner" className="nav-account-btn"><FiUser size={14} /> Partner Sign In</Link>
        )}
      </div>
    </nav>
  );
}
