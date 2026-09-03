'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { registerUser } from '@/lib/api';
import {
  FiEye, FiEyeOff, FiArrowRight, FiUser,
  FiScissors, FiCompass
} from 'react-icons/fi';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'TAILOR' | 'DESIGNER'>('CUSTOMER');
  const [showPw, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoad] = useState(false);

  const { login } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoad(true);
    try {
      const res = await registerUser({ name, email, password, role });
      login(res.user, res.token);

      if (res.user.role === 'TAILOR') {
        router.push('/tailor/dashboard');
      } else if (res.user.role === 'DESIGNER') {
        router.push('/designer/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img
          src="/image/shirt.jpg"
          alt="Bespoke Tailoring"
          onError={(e) => { (e.target as HTMLImageElement).src = '/image/BLAZER.jpg'; }}
        />
        <div className="auth-visual-overlay" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 60 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.5rem', color: 'white', marginBottom: 10 }}>
            Join Vingt Trios<br />Bespoke Platform
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 360 }}>
            Create an account as a Client, Master Tailor, or Fashion Designer to access your dedicated portal dashboard.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-logo">Vingt <span>Trios</span></div>
        <h1 className="auth-title">Create Workspace Account</h1>
        <p className="auth-sub">Select your platform role to get started.</p>

        {/* Role Selector Cards */}
        <div className="vt-grid-3 gap-xs mb-md" style={{ marginTop: '14px' }}>
          <div
            className={`vt-role-select-tile ${role === 'CUSTOMER' ? 'active' : ''}`}
            onClick={() => setRole('CUSTOMER')}
          >
            <FiUser size={18} />
            <span>Client</span>
          </div>

          <div
            className={`vt-role-select-tile ${role === 'TAILOR' ? 'active' : ''}`}
            onClick={() => setRole('TAILOR')}
          >
            <FiScissors size={18} />
            <span>Tailor</span>
          </div>

          <div
            className={`vt-role-select-tile ${role === 'DESIGNER' ? 'active' : ''}`}
            onClick={() => setRole('DESIGNER')}
          >
            <FiCompass size={18} />
            <span>Designer</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Full Name</label>
            <input
              id="signup-name"
              className="form-input"
              type="text"
              placeholder="Arjun Menon"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              id="signup-email"
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
                id="signup-pass"
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={password}
                onChange={e => setPass(e.target.value)}
                required
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

          <button id="signup-submit" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating Account...' : `Register as ${role === 'TAILOR' ? 'Tailor' : role === 'DESIGNER' ? 'Designer' : 'Client'}`} {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></div>
        <div className="auth-switch mt-xs">Or choose workspace from <Link href="/portals">Portal Gateway Hub</Link></div>
      </div>
    </div>
  );
}
