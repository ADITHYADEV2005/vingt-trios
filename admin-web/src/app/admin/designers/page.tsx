'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { getDesignersAdmin, getDesignerQueueAdmin, approveDesigner, updateDesignerRoyalty, getDesignUsageStats } from '@/lib/api';
import { FiCheck, FiX, FiEye, FiFeather, FiTrendingUp } from 'react-icons/fi';

export default function DesignerManagementPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'approved' | 'queue' | 'stats'>('approved');
  const [designers, setDesigners] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dList, qList, sList] = await Promise.all([
        getDesignersAdmin(),
        getDesignerQueueAdmin({ status: 'PENDING' }),
        getDesignUsageStats(),
      ]);
      setDesigners(dList.designers || []);
      setQueue(qList.designers || []);
      setStats(sList || []);
    } catch (err) {
      console.error('Failed to load designers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string, approved: boolean) => {
    setUpdatingId(id);
    try {
      await approveDesigner(id, approved);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoyaltyChange = async (id: string, rate: number) => {
    setUpdatingId(id);
    try {
      await updateDesignerRoyalty(id, rate);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Royalty update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const approvedColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'Designer Name',
      render: (row) => (
        <div>
          <div className="vt-font-medium">{row.name}</div>
          <div className="vt-text-sub">{row.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'royaltyRate',
      header: 'Royalty %',
      render: (row) => (
        <input
          type="number"
          className="vt-input-sm"
          style={{ width: '70px' }}
          defaultValue={row.royaltyRate}
          disabled={updatingId === row.id}
          onBlur={(e) => handleRoyaltyChange(row.id, parseFloat(e.target.value))}
        />
      ),
    },
    {
      key: 'totalEarnings',
      header: 'Total Royalties Paid (₹)',
      render: (row) => `₹${row.totalEarnings.toLocaleString('en-IN')}`,
    },
    {
      key: 'createdAt',
      header: 'Approved Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <AdminLayout title="Fashion Designer Network & Royalty Rates" onRefresh={loadData}>
      <div className="vt-designers-page">
        <div className="vt-tabs">
          <button
            className={`vt-tab-btn ${tab === 'approved' ? 'active' : ''}`}
            onClick={() => setTab('approved')}
          >
            Approved Designers ({designers.length})
          </button>
          <button
            className={`vt-tab-btn ${tab === 'queue' ? 'active' : ''}`}
            onClick={() => setTab('queue')}
          >
            Approval Queue ({queue.length})
            {queue.length > 0 && <span className="vt-badge-count">{queue.length}</span>}
          </button>
          <button
            className={`vt-tab-btn ${tab === 'stats' ? 'active' : ''}`}
            onClick={() => setTab('stats')}
          >
            Design Usage Stats
          </button>
        </div>

        {loading ? (
          <div className="vt-skeleton-table" />
        ) : tab === 'queue' ? (
          <DataTable
            columns={[
              { key: 'name', header: 'Designer', render: (r) => r.name },
              { key: 'bio', header: 'Bio', render: (r) => r.bio || 'No bio provided' },
              { key: 'createdAt', header: 'Applied Date', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
            ]}
            data={queue}
            actions={(row) => (
              <div className="vt-flex-align-gap">
                <button
                  className="vt-btn vt-btn-success vt-btn-sm"
                  disabled={updatingId === row.id}
                  onClick={() => handleApprove(row.id, true)}
                >
                  <FiCheck size={14} /> Approve
                </button>
                <button
                  className="vt-btn vt-btn-danger vt-btn-sm"
                  disabled={updatingId === row.id}
                  onClick={() => handleApprove(row.id, false)}
                >
                  <FiX size={14} /> Reject
                </button>
              </div>
            )}
          />
        ) : tab === 'stats' ? (
          <div className="vt-card">
            <h3>Design Order Drivers</h3>
            <div className="vt-mini-list mt-md">
              {stats.map((s: any) => (
                <div key={s.designer.id} className="vt-mini-item">
                  <div>
                    <div className="vt-font-medium">{s.designer.name}</div>
                    <div className="vt-text-sub">{s.orderCount} custom order(s) generated</div>
                  </div>
                  <div className="vt-amount">₹{s.totalRevenue.toLocaleString('en-IN')} revenue</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DataTable
            columns={approvedColumns}
            data={designers}
            searchPlaceholder="Search designers..."
          />
        )}
      </div>
    </AdminLayout>
  );
}
