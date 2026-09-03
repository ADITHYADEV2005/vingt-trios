'use client';
import { useState, useEffect, useCallback } from 'react';
import { getTailorPortalReviews, replyToTailorReview } from '@/lib/api';
import { FiStar, FiMessageCircle, FiCheck } from 'react-icons/fi';

export default function TailorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTailorPortalReviews();
      setReviews(res || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await replyToTailorReview(reviewId, { reply: replyText });
      setReplyingId(null);
      setReplyText('');
      await loadData();
      alert('Reply published successfully!');
    } catch (err: any) {
      alert(err.message || 'Reply failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vt-tailor-reviews-page">
      <div className="vt-card mb-md">
        <div className="vt-card-header">
          <h3>Customer Ratings & Written Reviews ({reviews.length})</h3>
        </div>
        <p className="vt-text-sub">
          Feedback left by clients on completed bespoke orders. You can post a public response to any review.
        </p>
      </div>

      {loading ? (
        <div className="vt-skeleton-card" style={{ height: '250px' }} />
      ) : reviews.length === 0 ? (
        <div className="vt-card vt-feed-empty">No reviews submitted yet.</div>
      ) : (
        <div className="vt-reviews-list">
          {reviews.map((r: any) => (
            <div key={r.id} className="vt-card mb-sm">
              <div className="vt-flex-align-gap justify-between mb-xs">
                <span className="vt-gold-star font-lg">★ {r.rating.toFixed(1)}</span>
                <span className="vt-text-sub">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
              </div>

              <div className="vt-font-medium mb-xs">"{r.comment || 'Great tailoring quality!'}"</div>

              {/* Tailor Reply */}
              {r.reply ? (
                <div className="vt-tailor-reply-box mt-sm">
                  <div className="vt-font-medium vt-gold-text">Your Workshop Response:</div>
                  <div className="vt-text-sub">{r.reply}</div>
                </div>
              ) : replyingId === r.id ? (
                <div className="vt-reply-form mt-sm">
                  <textarea
                    className="vt-textarea-md mb-xs"
                    rows={2}
                    placeholder="Write a professional reply to this customer review..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <div className="vt-flex-align-gap">
                    <button
                      className="vt-btn vt-btn-gold vt-btn-sm"
                      disabled={submitting}
                      onClick={() => handleReplySubmit(r.id)}
                    >
                      <FiCheck size={14} /> Submit Reply
                    </button>
                    <button
                      className="vt-btn vt-btn-secondary vt-btn-sm"
                      onClick={() => setReplyingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="vt-btn vt-btn-secondary vt-btn-sm mt-sm"
                  onClick={() => { setReplyingId(r.id); setReplyText(''); }}
                >
                  <FiMessageCircle size={14} /> Reply to Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
