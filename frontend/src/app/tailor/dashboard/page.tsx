'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getTailorPortalDashboard, respondToTailorOrder } from '@/lib/api';
import {
  FiPackage, FiClock, FiDollarSign, FiStar, FiCheck,
  FiX, FiArrowRight, FiAlertTriangle, FiScissors, FiTrendingUp
} from 'react-icons/fi';

export default function TailorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTailorPortalDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load tailor dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRespond = async (orderId: string, accept: boolean) => {
    setActionId(orderId);
    try {
      await respondToTailorOrder(orderId, { accept });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Response failed');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="vt-grid-4 gap-md">
        {[1, 2, 3, 4].map(i => <div key={i} className="vt-skeleton-card" style={{ height: '140px' }} />)}
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const profile = data?.profile || {};

  return (
    <div className="vt-tailor-dashboard-flow">
      {/* Welcome Banner */}
      <div className="vt-dashboard-welcome mb-lg">
        <div>
          <h2>Workshop Operations Dashboard</h2>
          <p>Logged in as <strong className="vt-gold-text">{profile.name}</strong> {profile.shopName && `(${profile.shopName})`}</p>
        </div>
        <div className="vt-capacity-badge">
          <span>Capacity:</span>
          <strong>{stats.capacity?.current || 0} / {stats.capacity?.max || 10} Orders</strong>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="vt-grid-4 gap-md mb-lg">
        <div className="vt-kpi-card interactive" onClick={() => router.push('/tailor/orders')}>
          <div className="vt-kpi-top">
            <span className="vt-kpi-title">Active Orders</span>
            <div className="vt-kpi-icon-box" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.15)' }}>
              <FiPackage size={18} />
            </div>
          </div>
          <div className="vt-kpi-value">{stats.activeOrders || 0}</div>
          <div className="vt-kpi-sub">Currently in production</div>
        </div>

        <div className="vt-kpi-card interactive" onClick={() => router.push('/tailor/orders')}>
          <div className="vt-kpi-top">
            <span className="vt-kpi-title">Due This Week</span>
            <div className="vt-kpi-icon-box" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.15)' }}>
              <FiClock size={18} />
            </div>
          </div>
          <div className="vt-kpi-value gold">{stats.dueThisWeek || 0}</div>
          <div className="vt-kpi-sub">Upcoming deadlines</div>
        </div>

        <div className="vt-kpi-card interactive" onClick={() => router.push('/tailor/earnings')}>
          <div className="vt-kpi-top">
            <span className="vt-kpi-title">Pending Payout</span>
            <div className="vt-kpi-icon-box" style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)' }}>
              <FiDollarSign size={18} />
            </div>
          </div>
          <div className="vt-kpi-value">₹{Number(stats.pendingPayout || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">Razorpay balance</div>
        </div>

        <div className="vt-kpi-card interactive" onClick={() => router.push('/tailor/reviews')}>
          <div className="vt-kpi-top">
            <span className="vt-kpi-title">Average Rating</span>
            <div className="vt-kpi-icon-box" style={{ color: '#ECBB0D', background: 'rgba(236,187,13,0.15)' }}>
              <FiStar size={18} />
            </div>
          </div>
          <div className="vt-kpi-value gold">★ {Number(stats.rating || 5.0).toFixed(1)}</div>
          <div className="vt-kpi-sub">Customer Satisfaction</div>
        </div>
      </div>

      {/* Active Order Queue */}
      <div className="vt-card">
        <div className="vt-card-header">
          <h3>Assigned Work Queue ({recentOrders.length})</h3>
          <button className="vt-text-link" onClick={() => router.push('/tailor/orders')}>View Full Queue</button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="vt-feed-empty">No orders currently assigned to your workshop.</div>
        ) : (
          <div className="vt-tailor-order-list">
            {recentOrders.map((o: any) => (
              <div key={o.id} className="vt-tailor-order-card mb-sm">
                <div className="vt-order-card-top">
                  <div>
                    <span className="vt-code-link" onClick={() => router.push(`/tailor/orders/${o.id}`)}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`vt-status-badge badge-${o.status.toLowerCase()}`} style={{ marginLeft: '10px' }}>
                      {o.status}
                    </span>
                  </div>
                  <div className="vt-amount">₹{Number(o.totalPrice).toLocaleString('en-IN')}</div>
                </div>

                <div className="vt-order-card-meta">
                  <span>Customer: <strong>{o.customer?.name}</strong></span>
                  <span>Items: <strong>{o.items?.map((it: any) => it.name).join(', ')}</strong></span>
                  <span>Date: {new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                </div>

                {/* Respond / Actions */}
                <div className="vt-order-card-actions">
                  {!o.acceptedByTailor && o.status === 'ASSIGNED' ? (
                    <div className="vt-flex-align-gap">
                      <button
                        className="vt-btn vt-btn-success vt-btn-sm"
                        disabled={actionId === o.id}
                        onClick={() => handleRespond(o.id, true)}
                      >
                        <FiCheck size={14} /> Accept Order Request
                      </button>
                      <button
                        className="vt-btn vt-btn-danger vt-btn-sm"
                        disabled={actionId === o.id}
                        onClick={() => handleRespond(o.id, false)}
                      >
                        <FiX size={14} /> Decline
                      </button>
                    </div>
                  ) : (
                    <button
                      className="vt-btn vt-btn-secondary vt-btn-sm"
                      onClick={() => router.push(`/tailor/orders/${o.id}`)}
                    >
                      Open Spec Sheet & Controls <FiArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
