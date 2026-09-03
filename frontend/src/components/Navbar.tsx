'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { FiShoppingCart, FiUser, FiSearch, FiLogOut, FiPackage, FiHeart } from 'react-icons/fi';

export default function Navbar() {
  const { user, isLoggedIn, logout, cartCount } = useApp();
  const [q, setQ] = useState('');
  const [drop, setDrop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', s, { passive: true });
    return () => window.removeEventListener('scroll', s);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/categories/shirt?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      {/* Logo */}
      <Link href="/" className="nav-logo">
        <img
          src="/image/VINGT TRIOS.png"
          alt="Vingt Trios"
          style={{ height: 42, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(236,187,13,.3))' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span className="nav-logo-text">Vingt <span>Trios</span></span>
      </Link>

      {/* Category links */}
      <div className="nav-links">
        <Link href="/categories/shirt" className="nav-link">Shirts</Link>
        <Link href="/categories/pant" className="nav-link">Pants</Link>
        <Link href="/categories/blazer" className="nav-link">Blazers</Link>
      </div>

      {/* Search */}
      <div className="nav-search">
        <form onSubmit={handleSearch}>
          <FiSearch size={14} className="nav-search-icon" />
          <input
            type="text"
            placeholder="Search garments, fabrics…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
      </div>

      {/* Right actions */}
      <div className="nav-actions">
        <Link href="/cart" className="nav-icon-btn" aria-label="Cart">
          <FiShoppingCart size={17} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        <div className="nav-dropdown-wrap" ref={dropRef}>
          {isLoggedIn ? (
            <>
              <button className="nav-account-btn" onClick={() => setDrop(!drop)}>
                <FiUser size={14} /> {user?.name?.split(' ')[0]}
              </button>
              {drop && (
                <div className="nav-dropdown">
                  <Link href="/profile" className="nav-drop-item" onClick={() => setDrop(false)}><FiUser size={13} /> My Profile</Link>
                  <Link href="/orders" className="nav-drop-item" onClick={() => setDrop(false)}><FiPackage size={13} /> My Orders</Link>
                  <Link href="/profile#measurements" className="nav-drop-item" onClick={() => setDrop(false)}><FiHeart size={13} /> Saved Measurements</Link>
                  <button className="nav-drop-item red" onClick={() => { logout(); setDrop(false); router.push('/'); }}>
                    <FiLogOut size={13} /> Log Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/login" className="nav-account-btn"><FiUser size={14} /> Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
