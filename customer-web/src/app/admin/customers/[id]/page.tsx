'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getAdminUserDetail, suspendUser, banUser } from '@/lib/api';
import { FiArrowLeft, FiUser, FiPackage, FiSliders, FiHelpCircle, FiSlash } from 'react-icons/fi';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUserDetail(userId);
      setUserDetail(res);
    } catch (err: any) {
      alert(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSuspend = async () => {
    if (!userDetail) return;
    setUpdating(true);
    try {
      await suspendUser(userId, !userDetail.suspended);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Suspend failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Customer Detail View">
        <div className="vt-skeleton-card" style={{ height: '400px' }} />
      </AdminLayout>
    );
  }

  if (!userDetail) {
    return (
      <AdminLayout title="Customer Not Found">
        <div className="vt-card">User ID #{userId} not found.</div>
      </AdminLayout>
    );
  }

  const measurements = userDetail.measurements?.[0];

  return (
    <AdminLayout title={`Customer File: ${userDetail.name}`} onRefresh={loadData}>
      <div className="vt-customer-detail-page">
        <div className="vt-detail-top-nav">
          <button className="vt-back-btn" onClick={() => router.push('/admin/customers')}>
            <FiArrowLeft size={16} /> Back to Customer Directory
          </button>
          <div className="vt-flex-align-gap">
            <button
              className={`vt-btn ${userDetail.suspended ? 'vt-btn-success' : 'vt-btn-danger'}`}
              onClick={handleToggleSuspend}
              disabled={updating}
            >
              <FiSlash size={14} /> {userDetail.suspended ? 'Unsuspend Account' : 'Suspend Account'}
            </button>
          </div>
        </div>

        <div className="vt-grid-2-1 gap-lg">
          <div className="vt-detail-main">
            {/* Account Info */}
            <div className="vt-card mb-md">
              <div className="vt-card-header">
                <h3><FiUser size={16} /> Profile Summary</h3>
              </div>
              <div className="vt-info-grid">
                <div><label>Full Name:</label><span>{userDetail.name}</span></div>
                <div><label>Email Address:</label><span>{userDetail.email}</span></div>
                <div><label>System Role:</label><span className="vt-chip">{userDetail.role}</span></div>
                <div><label>Member Since:</label><span>{new Date(userDetail.createdAt).toLocaleDateString('en-IN')}</span></div>
              </div>
            </div>

            {/* Saved Measurements Spec Sheet */}
            <div className="vt-card mb-md">
              <div className="vt-card-header">
                <h3><FiSliders size={16} /> Saved Body Measurements</h3>
              </div>
              {!measurements ? (
                <div className="vt-feed-empty">No measurements saved by customer yet.</div>
              ) : (
                <div className="vt-info-grid">
                  <div><label>Chest:</label><span>{measurements.chest || 'N/A'} in</span></div>
                  <div><label>Waist:</label><span>{measurements.waist || 'N/A'} in</span></div>
                  <div><label>Shoulder:</label><span>{measurements.shoulder || 'N/A'} in</span></div>
                  <div><label>Sleeve:</label><span>{measurements.sleeve || 'N/A'} in</span></div>
                  <div><label>Inseam:</label><span>{measurements.inseam || 'N/A'} in</span></div>
                  <div><label>Neck:</label><span>{measurements.neck || 'N/A'} in</span></div>
                  <div><label>Hip:</label><span>{measurements.hip || 'N/A'} in</span></div>
                  <div><label>Fit Preference:</label><span className="vt-chip">{measurements.fitPreference}</span></div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3><FiPackage size={16} /> Order History ({userDetail.orders?.length || 0})</h3>
              </div>
              {userDetail.orders?.length === 0 ? (
                <div className="vt-feed-empty">No orders placed yet.</div>
              ) : (
                <div className="vt-mini-list">
                  {userDetail.orders?.map((o: any) => (
                    <div key={o.id} className="vt-mini-item" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                      <div>
                        <span className="vt-code-link">#{o.id.slice(0, 8).toUpperCase()}</span>
                        <div className="vt-text-sub">{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      <StatusBadge status={o.status} />
                      <div className="vt-amount">₹{Number(o.totalPrice).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Support Tickets */}
          <div className="vt-detail-side">
            <div className="vt-card">
              <div className="vt-card-header">
                <h3><FiHelpCircle size={16} /> Support Tickets</h3>
              </div>
              {userDetail.tickets?.length === 0 ? (
                <div className="vt-feed-empty">No tickets filed by customer.</div>
              ) : (
                <div className="vt-mini-list">
                  {userDetail.tickets?.map((t: any) => (
                    <div key={t.id} className="vt-mini-item" onClick={() => router.push(`/admin/support`)}>
                      <div>
                        <div className="vt-font-medium">{t.subject}</div>
                        <div className="vt-text-sub">{t.priority}</div>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
