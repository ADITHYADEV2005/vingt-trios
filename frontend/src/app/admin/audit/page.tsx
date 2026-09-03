'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { getAuditLogs } from '@/lib/api';
import { FiShield, FiLock, FiClock, FiUser } from 'react-icons/fi';

export default function AuditLogViewerPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs();
      setLogs(res || []);
    } catch (err) {
      console.error('Failed to load audit log:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns: Column<any>[] = [
    {
      key: 'action',
      header: 'Audit Action',
      render: (r) => <strong className="vt-gold-text">{r.action}</strong>,
    },
    {
      key: 'actorName',
      header: 'Actor / Administrator',
      render: (r) => (
        <div>
          <div className="vt-font-medium">{r.actorName}</div>
          <div className="vt-text-sub">{r.actor?.email || 'System'}</div>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Target Resource',
      render: (r) => <span className="vt-chip">{r.target}</span>,
    },
    {
      key: 'payload',
      header: 'Payload Details',
      render: (r) => (
        <pre className="vt-code-inline" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {typeof r.payload === 'string' ? r.payload : JSON.stringify(r.payload)}
        </pre>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (r) => new Date(r.createdAt).toLocaleString('en-IN'),
    },
  ];

  return (
    <AdminLayout title="Immutable Security Audit Trail" onRefresh={loadData}>
      <div className="vt-audit-page">
        <div className="vt-alert-banner mb-md">
          <div className="vt-alert-title">
            <FiLock size={18} />
            <span>Immutable Ledger Active — Every admin action is cryptographically recorded</span>
          </div>
        </div>

        {loading ? (
          <div className="vt-skeleton-table" />
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            searchPlaceholder="Search audit actions, actors, targets..."
            pageSize={20}
          />
        )}
      </div>
    </AdminLayout>
  );
}
