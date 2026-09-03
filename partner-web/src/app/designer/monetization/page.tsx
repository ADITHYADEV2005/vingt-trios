'use client';
import { useState, useEffect, useCallback } from 'react';
import { getDesignerMonetization } from '@/lib/api';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FiDollarSign, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

export default function DesignerMonetizationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDesignerMonetization();
      setData(res);
    } catch (err) {
      console.error('Failed to load monetization data:', err);
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
  const designsBreakdown = data?.designsBreakdown || [];

  const columns: Column<any>[] = [
    { key: 'title', header: 'Design Title', render: (r) => <strong className="vt-gold-text">{r.title}</strong> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'licensingTier', header: 'Licensing Tier', render: (r) => <span className="vt-chip warning">{r.licensingTier}</span> },
    { key: 'ordersGenerated', header: 'Orders Generated', render: (r) => r.ordersGenerated },
    { key: 'revenueGenerated', header: 'Gross Customer Sales (₹)', render: (r) => `₹${r.revenueGenerated.toLocaleString('en-IN')}` },
    { key: 'designerRoyalty', header: 'Designer Royalty Earned', render: (r) => <strong className="vt-gold-text">₹{r.designerRoyalty.toLocaleString('en-IN')}</strong> },
  ];

  return (
    <div className="vt-designer-monetization-page">
      {/* Summary KPI Cards */}
      <div className="vt-grid-4 gap-md mb-lg">
        <div className="vt-kpi-card">
          <div className="vt-kpi-title">Gross Sales Generated</div>
          <div className="vt-kpi-value">₹{Number(summary.totalGrossGenerated || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">Total sales via your designs</div>
        </div>

        <div className="vt-kpi-card">
          <div className="vt-kpi-title">Net Designer Royalty ({summary.royaltyRate || 10}%)</div>
          <div className="vt-kpi-value gold">₹{Number(summary.totalRoyaltiesEarned || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">Direct royalty income</div>
        </div>

        <div className="vt-kpi-card">
          <div className="vt-kpi-title">Platform Share</div>
          <div className="vt-kpi-value">₹{Number(summary.platformShare || 0).toLocaleString('en-IN')}</div>
          <div className="vt-kpi-sub">Vingt Trios platform cut</div>
        </div>

        <div className="vt-kpi-card">
          <div className="vt-kpi-title">Razorpay Payout Status</div>
          <div className="vt-kpi-value gold">Settled</div>
          <div className="vt-kpi-sub">Direct to bank account</div>
        </div>
      </div>

      {/* Per-Design Royalty Table */}
      <div className="vt-card mb-lg">
        <div className="vt-card-header">
          <h3>Per-Design Royalty Income Ledger</h3>
        </div>
        <DataTable
          columns={columns}
          data={designsBreakdown}
          searchPlaceholder="Search design title..."
        />
      </div>
    </div>
  );
}
