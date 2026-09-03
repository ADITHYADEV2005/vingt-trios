'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getCustomerOrders } from '@/lib/api';
import { FiPackage, FiArrowRight, FiCalendar, FiShoppingCart } from 'react-icons/fi';

const STATUS_CLASS: Record<string, string> = {
  PAID: 's-paid', ASSIGNED: 's-assigned', PRODUCTION: 's-production',
  QC: 's-qc', SHIPPED: 's-shipped', DELIVERED: 's-delivered',
};

export default function OrdersPage() {
  const { isLoggedIn } = useApp();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return; }
    getCustomerOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <FiPackage size={22} style={{ color: 'var(--gold)' }} />
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', color: 'var(--text)' }}>
          My Orders
        </h1>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--r-md)', marginBottom: 14 }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty" style={{ padding: '80px 20px' }}>
          <div className="empty-icon"><FiShoppingCart size={52} /></div>
          <h2 className="empty-title">No orders yet</h2>
          <p className="empty-desc">You haven't placed any custom or ready-made garment orders yet.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/categories/shirt" className="btn btn-primary">Browse Shirts <FiArrowRight /></Link>
            <Link href="/customize/shirt"  className="btn btn-outline">Customize <FiArrowRight /></Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((order: any) => {
            const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            });
            return (
              <div key={order.id} className="dash-order-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
                <div>
                  {/* ID + status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.92rem' }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`status-badge ${STATUS_CLASS[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Date + item count */}
                  <div style={{ display: 'flex', gap: 16, fontSize: '.8rem', color: 'var(--text-3)', marginBottom: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiCalendar size={11} /> {date}
                    </span>
                    <span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Item chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {order.items?.map((item: any) => (
                      <span key={item.id} style={{ fontSize: '.74rem', padding: '3px 10px', background: 'var(--bg-el)', border: '1px solid var(--border)', borderRadius: 50, color: 'var(--text-2)' }}>
                        {item.name}{item.isCustom ? ' (Custom)' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price + Track button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)' }}>
                    ₹{Number(order.totalPrice).toLocaleString('en-IN')}
                  </div>
                  <Link href={`/orders/${order.id}`} className="btn btn-gold-outline btn-sm">
                    Track Order <FiArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
