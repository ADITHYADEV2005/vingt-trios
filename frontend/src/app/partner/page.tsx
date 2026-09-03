'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { loginUser, registerUser, getTailorPortalProfile, getDesignerPortalProfile } from '@/lib/api';
import {
  FiScissors, FiCompass, FiCheckCircle, FiArrowRight,
  FiClock, FiAlertCircle, FiShield, FiUser
} from 'react-icons/fi';

export default function PartnerWebsiteLandingPage() {
  const router = useRouter();
  const { user, isLoggedIn, login } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [name, setName] = useState('');
  const [partnerRole, setPartnerRole] = useState<'TAILOR' | 'DESIGNER'>('TAILOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Application Tracker State
  const [appStatus, setAppStatus] = useState<any>(null);
  const [checkingApp, setCheckingApp] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === 'TAILOR') {
        setCheckingApp(true);
        getTailorPortalProfile()
          .then(p => {
            setAppStatus(p);
            if (p.applicationStatus === 'APPROVED') router.push('/tailor/dashboard');
          })
          .catch(() => {})
          .finally(() => setCheckingApp(false));
      } else if (user?.role === 'DESIGNER') {
        setCheckingApp(true);
        getDesignerPortalProfile()
          .then(p => {
            setAppStatus(p);
            if (p.applicationStatus === 'APPROVED') router.push('/designer/dashboard');
          })
          .catch(() => {})
          .finally(() => setCheckingApp(false));
      }
    }
  }, [isLoggedIn, user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'LOGIN') {
        const res = await loginUser({ email, password });
        login(res.user, res.token);
        if (res.user.role === 'TAILOR') router.push('/tailor/dashboard');
        else if (res.user.role === 'DESIGNER') router.push('/designer/dashboard');
        else if (res.user.role === 'ADMIN') router.push('/admin/dashboard');
        else router.push('/');
      } else {
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        const res = await registerUser({ name, email, password, role: partnerRole });
        login(res.user, res.token);
        if (partnerRole === 'TAILOR') router.push('/tailor/dashboard');
        else router.push('/designer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPartner = async (role: 'TAILOR' | 'DESIGNER') => {
    setLoading(true);
    try {
      const demoEmail = role === 'TAILOR' ? 'tailor1@vingttrios.com' : 'designer@vingttrios.com';
      const res = await loginUser({ email: demoEmail, password: 'VingtTrios123!' });
      login(res.user, res.token);
      if (role === 'TAILOR') router.push('/tailor/dashboard');
      else router.push('/designer/dashboard');
    } catch (err: any) {
      alert(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vt-partner-website-page">
      {/* Hero Section */}
      <section className="vt-partner-hero">
        <div className="vt-container">
          <div className="vt-grid-2 gap-xl align-center">
            {/* Left Column: Value Proposition */}
            <div>
              <div className="vt-gold-subhead mb-xs">VINGT TRIOS PARTNER NETWORK</div>
              <h1 className="vt-hero-title mb-md">
                Empowering Master Tailors & Fashion Designers
              </h1>
              <p className="vt-hero-desc mb-lg">
                Join our unified partner ecosystem. Tailors receive steady bespoke garment orders with guaranteed 80% revenue payouts. Designers publish original patterns with automatic catalog distribution and 10% royalty income per order.
              </p>

              {/* 2 Partner Tracks */}
              <div className="vt-grid-2 gap-md mb-lg">
                <div className="vt-card p-md">
                  <div className="vt-flex-align-gap mb-xs">
                    <FiScissors size={20} className="vt-gold-text" />
                    <h3 className="vt-font-medium">Tailor Workshop</h3>
                  </div>
                  <p className="vt-text-sub font-xs">
                    Receive pre-measured bespoke orders, inspect formatted spec sheets, upload stage photos, and get Razorpay bank settlements.
                  </p>
                </div>

                <div className="vt-card p-md">
                  <div className="vt-flex-align-gap mb-xs">
                    <FiCompass size={20} className="vt-gold-text" />
                    <h3 className="vt-font-medium">Designer Studio</h3>
                  </div>
                  <p className="vt-text-sub font-xs">
                    Upload original pattern sketches, track version history (v1, v2), discuss feasibility with admin, and earn royalties per order.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Unified Partner Auth Box */}
            <div>
              <div className="vt-card vt-partner-auth-box">
                {/* Application Status Tracker Banner if logged in but pending */}
                {isLoggedIn && appStatus && appStatus.applicationStatus !== 'APPROVED' && (
                  <div className="vt-alert-banner warning mb-md">
                    <FiClock size={18} />
                    <div>
                      <strong>Application Status: {appStatus.applicationStatus}</strong>
                      <div className="font-xs">Your partner application is under review by Vingt Trios Admin. Approval will grant full dashboard access.</div>
                    </div>
                  </div>
                )}

                {/* Auth Form Header */}
                <div className="vt-auth-tabs-row mb-md">
                  <button
                    className={`vt-auth-tab ${activeTab === 'LOGIN' ? 'active' : ''}`}
                    onClick={() => setActiveTab('LOGIN')}
                  >
                    Partner Sign In
                  </button>
                  <button
                    className={`vt-auth-tab ${activeTab === 'REGISTER' ? 'active' : ''}`}
                    onClick={() => setActiveTab('REGISTER')}
                  >
                    Apply for Partnership
                  </button>
                </div>

                {/* Quick Demo Buttons */}
                <div className="vt-grid-2 gap-xs mb-md">
                  <button
                    type="button"
                    className="vt-btn vt-btn-secondary vt-btn-sm"
                    onClick={() => handleDemoPartner('TAILOR')}
                  >
                    <FiScissors size={13} /> Demo Tailor Portal
                  </button>
                  <button
                    type="button"
                    className="vt-btn vt-btn-secondary vt-btn-sm"
                    onClick={() => handleDemoPartner('DESIGNER')}
                  >
                    <FiCompass size={13} /> Demo Designer Studio
                  </button>
                </div>

                <form onSubmit={handleAuth} className="vt-form">
                  {activeTab === 'REGISTER' && (
                    <>
                      <div className="vt-form-group mb-sm">
                        <label>Select Partnership Track:</label>
                        <div className="vt-grid-2 gap-xs">
                          <button
                            type="button"
                            className={`vt-chip-btn ${partnerRole === 'TAILOR' ? 'active' : ''}`}
                            onClick={() => setPartnerRole('TAILOR')}
                          >
                            <FiScissors size={13} /> Tailor Workshop
                          </button>
                          <button
                            type="button"
                            className={`vt-chip-btn ${partnerRole === 'DESIGNER' ? 'active' : ''}`}
                            onClick={() => setPartnerRole('DESIGNER')}
                          >
                            <FiCompass size={13} /> Designer Studio
                          </button>
                        </div>
                      </div>

                      <div className="vt-form-group mb-sm">
                        <label>Full Name / Business Owner:</label>
                        <input
                          type="text"
                          className="vt-input-md"
                          placeholder="e.g. Master Adithya"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="vt-form-group mb-sm">
                    <label>Email Address:</label>
                    <input
                      type="email"
                      className="vt-input-md"
                      placeholder="you@workshop.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="vt-form-group mb-md">
                    <label>Password:</label>
                    <input
                      type="password"
                      className="vt-input-md"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPass(e.target.value)}
                      required
                    />
                  </div>

                  {error && <div className="vt-alert-banner danger mb-md p-xs">{error}</div>}

                  <button type="submit" className="vt-btn vt-btn-gold w-full" disabled={loading}>
                    {loading ? 'Authenticating...' : activeTab === 'LOGIN' ? 'Sign In to Partner Console' : `Submit ${partnerRole === 'TAILOR' ? 'Tailor' : 'Designer'} Application`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
