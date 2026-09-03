'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { getAdminUsers, suspendUser, banUser, adminUpdateUserRole } from '@/lib/api';
import { FiEye, FiUserCheck, FiSlash, FiShield } from 'react-icons/fi';

const ROLES = ['CUSTOMER', 'TAILOR', 'DESIGNER', 'ADMIN'];

export default function CustomerManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ role: roleFilter || undefined, take: 100 });
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSuspend = async (userId: string, current: boolean) => {
    setUpdatingId(userId);
    try {
      await suspendUser(userId, !current);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleBan = async (userId: string, current: boolean) => {
    setUpdatingId(userId);
    try {
      await banUser(userId, !current);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdatingId(userId);
    try {
      await adminUpdateUserRole({ userId, role });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Role update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'User Name',
      render: (row) => (
        <div>
          <div className="vt-font-medium">{row.name}</div>
          <div className="vt-text-sub">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'System Role',
      render: (row) => (
        <select
          className="vt-select-sm"
          value={row.role}
          disabled={updatingId === row.id}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
        >
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      ),
    },
    {
      key: 'ordersCount',
      header: 'Total Orders',
      render: (row) => row._count?.orders || 0,
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (row) => (
        <div className="vt-flex-align-gap">
          {row.banned ? (
            <span className="vt-chip danger">BANNED</span>
          ) : row.suspended ? (
            <span className="vt-chip warning">SUSPENDED</span>
          ) : (
            <span className="vt-chip success">ACTIVE</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <AdminLayout title={`Customer Directory (${total})`} onRefresh={loadData}>
      <div className="vt-customers-page">
        <div className="vt-filter-bar">
          <div className="vt-filter-group">
            <label>Role Filter:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="vt-select-md"
            >
              <option value="">All Accounts</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="vt-skeleton-table" />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search customer name, email..."
            pageSize={15}
            actions={(row) => (
              <div className="vt-flex-align-gap">
                <button
                  className="vt-btn-icon"
                  title="View Detail"
                  onClick={() => router.push(`/admin/customers/${row.id}`)}
                >
                  <FiEye size={15} />
                </button>
                <button
                  className={`vt-btn-icon ${row.suspended ? 'active' : ''}`}
                  title={row.suspended ? 'Unsuspend Account' : 'Suspend Account'}
                  disabled={updatingId === row.id}
                  onClick={() => handleToggleSuspend(row.id, row.suspended)}
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
