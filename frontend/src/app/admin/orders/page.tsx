'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getAdminOrders, adminUpdateOrder, getTailors, exportOrdersCsvUrl } from '@/lib/api';
import { FiEye, FiDownload, FiCheck, FiX, FiRefreshCw, FiScissors } from 'react-icons/fi';

const STATUS_OPTIONS = ['PAID', 'ASSIGNED', 'PRODUCTION', 'QC', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export function OrderManagementPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [tailors, setTailors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [oList, tList] = await Promise.all([
        getAdminOrders(),
        getTailors(),
      ]);
      setOrders(oList || []);
      setTailors(tList || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrder({ orderId, status });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignTailor = async (orderId: string, tailorId: string) => {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrder({ orderId, tailorId, status: tailorId ? 'ASSIGNED' : undefined });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Tailor assignment failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (row) => (
        <span
          className="vt-code-link"
          onClick={() => router.push(`/admin/orders/${row.id}`)}
        >
          #{row.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="vt-font-medium">{row.customer?.name || 'Guest'}</div>
          <div className="vt-text-sub">{row.customer?.email}</div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Garment / Spec',
      render: (row) => (
        <div className="vt-items-summary">
          {row.items?.map((it: any) => (
            <div key={it.id} className="vt-item-pill">
              {it.name} ({it.category})
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Stage Status',
      render: (row) => (
        <div className="vt-flex-align-gap">
          <StatusBadge status={row.status} />
          <select
            className="vt-select-sm"
            value={row.status}
            disabled={updatingId === row.id}
            onChange={(e) => handleUpdateStatus(row.id, e.target.value)}
          >
            {STATUS_OPTIONS.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'tailor',
      header: 'Assigned Tailor',
      render: (row) => (
        <select
          className="vt-select-sm"
          value={row.tailorId || ''}
          disabled={updatingId === row.id}
          onChange={(e) => handleAssignTailor(row.id, e.target.value)}
        >
          <option value="">Unassigned</option>
          {tailors.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'totalPrice',
      header: 'Total Price',
      render: (row) => (
        <div className="vt-amount">
          ₹{Number(row.totalPrice).toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <AdminLayout title={`Master Order Control (${orders.length})`} onRefresh={loadData}>
      <div className="vt-orders-page">
        {/* Controls Toolbar */}
        <div className="vt-filter-bar">
          <div className="vt-filter-group">
            <label>Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="vt-select-md"
            >
              <option value="">All Statuses ({orders.length})</option>
              {STATUS_OPTIONS.map(st => (
                <option key={st} value={st}>
                  {st} ({orders.filter(o => o.status === st).length})
                </option>
              ))}
            </select>
          </div>

          <div className="vt-action-group">
            <a
              href={exportOrdersCsvUrl('month')}
              target="_blank"
              rel="noopener noreferrer"
              className="vt-btn vt-btn-secondary"
            >
              <FiDownload size={14} /> Export CSV
            </a>
          </div>
        </div>

        {/* Master Table */}
        {loading ? (
          <div className="vt-skeleton-table" />
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrders}
            searchPlaceholder="Search order ID, customer name, email..."
            pageSize={15}
            selectable
            selectedIds={selectedIds}
            onSelectRow={(id, sel) => {
              if (sel) setSelectedIds(prev => [...prev, id]);
              else setSelectedIds(prev => prev.filter(i => i !== id));
            }}
            onSelectAll={(sel) => {
              if (sel) setSelectedIds(filteredOrders.map(o => o.id));
              else setSelectedIds([]);
            }}
            actions={(row) => (
              <button
                className="vt-btn-icon"
                title="View Full Spec Sheet"
                onClick={() => router.push(`/admin/orders/${row.id}`)}
              >
                <FiEye size={15} />
              </button>
            )}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default OrderManagementPage;
