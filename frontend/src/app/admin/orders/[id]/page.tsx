'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { OrderTimeline } from '@/components/admin/OrderTimeline';
import { getOrderById, adminUpdateOrder, getTailors } from '@/lib/api';
import { FiArrowLeft, FiScissors, FiUser, FiPackage, FiFileText, FiClock } from 'react-icons/fi';

const STATUS_OPTS = ['PAID', 'ASSIGNED', 'PRODUCTION', 'QC', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [tailors, setTailors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [o, tList] = await Promise.all([
        getOrderById(orderId),
        getTailors(),
      ]);
      setOrder(o);
      setTailors(tList || []);
    } catch (err: any) {
      alert(err.message || 'Failed to load order detail');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = async (status?: string, tailorId?: string) => {
    setUpdating(true);
    try {
      await adminUpdateOrder({ orderId, status, tailorId });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order Detail Spec Sheet">
        <div className="vt-skeleton-card" style={{ height: '400px' }} />
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Not Found">
        <div className="vt-card">Order #{orderId} could not be located.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Order Spec Sheet #${order.id.slice(0, 8).toUpperCase()}`} onRefresh={loadData}>
      <div className="vt-order-detail-page">
        {/* Back Link & Header */}
        <div className="vt-detail-top-nav">
          <button className="vt-back-btn" onClick={() => router.push('/admin/orders')}>
            <FiArrowLeft size={16} /> Back to Orders Control
          </button>
          <div className="vt-detail-top-actions">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Two-Column Grid: Left Spec Sheet, Right Timeline & Control */}
        <div className="vt-grid-2-1 gap-lg">
          {/* Left Main Column: Customer, Items, Spec Sheet */}
          <div className="vt-detail-main">
            {/* Customer Info Card */}
            <div className="vt-card mb-md">
              <div className="vt-card-header">
                <h3><FiUser size={16} /> Customer Information</h3>
              </div>
              <div className="vt-info-grid">
                <div>
                  <label>Customer Name:</label>
                  <span>{order.customer?.name}</span>
                </div>
                <div>
                  <label>Email Address:</label>
                  <span>{order.customer?.email}</span>
                </div>
                <div>
                  <label>Order Date:</label>
                  <span>{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <label>Payment Reference:</label>
                  <span>{order.paymentId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Garments Spec Sheet Card */}
            <div className="vt-card mb-md">
              <div className="vt-card-header">
                <h3><FiPackage size={16} /> Garment Spec Sheet ({order.items?.length || 0} items)</h3>
              </div>
              {order.items?.map((item: any, idx: number) => (
                <div key={item.id} className="vt-spec-item">
                  <div className="vt-spec-item-header">
                    <h4>{idx + 1}. {item.name}</h4>
                    <span className="vt-spec-price">₹{item.price?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="vt-spec-item-meta">
                    <span className="vt-chip">{item.category}</span>
                    <span className="vt-chip">{item.isCustom ? 'CUSTOM BESPOKE' : 'READY-MADE'}</span>
                    <span>Quantity: {item.quantity}</span>
                  </div>

                  {item.customSpec && (
                    <div className="vt-custom-spec-box">
                      <div className="vt-spec-box-title"><FiFileText size={14} /> Customization Parameters</div>
                      <pre className="vt-spec-json">
                        {typeof item.customSpec === 'string'
                          ? item.customSpec
                          : JSON.stringify(item.customSpec, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}

              <div className="vt-spec-total-row">
                <span>Total Amount Paid:</span>
                <span className="vt-total-val">₹{Number(order.totalPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Right Control Sidebar Column: Tailor Assignment & Order Timeline */}
          <div className="vt-detail-side">
            {/* Quick Controls */}
            <div className="vt-card mb-md">
              <div className="vt-card-header">
                <h3><FiScissors size={16} /> Admin Operations</h3>
              </div>

              <div className="vt-form-group mb-sm">
                <label>Update Production Stage:</label>
                <select
                  className="vt-select-md w-full"
                  value={order.status}
                  disabled={updating}
                  onChange={(e) => handleUpdate(e.target.value, undefined)}
                >
                  {STATUS_OPTS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="vt-form-group">
                <label>Reassign Tailor:</label>
                <select
                  className="vt-select-md w-full"
                  value={order.tailorId || ''}
                  disabled={updating}
                  onChange={(e) => handleUpdate(undefined, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {tailors.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timeline */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3><FiClock size={16} /> Order Stage Timeline</h3>
              </div>
              <OrderTimeline timeline={order.timeline || []} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
