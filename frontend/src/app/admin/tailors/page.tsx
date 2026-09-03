'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getTailorsAdmin, getTailorQueueAdminp, approveTailor, suspendTailorAdmin, updateCommission } from '@/lib/api';
import { FiCheck, FiX, FiEye, FiSlash, FiDollarSign, FiScissors } from 'react-icons/fi';

export default function TailorManagementPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'approved' | 'queue'>('approved');
  const [tailors, setTailors] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tList, qList] = await Promise.all([
        getTailorsAdmin(),
        getTailorQueueAdminp({ status: 'PENDING' }),
      ]);
      setTailors(tList.tailors || []);
      setQueue(qList.tailors || []);
    } catch (err) {
      console.error('Failed to load tailors:', err);
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
      await approveTailor(id, approved);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Approval action failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCommissionChange = async (id: string, rate: number) => {
    setUpdatingId(id);
    try {
      await updateCommission(id, rate);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Commission update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSuspend = async (id: string, suspended: boolean) => {
    setUpdatingId(id);
    try {
      await suspendTailorAdmin(id, !suspended);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Suspend failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const queueColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'Applicant Name',
      render: (row) => (
        <div>
          <div className="vt-font-medium">{row.name}</div>
          <div className="vt-text-sub">{row.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'turnaroundDays',
      header: 'Turnaround Days',
      render: (row) => `${row.turnaroundDays} days`,
    },
    {
      key: 'bio',
      header: 'Bio & Portfolio',
      render: (row) => (
        <div className="vt-text-sub" style={{ maxWidth: '240px' }}>
          {row.bio || 'No bio provided'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Applied On',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
  ];

  const approvedColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'Tailor Name',
      render: (row) => (
        <div>
          <div className="vt-font-medium">{row.name}</div>
          <div className="vt-text-sub">{row.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => <span className="vt-gold-star">★ {row.rating.toFixed(1)}</span>,
    },
    {
      key: 'charge',
      header: 'Base Fee (₹)',
      render: (row) => `₹${row.charge.toLocaleString('en-IN')}`,
    },
    {
      key: 'commissionRate',
      header: 'Commission %',
      render: (row) => (
        <input
          type="number"
          className="vt-input-sm"
          style={{ width: '70px' }}
          defaultValue={row.commissionRate}
          disabled={updatingId === row.id}
          onBlur={(e) => handleCommissionChange(row.id, parseFloat(e.target.value))}
        />
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (row) => (
        row.user?.suspended ? <span className="vt-chip danger">SUSPENDED</span> : <span className="vt-chip success">APPROVED</span>
      ),
    },
  ];

  return (
    <AdminLayout title="Tailor Network & Application Queue" onRefresh={loadData}>
      <div className="vt-tailors-page">
        {/* Tab Toggle */}
        <div className="vt-tabs">
          <button
            className={`vt-tab-btn ${tab === 'approved' ? 'active' : ''}`}
            onClick={() => setTab('approved')}
          >
            Active Tailors ({tailors.length})
          </button>
          <button
            className={`vt-tab-btn ${tab === 'queue' ? 'active' : ''}`}
            onClick={() => setTab('queue')}
          >
            Application Queue ({queue.length})
            {queue.length > 0 && <span className="vt-badge-count">{queue.length}</span>}
          </button>
        </div>

        {loading ? (
          <div className="vt-skeleton-table" />
        ) : tab === 'queue' ? (
          <DataTable
            columns={queueColumns}
            data={queue}
            searchPlaceholder="Search applicants..."
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
        ) : (
          <DataTable
            columns={approvedColumns}
            data={tailors}
            searchPlaceholder="Search active tailors..."
            actions={(row) => (
              <div className="vt-flex-align-gap">
                <button
                  className="vt-btn-icon"
                  title="View Profile & Ledger"
                  onClick={() => router.push(`/admin/tailors/${row.id}`)}
                >
                  <FiEye size={15} />
                </button>
                <button
                  className={`vt-btn-icon ${row.user?.suspended ? 'active' : ''}`}
                  title={row.user?.suspended ? 'Unsuspend' : 'Suspend'}
                  disabled={updatingId === row.id}
                  onClick={() => handleSuspend(row.id, row.user?.suspended)}
                >
                  <FiSlash size={15} />
                </button>
              </div>
            )}
          />
        )}
      </div>
    </AdminLayout>
  );
}
