'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { getDesignerDesignDetail, updateDesignerDesign, addDesignComment } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  FiArrowLeft, FiFeather, FiLayers, FiMessageSquare,
  FiClock, FiTrendingUp, FiCheck, FiSend, FiPlus
} from 'react-icons/fi';

export default function DesignDetailStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const designId = resolvedParams.id;
  const router = useRouter();

  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // New Version State
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newMockupUrl, setNewMockupUrl] = useState('');
  const [changelogNote, setChangelogNote] = useState('');

  // Comment State
  const [commentText, setCommentText] = useState('');
  const [commentSending, setCommentSending] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDesignerDesignDetail(designId);
      setDesign(res);
      setNewMockupUrl(res.mockupImageUrl);
    } catch (err: any) {
      alert(err.message || 'Failed to load design detail');
    } finally {
      setLoading(false);
    }
  }, [designId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNewVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateDesignerDesign(designId, {
        mockupImageUrl: newMockupUrl,
        changelogNote,
        isSubmit: true,
      });
      setShowVersionModal(false);
      setChangelogNote('');
      await loadData();
      alert('New version uploaded and submitted for review!');
    } catch (err: any) {
      alert(err.message || 'Version update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentSending(true);
    try {
      await addDesignComment(designId, commentText);
      setCommentText('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Comment send failed');
    } finally {
      setCommentSending(false);
    }
  };

  if (loading) {
    return <div className="vt-skeleton-card" style={{ height: '400px' }} />;
  }

  if (!design) return <div className="vt-card">Design #{designId} not found.</div>;

  return (
    <div className="vt-designer-detail-page">
      <div className="vt-detail-top-nav mb-md">
        <button className="vt-back-btn" onClick={() => router.push('/designer/designs')}>
          <FiArrowLeft size={16} /> Back to Portfolio
        </button>
        <div className="vt-flex-align-gap">
          <StatusBadge status={design.status} />
          <button className="vt-btn vt-btn-gold vt-btn-sm" onClick={() => setShowVersionModal(true)}>
            <FiPlus size={14} /> Upload Version {design.version + 1}
          </button>
        </div>
      </div>

      <div className="vt-grid-2-1 gap-lg">
        {/* Left Column: Mockup Preview, Spec, Version History */}
        <div className="vt-detail-main">
          {/* Main Card */}
          <div className="vt-card mb-md">
            <div className="vt-grid-2 gap-md">
              <div className="vt-studio-preview-box">
                <img src={design.mockupImageUrl} alt={design.title} />
              </div>

              <div>
                <h3 className="vt-gold-text mb-xs">{design.title} (v{design.version})</h3>
                <div className="vt-text-sub mb-sm">{design.description || 'No description provided.'}</div>

                <div className="vt-info-grid mb-sm">
                  <div><label>Category:</label><span>{design.category}</span></div>
                  <div><label>Licensing:</label><span className="vt-chip warning">{design.licensingTier}</span></div>
                  <div><label>Compatible Fabrics:</label><span>{design.compatibleFabrics}</span></div>
                  <div><label>Tags:</label><span>{design.tags || 'General'}</span></div>
                </div>

                {design.adminFeedback && (
                  <div className="vt-alert-banner danger mt-sm p-xs" style={{ fontSize: '0.8rem' }}>
                    <strong>Admin Feedback:</strong> {design.adminFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Version History Tree */}
          <div className="vt-card mb-md">
            <div className="vt-card-header">
              <h3><FiLayers size={16} /> Version Control Tree ({design.versions?.length || 0})</h3>
            </div>

            <div className="vt-mini-list">
              {design.versions?.map((v: any) => (
                <div key={v.id} className="vt-mini-item">
                  <div>
                    <strong className="vt-gold-text">Version {v.version}</strong>
                    <div className="vt-text-sub">{v.changelogNote || 'Revision commit'}</div>
                  </div>
                  <div className="vt-text-sub font-xs">{new Date(v.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="vt-card">
            <div className="vt-card-header">
              <h3><FiTrendingUp size={16} /> Performance & Conversion Analytics</h3>
            </div>

            <div className="vt-grid-4 gap-sm text-center">
              <div className="vt-kpi-card p-xs">
                <div className="vt-kpi-title">Views</div>
                <div className="vt-kpi-value">{design.viewsCount || 0}</div>
              </div>
              <div className="vt-kpi-card p-xs">
                <div className="vt-kpi-title">Favorites</div>
                <div className="vt-kpi-value gold">{design.favoritesCount || 0}</div>
              </div>
              <div className="vt-kpi-card p-xs">
                <div className="vt-kpi-title">Orders Driven</div>
                <div className="vt-kpi-value">{design.ordersGenerated || 0}</div>
              </div>
              <div className="vt-kpi-card p-xs">
                <div className="vt-kpi-title">Revenue Generated</div>
                <div className="vt-kpi-value gold">₹{Number(design.revenueGenerated || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feasibility Comment Thread */}
        <div className="vt-detail-side">
          <div className="vt-card">
            <div className="vt-card-header">
              <h3><FiMessageSquare size={16} /> Feasibility Thread (Admin & Tailors)</h3>
            </div>

            <div className="vt-chat-box">
              <div className="vt-chat-messages">
                {design.comments?.length === 0 ? (
                  <div className="vt-feed-empty">No comments on feasibility yet.</div>
                ) : (
                  design.comments?.map((c: any) => (
                    <div key={c.id} className={`vt-chat-msg ${c.senderRole === 'DESIGNER' ? 'tailor' : 'customer'}`}>
                      <div className="vt-chat-sender">{c.sender?.name} ({c.senderRole})</div>
                      <div className="vt-chat-bubble">{c.comment}</div>
                      <div className="vt-chat-time">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendComment} className="vt-chat-input-row mt-sm">
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="Post technical comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button type="submit" className="vt-btn vt-btn-gold" disabled={commentSending}>
                  <FiSend size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* New Version Upload Modal */}
      {showVersionModal && (
        <div className="vt-modal-backdrop">
          <div className="vt-modal-card">
            <div className="vt-modal-header">
              <h3>Upload Version {design.version + 1} Revision</h3>
              <button className="vt-close-btn" onClick={() => setShowVersionModal(false)}>✕</button>
            </div>

            <form onSubmit={handleNewVersionSubmit} className="vt-form">
              <div className="vt-form-group mb-sm">
                <label>Revised Mockup Image URL:</label>
                <input
                  type="text"
                  className="vt-input-md"
                  value={newMockupUrl}
                  onChange={e => setNewMockupUrl(e.target.value)}
                  required
                />
              </div>

              <div className="vt-form-group mb-md">
                <label>Changelog / Revision Note:</label>
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="e.g. Adjusted embroidery density for machine stitching"
                  value={changelogNote}
                  onChange={e => setChangelogNote(e.target.value)}
                  required
                />
              </div>

              <div className="vt-modal-actions">
                <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowVersionModal(false)}>Cancel</button>
                <button type="submit" className="vt-btn vt-btn-gold" disabled={updating}>
                  {updating ? 'Submitting...' : 'Upload & Resubmit Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
