'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getTailorProfileAdmin, triggerTailorPayout, updateCommission } from '@/lib/api';
import { FiArrowLeft, FiScissors, FiDollarSign, FiStar, FiClock, FiCheckCircle, FiPackage } from 'react-icons/fi';

export default function TailorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tailorId = resolvedParams.id;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTailorProfileAdmin(tailorId);
      setData(res);
    } catch (err: any) {
      alert(err.message || 'Failed to load tailor profile');
    } finally {
      setLoading(false);
    }
  }, [tailorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) return alert('Enter a valid payout amount');
    setPayoutLoading(true);
    try {
      await triggerTailorPayout(tailorId, parseFloat(payoutAmount), payoutNotes);
      setPayoutAmount('');
      setPayoutNotes('');
      await loadData();
      alert('Payout triggered via Razorpay successfully!');
    } catch (err: any) {
      alert(err.message || 'Payout failed');
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Tailor Profile & Payout Ledger">
        <div className="vt-skeleton-card" style={{ height: '400px' }} />
      </AdminLayout>
    );
  }

  if (!data || !data.profile) {
    return (
      <AdminLayout title="Tailor Not Found">
        <div className="vt-card">Tailor ID #{tailorId} not found.</div>
      </AdminLayout>
    );
  }

  const profile = data.profile;
  const orders = data.orders || [];
  const payouts = profile.payouts || [];

  return (
    <AdminLayout title={`Tailor Profile: ${profile.name}`} onRefresh={loadData}>
      <div className="vt-tailor-profile-page">
        <div className="vt-detail-top-nav">
          <button className="vt-back-btn" onClick={() => router.push('/admin/tailors')}>
            <FiArrowLeft size={16} /> Back to Tailors List
          </button>
        </div>

        {/* Performance Summary Banner */}
        <div className="vt-grid-4 gap-md mb-lg">
          <div className="vt-kpi-card">
            <div className="vt-kpi-title">Rating</div>
            <div className="vt-kpi-value gold">★ {profile.rating.toFixed(1)}</div>
            <div className="vt-kpi-sub">Customer Feedback</div>
          </div>

          <div className="vt-kpi-card">
            <div className="vt-kpi-title">Turnaround Time</div>
            <div className="vt-kpi-value">{profile.turnaroundDays} Days</div>
            <div className="vt-kpi-sub">Average completion</div>
          </div>

          <div className="vt-kpi-card">
            <div className="vt-kpi-title">Commission Rate</div>
            <div className="vt-kpi-value">{profile.commissionRate}%</div>
            <div className="vt-kpi-sub">Tailor Share</div>
          </div>

          <div className="vt-kpi-card">
            <div className="vt-kpi-title">Defect / Return Rate</div>
            <div className="vt-kpi-value">{profile.defectRate || 0}%</div>
            <div className="vt-kpi-sub">QC Failures</div>
          </div>
        </div>

        <div className="vt-grid-2-1 gap-lg">
          {/* Main Column: Active Orders + Payout History */}
          <div className="vt-detail-main">
            {/* Payout History Ledger */}
            <div className="vt-card mb-md">
              <div className="vt-card-header">
                <h3><FiDollarSign size={16} /> Razorpay Payout Ledger ({payouts.length})</h3>
              </div>
              {payouts.length === 0 ? (
                <div className="vt-feed-empty">No payouts recorded yet.</div>
              ) : (
                <div className="vt-mini-list">
                  {payouts.map((p: any) => (
                    <div key={p.id} className="vt-mini-item">
                      <div>
                        <div className="vt-font-medium">Transfer #{p.razorpayTransferId || p.id.slice(0, 8)}</div>
                        <div className="vt-text-sub">{p.notes || 'Commission Payout'}</div>
                      </div>
                      <StatusBadge status={p.status} />
                      <div className="vt-amount">₹{p.amount.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned Orders */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3><FiPackage size={16} /> Recent Assigned Orders ({orders.length})</h3>
              </div>
              {orders.length === 0 ? (
                <div className="vt-feed-empty">No assigned orders.</div>
              ) : (
                <div className="vt-mini-list">
                  {orders.map((o: any) => (
                    <div key={o.id} className="vt-mini-item" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                      <div>
                        <span className="vt-code-link">#{o.id.slice(0, 8).toUpperCase()}</span>
                        <div className="vt-text-sub">Client: {o.customer?.name}</div>
                      </div>
                      <StatusBadge status={o.status} />
                      <div className="vt-amount">₹{o.totalPrice.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Trigger Payout Form */}
          <div className="vt-detail-side">
            <div className="vt-card">
              <div className="vt-card-header">
                <h3><FiDollarSign size={16} /> Trigger Manual Payout</h3>
              </div>

              <form onSubmit={handlePayoutSubmit} className="vt-form">
                <div className="vt-form-group mb-sm">
                  <label>Payout Amount (₹):</label>
                  <input
                    type="number"
                    className="vt-input-md"
                    placeholder="e.g. 5000"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="vt-form-group mb-md">
                  <label>Notes / Ledger Reason:</label>
                  <input
                    type="text"
                    className="vt-input-md"
                    placeholder="Weekly settlement"
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="vt-btn vt-btn-gold w-full"
                  disabled={payoutLoading}
                >
                  {payoutLoading ? 'Processing Razorpay Payout...' : 'Transfer Payout via Razorpay'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
