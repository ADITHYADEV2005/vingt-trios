'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getTailorPortalOrders, respondToTailorOrder, updateTailorOrderStage } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  FiSearch, FiFilter, FiCheck, FiX, FiScissors,
  FiArrowRight, FiClock, FiCamera, FiAlertCircle
} from 'react-icons/fi';

const STAGES = ['ASSIGNED', 'CUTTING', 'STITCHING', 'QC', 'DISPATCH', 'SHIPPED', 'DELIVERED'];

export default function TailorOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTailorPortalOrders({
        status: statusFilter || undefined,
        search: search || undefined,
        take: 100,
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load tailor orders:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRespond = async (orderId: string, accept: boolean) => {
    setUpdatingId(orderId);
    try {
      await respondToTailorOrder(orderId, { accept });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickStage = async (orderId: string, stage: string) => {
    setUpdatingId(orderId);
    try {
      await updateTailorOrderStage(orderId, { stage });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Stage update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="vt-tailor-orders-page">
      {/* Search & Stage Filters */}
      <div className="vt-filter-bar mb-md">
        <div className="vt-table-search" style={{ width: '100%', maxWidth: '360px' }}>
          <FiSearch size={14} className="vt-search-icon" />
          <input
            type="text"
            placeholder="Search order ID, customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="vt-select-md"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Production Stages ({orders.length})</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stage Filter Chips */}
      <div className="vt-stage-chips mb-lg">
        <button
          className={`vt-chip-btn ${statusFilter === '' ? 'active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          All Stages ({orders.length})
        </button>
        {STAGES.map(s => {
          const count = orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              className={`vt-chip-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="vt-grid-2 gap-md">
          {[1, 2, 3, 4].map(i => <div key={i} className="vt-skeleton-card" style={{ height: '200px' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="vt-card vt-feed-empty">
          No orders matching criteria.
        </div>
      ) : (
        <div className="vt-grid-2 gap-md">
          {orders.map((o: any) => (
            <div key={o.id} className="vt-card vt-tailor-job-card">
              <div className="vt-job-card-top">
                <div>
                  <span className="vt-code-link" onClick={() => router.push(`/tailor/orders/${o.id}`)}>
                    #{o.id.slice(0, 8).toUpperCase()}
                  </span>
                  <div className="vt-text-sub mt-xs">Customer: <strong>{o.customer?.name}</strong></div>
                </div>
                <StatusBadge status={o.status} />
              </div>

              {/* Items */}
              <div className="vt-job-items-box my-sm">
                {o.items?.map((it: any) => (
                  <div key={it.id} className="vt-job-item">
                    <span className="vt-font-medium">{it.name}</span> ({it.category})
                    {it.isCustom && <span className="vt-chip warning ml-xs">CUSTOM</span>}
                  </div>
                ))}
              </div>

              {/* Flag Warning if measurement flagged */}
              {o.measurementFlags?.some((f: any) => f.status === 'PENDING') && (
                <div className="vt-alert-banner danger mb-sm p-xs" style={{ fontSize: '0.75rem' }}>
                  <FiAlertCircle size={14} /> Measurement issue flagged (Pending Review)
                </div>
              )}

              {/* Controls */}
              <div className="vt-job-card-footer">
                {!o.acceptedByTailor && o.status === 'ASSIGNED' ? (
                  <div className="vt-flex-align-gap w-full">
                    <button
                      className="vt-btn vt-btn-success vt-btn-sm flex-1"
                      disabled={updatingId === o.id}
                      onClick={() => handleRespond(o.id, true)}
                    >
                      <FiCheck size={14} /> Accept
                    </button>
                    <button
                      className="vt-btn vt-btn-danger vt-btn-sm flex-1"
                      disabled={updatingId === o.id}
                      onClick={() => handleRespond(o.id, false)}
                    >
                      <FiX size={14} /> Decline
                    </button>
                  </div>
                ) : (
                  <div className="vt-flex-align-gap w-full">
                    <select
                      className="vt-select-sm flex-1"
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleQuickStage(o.id, e.target.value)}
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      className="vt-btn vt-btn-gold vt-btn-sm"
                      onClick={() => router.push(`/tailor/orders/${o.id}`)}
                    >
                      Open Spec <FiArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
