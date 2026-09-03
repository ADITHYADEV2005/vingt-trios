'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { loginUser } from '@/lib/api';
import { FiShield, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function AdminLoginPage() {
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
      if (res.user.role !== 'ADMIN') {
        throw new Error('Access denied. Staff admin privileges required.');
      }
      login(res.user, res.token);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Admin login failed.');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="auth-form-side" style={{ maxWidth: '480px', margin: '60px auto', padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-g)', borderRadius: 'var(--r-md)' }}>
        <div className="vt-flex-align-gap mb-sm">
          <FiShield size={28} style={{ color: 'var(--gold)' }} />
          <div className="auth-logo">Vingt <span>Trios ADMIN</span></div>
        </div>

        <h1 className="auth-title">Admin Staff Login</h1>
        <p className="auth-sub">Enter internal staff credentials to access operational control center.</p>

        <form onSubmit={handleSubmit} className="mt-md">
          <div className="form-field">
            <label className="form-label">Staff Email Address</label>
            <input
              id="admin-login-email"
              className="form-input"
              type="email"
              placeholder="admin@vingttrios.com"
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
                id="admin-login-pass"
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
            <div style={{ padding: '11px 14px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 'var(--r-sm)', color: 'var(--danger)', fontSize: '.84rem', marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button id="admin-login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Authenticating Admin...' : 'Sign In to Admin Console'} {!loading && <FiArrowRight />}
          </button>
        </form>
      </div>
    </div>
  );
}
