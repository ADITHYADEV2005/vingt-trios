'use client';
import { useState, useEffect, useCallback } from 'react';
import { getTailorPortalEarnings } from '@/lib/api';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function TailorEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTailorPortalEarnings();
      setData(res);
    } catch (err) {
      console.error('Failed to load tailor earnings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <div className="vt-skeleton-card" style={{ height: '350px' }} />;
  }

  const summary = data?.summary || {};
  const ordersBreakdown = data?.ordersBreakdown || [];
  const payoutsHistory = data?.payoutsHistory || [];

  const columns: Column<any>[] = [
    { key: 'id', header: 'Order Ref', render: (r) => <span className="vt-code-link">#{r.id.slice(0, 8).toUpperCase()}</span> },
    { key: 'date', header: 'Order Date', render: (r) => new Date(r.date).toLocaleDateString('en-IN') },
    { key: 'status', header: 'Order Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'grossPrice', header: 'Customer Gross (₹)', render: (r) => `₹${r.grossPrice.toLocaleString('en-IN')}` },
    { key: 'platformCut', header: 'Platform Cut (20%)', render: (r) => `₹${r.platformCut.toLocaleString('en-IN')}` },
    { key: 'tailorEarning', header: 'Tailor Share (80%)', render: (r) => <strong className="vt-gold-text">₹{r.tailorEarning.toLocaleString('en-IN')}</strong> },
  ];

  return (
    <div className="vt-tailor-earnings-page">
      {/* Summary Banner */}
      <div className="vt-grid-4 gap-md mb-lg">
        <div className="vt-kpi-card">
          <div className="vt-kpi-title">Gross Revenue Generated</div>
          <div className="vt-kpi-value">₹{Number(summary.totalGross || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">Total customer orders</div>
        </div>

        <div className="vt-kpi-card">
          <div className="vt-kpi-title">Tailor Earnings ({summary.commissionRate || 80}%)</div>
          <div className="vt-kpi-value gold">₹{Number(summary.totalTailorShare || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">Net tailor share</div>
        </div>

        <div className="vt-kpi-card">
          <div className="vt-kpi-title">Paid Out via Razorpay</div>
          <div className="vt-kpi-value">₹{Number(summary.paidPayouts || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">Transferred to bank</div>
        </div>

        <div className="vt-kpi-card">
          <div className="vt-kpi-title">Pending Settlement</div>
          <div className="vt-kpi-value gold">₹{Number(summary.pendingPayouts || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">Pending transfer</div>
        </div>
      </div>

      {/* Per-Order Earnings Breakdown */}
      <div className="vt-card mb-lg">
        <div className="vt-card-header">
          <h3>Per-Order Fee Transparency Breakdown</h3>
        </div>
        <DataTable
          columns={columns}
          data={ordersBreakdown}
          searchPlaceholder="Search order ref..."
        />
      </div>

      {/* Razorpay Payout History */}
      <div className="vt-card">
        <div className="vt-card-header">
          <h3>Razorpay Payout History ({payoutsHistory.length})</h3>
        </div>
        {payoutsHistory.length === 0 ? (
          <div className="vt-feed-empty">No payouts processed yet.</div>
        ) : (
          <div className="vt-mini-list">
            {payoutsHistory.map((p: any) => (
              <div key={p.id} className="vt-mini-item">
                <div>
                  <div className="vt-font-medium">Transfer #{p.razorpayTransferId || p.id.slice(0, 8)}</div>
                  <div className="vt-text-sub">{p.notes || 'Razorpay Payout Settlement'}</div>
                </div>
                <StatusBadge status={p.status} />
                <div className="vt-amount">₹{p.amount.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
