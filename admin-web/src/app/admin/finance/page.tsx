'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { KpiCard } from '@/components/admin/KpiCard';
import { ChartBar, ChartDonut } from '@/components/admin/ChartBar';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getRevenueDashboard, getPayoutHistory, getDisputedOrders, processRefund, exportOrdersCsvUrl } from '@/lib/api';
import { FiDollarSign, FiDownload, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';

export default function FinanceDashboardPage() {
  const [period, setPeriod] = useState<string>('month');
  const [revenueData, setRevenueData] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refund Modal State
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rData, pData, dData] = await Promise.all([
        getRevenueDashboard({ period }),
        getPayoutHistory(),
        getDisputedOrders(),
      ]);
      setRevenueData(rData);
      setPayouts(pData.payouts || []);
      setDisputes(dData || []);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId || !refundAmount) return;
    setRefunding(true);
    try {
      await processRefund(refundOrderId, { reason: refundReason, amount: parseFloat(refundAmount) });
      alert('Refund processed successfully!');
      setShowRefundModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setRefunding(false);
    }
  };

  const payoutColumns: Column<any>[] = [
    { key: 'id', header: 'Transfer Ref', render: (r) => r.razorpayTransferId || r.id.slice(0, 8) },
    { key: 'tailor', header: 'Tailor Recipient', render: (r) => r.tailor?.name || 'Tailor' },
    { key: 'amount', header: 'Amount (₹)', render: (r) => `₹${r.amount.toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
  ];

  return (
    <AdminLayout title="Finance, Revenue & Razorpay Reconciliation" onRefresh={loadData}>
      <div className="vt-finance-page">
        {/* Controls Toolbar */}
        <div className="vt-filter-bar mb-lg">
          <div className="vt-period-selector">
            {['today', 'week', 'month', 'quarter', 'year'].map(p => (
              <button
                key={p}
                className={`vt-period-btn ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="vt-flex-align-gap">
            <button className="vt-btn vt-btn-secondary" onClick={() => setShowRefundModal(true)}>
              <FiRotateCcw size={14} /> Process Refund
            </button>
            <a
              href={exportOrdersCsvUrl(period)}
              target="_blank"
              rel="noopener noreferrer"
              className="vt-btn vt-btn-gold"
            >
              <FiDownload size={14} /> Export Revenue CSV
            </a>
          </div>
        </div>

        {loading ? (
          <div className="vt-skeleton-card" style={{ height: '300px' }} />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="vt-grid-4 gap-md mb-lg">
              <KpiCard
                title="Gross Revenue"
                value={`₹${(revenueData?.totalRevenue || 0).toLocaleString('en-IN')}`}
                subValue={`${revenueData?.orderCount || 0} completed order(s)`}
                icon={FiDollarSign}
                accentColor="#10b981"
              />
              <KpiCard
                title="Tailor Payouts Settled"
                value={`₹${(revenueData?.totalPayouts || 0).toLocaleString('en-IN')}`}
                subValue="Via Razorpay Transfers"
                icon={FiDollarSign}
                accentColor="#3b82f6"
              />
              <KpiCard
                title="Net Platform Revenue"
                value={`₹${(revenueData?.netRevenue || 0).toLocaleString('en-IN')}`}
                subValue="Gross - Payouts"
                icon={FiDollarSign}
                accentColor="#ECBB0D"
              />
              <KpiCard
                title="Open Disputes"
                value={disputes.length}
                subValue="Urgent tickets"
                icon={FiAlertTriangle}
                accentColor="#ef4444"
              />
            </div>

            {/* Revenue Charts */}
            <div className="vt-grid-2 gap-lg mb-lg">
              <div className="vt-card">
                <h3>Daily Revenue Trend (30 Days)</h3>
                <div style={{ marginTop: '20px' }}>
                  <ChartBar data={revenueData?.byDay || {}} />
                </div>
              </div>

              <div className="vt-card">
                <h3>Category Breakdown</h3>
                <ChartDonut data={revenueData?.byCategory || {}} />
              </div>
            </div>

            {/* Payout History */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3>Razorpay Settlements & Payout History</h3>
              </div>
              <DataTable
                columns={payoutColumns}
                data={payouts}
                searchPlaceholder="Search payouts..."
              />
            </div>
          </>
        )}

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="vt-modal-backdrop">
            <div className="vt-modal-card">
              <div className="vt-modal-header">
                <h3>Process Order Refund & Cancellation</h3>
                <button className="vt-close-btn" onClick={() => setShowRefundModal(false)}>✕</button>
              </div>

              <form onSubmit={handleRefundSubmit} className="vt-form">
                <div className="vt-form-group mb-sm">
                  <label>Order ID:</label>
                  <input type="text" className="vt-input-md" placeholder="Enter Order ID" value={refundOrderId} onChange={e => setRefundOrderId(e.target.value)} required />
                </div>

                <div className="vt-form-group mb-sm">
                  <label>Refund Amount (₹):</label>
                  <input type="number" className="vt-input-md" placeholder="Amount to refund" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} required />
                </div>

                <div className="vt-form-group mb-md">
                  <label>Refund Reason / Dispute Note:</label>
                  <input type="text" className="vt-input-md" placeholder="e.g. Sizing mismatch request" value={refundReason} onChange={e => setRefundReason(e.target.value)} required />
                </div>

                <div className="vt-modal-actions">
                  <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowRefundModal(false)}>Cancel</button>
                  <button type="submit" className="vt-btn vt-btn-danger" disabled={refunding}>
                    {refunding ? 'Processing Refund...' : 'Issue Refund'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
