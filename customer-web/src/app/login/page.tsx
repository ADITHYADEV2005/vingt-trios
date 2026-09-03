'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { loginUser } from '@/lib/api';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [showPw, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoad] = useState(false);
  const { login } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoad(true);
    try {
      const res = await loginUser({ email, password });
      login(res.user, res.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Visual side */}
      <div className="auth-visual">
        <img src="/image/BLAZER.jpg" alt="Vingt Trios Bespoke" onError={(e) => { (e.target as HTMLImageElement).src = '/image/shirt.jpg'; }} />
        <div className="auth-visual-overlay" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 60 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.5rem', color: 'white', marginBottom: 10 }}>
            Crafted for<br />Perfectionists
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 360 }}>
            Sign in to your customer account to customize 3D suits and manage orders.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-logo">Vingt <span>Trios</span></div>
        <h1 className="auth-title">Customer Sign In</h1>
        <p className="auth-sub">Sign in to your customer account to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-pass"
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPass(e.target.value)}
                required
                autoComplete="current-password"
                style={{ width: '100%', paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShow(!showPw)}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
              >
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '11px 14px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 'var(--r-sm)', color: 'var(--danger)', fontSize: '.84rem', marginBottom: 4 }}>
              {error}
            </div>
          )}

          <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'} {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="auth-switch">Don't have an account? <Link href="/signup">Create one</Link></div>
      </div>
    </div>
  );
}
