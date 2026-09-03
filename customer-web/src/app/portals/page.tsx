'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { loginUser } from '@/lib/api';
import {
  FiScissors, FiCompass, FiShield, FiShoppingBag,
  FiArrowRight, FiCheckCircle, FiLock
} from 'react-icons/fi';

export default function PortalSelectorHubPage() {
  const router = useRouter();
  const { login, user } = useApp();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleDemoLogin = async (role: string, email: string) => {
    setLoadingRole(role);
    try {
      const res = await loginUser({ email, password: 'VingtTrios123!' });
      login(res.user, res.token);
      if (role === 'TAILOR') router.push('/tailor/dashboard');
      else if (role === 'DESIGNER') router.push('/designer/dashboard');
      else if (role === 'ADMIN') router.push('/admin/dashboard');
      else router.push('/');
    } catch (err: any) {
      alert(err.message || 'Login failed');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="vt-portal-selector-page">
      <div className="vt-container py-xl">
        <div className="text-center mb-xl">
          <div className="vt-gold-subhead mb-xs">VINGT TRIOS WORKSPACE GATEWAY</div>
          <h1 className="vt-page-title">Select Your Platform Portal</h1>
          <p className="vt-page-sub text-center" style={{ maxWidth: '650px', margin: '0 auto' }}>
            Choose your role workspace below to open the dedicated dashboard. Each portal provides specialized tools tailored to your operational needs.
          </p>
        </div>

        {/* 4 Portal Cards Grid */}
        <div className="vt-grid-2 gap-lg">
          {/* Card 1: Tailor Workshop Console */}
          <div className="vt-card vt-portal-choice-card">
            <div className="vt-portal-card-header">
              <div className="vt-portal-icon-box gold">
                <FiScissors size={28} />
              </div>
              <span className="vt-chip warning">MOBILE-RESPONSIVE WORKSHOP</span>
            </div>

            <h2 className="vt-portal-card-title mt-md">Tailor Workshop Console</h2>
            <p className="vt-portal-card-desc">
              Dedicated mobile & desktop portal for master tailors to accept assigned orders, inspect measurement spec sheets, upload stage progress photos, flag spec issues, and manage Razorpay settlements.
            </p>

            <ul className="vt-portal-features-list my-md">
              <li><FiCheckCircle size={14} /> Formatted Customer Measurement Spec Sheet</li>
              <li><FiCheckCircle size={14} /> 5-Stage Stepper (Cutting → Stitching → QC → Dispatch)</li>
              <li><FiCheckCircle size={14} /> Stage Progress Photo Uploads & Customer Chat</li>
              <li><FiCheckCircle size={14} /> 80% Tailor Revenue Share & Razorpay Payouts</li>
            </ul>

            <div className="vt-portal-actions">
              <button
                className="vt-btn vt-btn-gold w-full"
                disabled={loadingRole === 'TAILOR'}
                onClick={() => handleDemoLogin('TAILOR', 'tailor1@vingttrios.com')}
              >
                {loadingRole === 'TAILOR' ? 'Launching Workshop...' : 'Open Tailor Workshop Console'} <FiArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Card 2: Designer Creative Studio */}
          <div className="vt-card vt-portal-choice-card">
            <div className="vt-portal-card-header">
              <div className="vt-portal-icon-box cyan">
                <FiCompass size={28} />
              </div>
              <span className="vt-chip success">CREATIVE STUDIO & STOREFRONT</span>
            </div>

            <h2 className="vt-portal-card-title mt-md">Designer Creative Studio</h2>
            <p className="vt-portal-card-desc">
              Visual, portfolio-first workspace for fashion designers to upload original garment patterns, track version control history, discuss feasibility with admin, and track 10% royalty earnings.
            </p>

            <ul className="vt-portal-features-list my-md">
              <li><FiCheckCircle size={14} /> Pattern Creation & Version Control Tree (v1, v2)</li>
              <li><FiCheckCircle size={14} /> Licensing Tier Selector (Open-Use vs Exclusive)</li>
              <li><FiCheckCircle size={14} /> Feasibility Thread & Technical Comments</li>
              <li><FiCheckCircle size={14} /> Auto-Generated Public Storefront & Followers</li>
            </ul>

            <div className="vt-portal-actions">
              <button
                className="vt-btn vt-btn-gold w-full"
                disabled={loadingRole === 'DESIGNER'}
                onClick={() => handleDemoLogin('DESIGNER', 'designer@vingttrios.com')}
              >
                {loadingRole === 'DESIGNER' ? 'Launching Studio...' : 'Open Designer Creative Studio'} <FiArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Card 3: Admin Command Dashboard */}
          <div className="vt-card vt-portal-choice-card">
            <div className="vt-portal-card-header">
              <div className="vt-portal-icon-box purple">
                <FiShield size={28} />
              </div>
              <span className="vt-chip danger">SECURED INTERNAL CONSOLE</span>
            </div>

            <h2 className="vt-portal-card-title mt-md">Admin Command Dashboard</h2>
            <p className="vt-portal-card-desc">
              Data-dense operations console for internal staff with role-based sub-accounts (Super Admin, Support, Finance, Catalog Manager), 2FA OTP, and immutable audit logs.
            </p>

            <ul className="vt-portal-features-list my-md">
              <li><FiCheckCircle size={14} /> Master Order Table & Live Timeline Stepper</li>
              <li><FiCheckCircle size={14} /> Tailor & Designer Approval Queues</li>
              <li><FiCheckCircle size={14} /> Fabric, Style & Pricing Engine CRUD</li>
              <li><FiCheckCircle size={14} /> Support Queue & Append-Only Audit Trail</li>
            </ul>

            <div className="vt-portal-actions">
              <button
                className="vt-btn vt-btn-gold w-full"
                disabled={loadingRole === 'ADMIN'}
                onClick={() => handleDemoLogin('ADMIN', 'adithyadevkichu@gmail.com')}
              >
                {loadingRole === 'ADMIN' ? 'Launching Command...' : 'Open Admin Command Console'} <FiArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Card 4: Customer Storefront */}
          <div className="vt-card vt-portal-choice-card">
            <div className="vt-portal-card-header">
              <div className="vt-portal-icon-box green">
                <FiShoppingBag size={28} />
              </div>
              <span className="vt-chip info">CLIENT EXPERIENCE</span>
            </div>

            <h2 className="vt-portal-card-title mt-md">Customer Storefront & 3D Customizer</h2>
            <p className="vt-portal-card-desc">
              Luxury storefront for clients to design bespoke suits in the 3D customizer, select premium fabrics, save body measurements, and track order progress.
            </p>

            <ul className="vt-portal-features-list my-md">
              <li><FiCheckCircle size={14} /> Real-Time 3D Customization Studio</li>
              <li><FiCheckCircle size={14} /> Saved Measurement Profiles</li>
              <li><FiCheckCircle size={14} /> Live Order Tracking & Support Chat</li>
              <li><FiCheckCircle size={14} /> Razorpay Checkout & Coupons</li>
            </ul>

            <div className="vt-portal-actions">
              <button
                className="vt-btn vt-btn-gold w-full"
                disabled={loadingRole === 'CUSTOMER'}
                onClick={() => handleDemoLogin('CUSTOMER', 'customer@vingttrios.com')}
              >
                {loadingRole === 'CUSTOMER' ? 'Launching Storefront...' : 'Open Customer Storefront'} <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
