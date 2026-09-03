'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getDesignerPortalDashboard } from '@/lib/api';
import {
  FiFeather, FiClock, FiDollarSign, FiUsers, FiPlusCircle,
  FiTrendingUp, FiArrowRight, FiSliders
} from 'react-icons/fi';

export default function DesignerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDesignerPortalDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load designer dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="vt-grid-4 gap-md">
        {[1, 2, 3, 4].map(i => <div key={i} className="vt-skeleton-card" style={{ height: '140px' }} />)}
      </div>
    );
  }

  const stats = data?.stats || {};
  const profile = data?.profile || {};
  const proposals = data?.recentProposals || [];

  return (
    <div className="vt-designer-dashboard-flow">
      {/* Welcome Banner */}
      <div className="vt-dashboard-welcome mb-lg">
        <div>
          <h2>Couture Studio Dashboard</h2>
          <p>Welcome back, <strong className="vt-gold-text">{profile.name}</strong> {profile.brandName && `(${profile.brandName})`}</p>
        </div>
        <button className="vt-btn vt-btn-gold" onClick={() => router.push('/designer/designs/new')}>
          <FiPlusCircle size={16} /> Upload New Design
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="vt-grid-4 gap-md mb-lg">
        <div className="vt-kpi-card interactive" onClick={() => router.push('/designer/designs')}>
          <div className="vt-kpi-top">
            <span className="vt-kpi-title">Live Approved Designs</span>
            <div className="vt-kpi-icon-box" style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)' }}>
              <FiFeather size={18} />
            </div>
          </div>
          <div className="vt-kpi-value">{stats.liveDesigns || 0}</div>
          <div className="vt-kpi-sub">Monetizable in catalog</div>
        </div>

        <div className="vt-kpi-card interactive" onClick={() => router.push('/designer/designs')}>
          <div className="vt-kpi-top">
            <span className="vt-kpi-title">Pending Approval</span>
            <div className="vt-kpi-icon-box" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.15)' }}>
              <FiClock size={18} />
            </div>
          </div>
          <div className="vt-kpi-value gold">{stats.pendingApproval || 0}</div>
          <div className="vt-kpi-sub">Under admin review</div>
        </div>

        <div className="vt-kpi-card interactive" onClick={() => router.push('/designer/monetization')}>
          <div className="vt-kpi-top">
            <span className="vt-kpi-title">Total Royalty Earnings</span>
            <div className="vt-kpi-icon-box" style={{ color: '#ECBB0D', background: 'rgba(236,187,13,0.15)' }}>
              <FiDollarSign size={18} />
            </div>
          </div>
          <div className="vt-kpi-value gold">₹{Number(stats.totalEarnings || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">{stats.royaltyRate || 10}% Royalty Share</div>
        </div>

        <div className="vt-kpi-card">
          <div className="vt-kpi-top">
            <span className="vt-kpi-title">Brand Followers</span>
            <div className="vt-kpi-icon-box" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.15)' }}>
              <FiUsers size={18} />
            </div>
          </div>
          <div className="vt-kpi-value">{stats.followersCount || 0}</div>
          <div className="vt-kpi-sub">Engaged customers</div>
        </div>
      </div>

      {/* Top Performer Banner */}
      {stats.topDesign && (
        <div className="vt-alert-banner mb-lg">
          <div className="vt-alert-title">
            <FiTrendingUp size={18} />
            <span>Top Performer: <strong>{stats.topDesign.title}</strong> has generated {stats.topDesign.orders} orders!</span>
          </div>
          <button className="vt-alert-chip" onClick={() => router.push('/designer/monetization')}>
            View Analytics
          </button>
        </div>
      )}

      {/* Custom Proposal Requests List */}
      <div className="vt-card">
        <div className="vt-card-header">
          <h3>Custom Client Orders Awaiting Proposals ({proposals.length})</h3>
        </div>

        {proposals.length === 0 ? (
          <div className="vt-feed-empty">No custom proposals pending client response.</div>
        ) : (
          <div className="vt-mini-list">
            {proposals.map((p: any) => (
              <div key={p.id} className="vt-mini-item">
                <div>
                  <div className="vt-font-medium">Order #{p.order?.id?.slice(0, 8).toUpperCase()}</div>
                  <div className="vt-text-sub">Customer: {p.order?.customer?.name} · "{p.description.slice(0, 50)}..."</div>
                </div>
                <span className={`vt-chip ${p.status === 'APPROVED' ? 'success' : 'warning'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
