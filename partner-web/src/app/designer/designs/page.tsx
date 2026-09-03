'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getDesignerPortalDesigns } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  FiSearch, FiPlusCircle, FiFeather, FiLayers,
  FiEye, FiEdit3, FiLock, FiUnlock
} from 'react-icons/fi';

const STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

export default function DesignerPortfolioGalleryPage() {
  const router = useRouter();
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDesignerPortalDesigns({
        status: statusFilter || undefined,
        search: search || undefined,
        take: 100,
      });
      setDesigns(res.designs || []);
    } catch (err) {
      console.error('Failed to load portfolio designs:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="vt-designer-gallery-page">
      {/* Controls Bar */}
      <div className="vt-filter-bar mb-md">
        <div className="vt-table-search" style={{ width: '100%', maxWidth: '360px' }}>
          <FiSearch size={14} className="vt-search-icon" />
          <input
            type="text"
            placeholder="Search design title, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button className="vt-btn vt-btn-gold" onClick={() => router.push('/designer/designs/new')}>
          <FiPlusCircle size={16} /> Studio Upload
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="vt-stage-chips mb-lg">
        <button
          className={`vt-chip-btn ${statusFilter === '' ? 'active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          All Portfolio ({designs.length})
        </button>
        {STATUSES.map(s => {
          const count = designs.filter(d => d.status === s).length;
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

      {/* Visual Design Cards Grid */}
      {loading ? (
        <div className="vt-grid-3 gap-md">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="vt-skeleton-card" style={{ height: '280px' }} />)}
        </div>
      ) : designs.length === 0 ? (
        <div className="vt-card vt-feed-empty">
          No designs found in this view. Click "Studio Upload" to submit your first original pattern!
        </div>
      ) : (
        <div className="vt-grid-3 gap-md">
          {designs.map((d: any) => (
            <div key={d.id} className="vt-card vt-design-portfolio-card">
              {/* Image Preview Box */}
              <div className="vt-design-img-wrapper" onClick={() => router.push(`/designer/designs/${d.id}`)}>
                <img
                  src={d.mockupImageUrl || '/image/BLAZER.jpg'}
                  alt={d.title}
                  onError={(e: any) => { e.target.src = '/image/shirt.jpg'; }}
                />
                <div className="vt-design-badge-overlay">
                  <StatusBadge status={d.status} />
                </div>
              </div>

              {/* Card Meta */}
              <div className="vt-design-card-body mt-sm">
                <div className="vt-flex-align-gap justify-between mb-xs">
                  <h4 className="vt-font-medium vt-gold-text" onClick={() => router.push(`/designer/designs/${d.id}`)}>
                    {d.title}
                  </h4>
                  <span className="vt-chip">v{d.version}</span>
                </div>

                <div className="vt-text-sub font-xs mb-sm">
                  Category: <strong>{d.category}</strong> · Licensing: <strong>{d.licensingTier}</strong>
                </div>

                {d.tags && (
                  <div className="vt-tags-row mb-sm">
                    {d.tags.split(',').map((t: string) => (
                      <span key={t} className="vt-chip font-xs">#{t.trim()}</span>
                    ))}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="vt-design-card-footer pt-xs">
                  <div className="vt-text-sub font-xs">
                    Orders: <strong>{d.ordersGenerated || 0}</strong>
                  </div>
                  <button
                    className="vt-btn vt-btn-secondary vt-btn-sm"
                    onClick={() => router.push(`/designer/designs/${d.id}`)}
                  >
                    <FiEdit3 size={13} /> Studio Control
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
