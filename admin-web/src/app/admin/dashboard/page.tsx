'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { KpiCard } from '@/components/admin/KpiCard';
import { ChartDonut } from '@/components/admin/ChartBar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getAdminKpi, getAdminActivity } from '@/lib/api';
import {
  FiPackage, FiDollarSign, FiScissors, FiHelpCircle,
  FiAlertTriangle, FiUsers, FiClock, FiActivity, FiArrowRight
} from 'react-icons/fi';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [kpi, setKpi] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [kData, aData] = await Promise.all([
        getAdminKpi(),
        getAdminActivity(15),
      ]);
      setKpi(kData);
      setActivity(aData || []);
    } catch (err) {
      console.error('Failed to load dashboard KPIs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentOrderCount = kpi?.orders?.[period] || 0;
  const currentRevenue = kpi?.revenue?.[period] || 0;

  return (
    <AdminLayout title="System Overview & KPIs" onRefresh={loadData}>
      {loading ? (
        <div className="vt-grid-4 gap-md">
          {[1, 2, 3, 4].map(i => <div key={i} className="vt-skeleton-card" />)}
        </div>
      ) : (
        <div className="vt-dashboard-flow">
          {/* Period Toggle Header */}
          <div className="vt-dashboard-subhead">
            <div className="vt-period-selector">
              <button
                className={`vt-period-btn ${period === 'today' ? 'active' : ''}`}
                onClick={() => setPeriod('today')}
              >
                Today
              </button>
              <button
                className={`vt-period-btn ${period === 'week' ? 'active' : ''}`}
                onClick={() => setPeriod('week')}
              >
                This Week
              </button>
              <button
                className={`vt-period-btn ${period === 'month' ? 'active' : ''}`}
                onClick={() => setPeriod('month')}
              >
                This Month
              </button>
            </div>
            <div className="vt-last-synced">Last synced: {new Date().toLocaleTimeString()}</div>
          </div>

          {/* At-a-Glance KPI Cards Grid */}
          <div className="vt-grid-4 gap-md">
            <KpiCard
              title={`Orders (${period.toUpperCase()})`}
              value={currentOrderCount}
              subValue={`Total lifetime: ${kpi?.orders?.total || 0}`}
              icon={FiPackage}
              accentColor="#ECBB0D"
              onClick={() => router.push('/admin/orders')}
            />
            <KpiCard
              title={`Revenue (${period.toUpperCase()})`}
              value={`₹${Number(currentRevenue).toLocaleString('en-IN')}`}
              subValue="Settled via Razorpay"
              icon={FiDollarSign}
              accentColor="#10b981"
              onClick={() => router.push('/admin/finance')}
            />
            <KpiCard
              title="Active Tailors"
              value={kpi?.activeTailors || 0}
              subValue={`${kpi?.pendingTailorApplications || 0} pending applications`}
              icon={FiScissors}
              accentColor="#3b82f6"
              onClick={() => router.push('/admin/tailors')}
            />
            <KpiCard
              title="Open Support Tickets"
              value={kpi?.openTickets || 0}
              subValue={`${kpi?.lowStockFabrics || 0} low stock fabric alerts`}
              icon={FiHelpCircle}
              accentColor="#ef4444"
              onClick={() => router.push('/admin/support')}
            />
          </div>

          {/* Quick Action Alerts Bar if items pending approval */}
          {((kpi?.pendingTailorApplications || 0) > 0 || (kpi?.pendingDesignerApplications || 0) > 0 || (kpi?.lowStockFabrics || 0) > 0) && (
            <div className="vt-alert-banner">
              <div className="vt-alert-title">
                <FiAlertTriangle size={18} />
                <span>Action Required: Attention Needed</span>
              </div>
              <div className="vt-alert-items">
                {kpi?.pendingTailorApplications > 0 && (
                  <button className="vt-alert-chip" onClick={() => router.push('/admin/tailors')}>
                    {kpi.pendingTailorApplications} Tailor Application(s) Pending
                  </button>
                )}
                {kpi?.pendingDesignerApplications > 0 && (
                  <button className="vt-alert-chip" onClick={() => router.push('/admin/designers')}>
                    {kpi.pendingDesignerApplications} Designer Proposal(s) Pending
                  </button>
                )}
                {kpi?.lowStockFabrics > 0 && (
                  <button className="vt-alert-chip danger" onClick={() => router.push('/admin/catalog/fabrics')}>
                    {kpi.lowStockFabrics} Fabric(s) Low Stock
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Analytics Grid: Donut Breakdown + Activity Feed */}
          <div className="vt-grid-2 gap-lg" style={{ marginTop: '24px' }}>
            {/* Order Status Breakdown Chart */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3>Order Pipeline Breakdown</h3>
                <button className="vt-text-link" onClick={() => router.push('/admin/orders')}>View All Orders</button>
              </div>
              <ChartDonut
                data={{
                  'Paid (Unassigned)': kpi?.orderStatus?.paid || 0,
                  'In Production': kpi?.orderStatus?.production || 0,
                  'Shipped': kpi?.orderStatus?.shipped || 0,
                  'Delivered': kpi?.orderStatus?.delivered || 0,
                  'Cancelled': kpi?.orderStatus?.cancelled || 0,
                }}
              />
            </div>

            {/* Recent Audit Activity Feed */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3>System Audit Feed</h3>
                <button className="vt-text-link" onClick={() => router.push('/admin/audit')}>View Full Log</button>
              </div>
              <div className="vt-activity-feed">
                {activity.length === 0 ? (
                  <div className="vt-feed-empty">No recent admin actions logged.</div>
                ) : (
                  activity.map((act) => (
                    <div key={act.id} className="vt-activity-item">
                      <div className="vt-activity-icon">
                        <FiActivity size={14} />
                      </div>
                      <div className="vt-activity-details">
                        <div className="vt-activity-action">{act.action}</div>
                        <div className="vt-activity-meta">
                          <span>{act.actorName}</span> · <span>Target: {act.target}</span>
                        </div>
                      </div>
                      <div className="vt-activity-time">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
