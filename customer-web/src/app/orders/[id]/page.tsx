'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getOrderById, respondToProposal } from '@/lib/api';
import { FiCheck, FiPackage, FiTruck, FiStar } from 'react-icons/fi';

const PIPELINE = [
  { status: 'PAID',       icon: '💳', title: 'Payment Confirmed',  desc: 'Order placed and payment received.' },
  { status: 'ASSIGNED',   icon: '🧵', title: 'Assigned to Tailor', desc: 'A skilled tailor is reviewing your specs.' },
  { status: 'PRODUCTION', icon: '✂️', title: 'In Production',       desc: 'Your garment is being handcrafted.' },
  { status: 'QC',         icon: '🔍', title: 'Quality Check',       desc: 'Measurements and finish inspection.' },
  { status: 'SHIPPED',    icon: '📦', title: 'Shipped',             desc: 'Handed to courier, tracking active.' },
  { status: 'DELIVERED',  icon: '✅', title: 'Delivered',           desc: 'Garment delivered to your address.' },
];

export default function OrderTrackingPage() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params.id as string;
  const { isLoggedIn } = useApp();

  const [order,    setOrder]    = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [actingOn, setActingOn] = useState<string | null>(null);

  const fetchOrder = useCallback(() => {
    setLoading(true);
    getOrderById(orderId)
      .then(setOrder)
      .catch(e => setError(e.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return; }
    fetchOrder();
  }, [isLoggedIn, fetchOrder]);

  const handleProposal = async (proposalId: string, approve: boolean) => {
    setActingOn(proposalId);
    try {
      await respondToProposal(proposalId, { approve });
      fetchOrder();
    } catch (e: any) {
      alert(e.message || 'Failed');
    } finally {
      setActingOn(null);
    }
  };

  if (!isLoggedIn) return null;

  if (loading) return (
    <div style={{ padding: '60px 40px', maxWidth: 700, margin: '0 auto' }}>
      {[200, 300, 260, 260, 260].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 'var(--r-md)', marginBottom: 16 }} />
      ))}
    </div>
  );

  if (error || !order) return (
    <div className="empty" style={{ padding: '100px 20px' }}>
      <div className="empty-icon">⚠️</div>
      <h2 className="empty-title">Order not found</h2>
      <p className="empty-desc">{error}</p>
      <button className="btn btn-primary" onClick={() => router.push('/orders')}>← Back to Orders</button>
    </div>
  );

  const currentIdx = PIPELINE.findIndex(p => p.status === order.status);

  return (
    <>
      {/* ── Header ── */}
      <div className="tracking-header">
        <div className="tracking-id-badge">
          <FiPackage size={12} /> Order #{order.id.slice(0, 8).toUpperCase()}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'var(--text)', marginBottom: 8 }}>
          Tracking Your Fit
        </h1>
        <p style={{ color: 'var(--text-2)' }}>
          Current status: <strong style={{ color: 'var(--gold)' }}>{order.status}</strong>
          {order.tailor && <span style={{ color: 'var(--text-3)', fontSize: '.88rem' }}> · Tailor: {order.tailor.name}</span>}
        </p>
      </div>

      {/* ── Designer Proposals ── */}
      {order.proposals?.length > 0 && (
        <div style={{ maxWidth: 760, margin: '40px auto 0', padding: '0 40px' }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'var(--text)', marginBottom: 16 }}>
            🎨 Designer Proposals
          </h3>
          {order.proposals.map((p: any) => (
            <div key={p.id} style={{ border: '1px solid var(--border-g)', borderRadius: 'var(--r-md)', padding: 22, background: 'var(--bg-el)', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div>
                  <h4 style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 3 }}>By {p.designerName}</h4>
                  <span style={{ fontSize: '.76rem', color: 'var(--text-3)' }}>
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <span className="status-badge" style={{
                  background: p.status === 'APPROVED' ? 'rgba(34,197,94,.15)' : p.status === 'REJECTED' ? 'rgba(239,68,68,.15)' : 'rgba(236,187,13,.15)',
                  color: p.status === 'APPROVED' ? 'var(--success)' : p.status === 'REJECTED' ? 'var(--danger)' : 'var(--gold)',
                }}>
                  {p.status}
                </span>
              </div>

              {/* Mockup image */}
              {p.mockupImageUrl && (
                <div style={{ borderRadius: 'var(--r-sm)', overflow: 'hidden', maxHeight: 280, background: '#000', display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <img src={p.mockupImageUrl} alt="Designer mockup" style={{ maxHeight: 280, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).src = '/image/BLAZER.jpg'; }} />
                </div>
              )}

              <p style={{ color: 'var(--text-2)', fontSize: '.86rem', lineHeight: 1.65, marginBottom: 16 }}>{p.description}</p>

              {p.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={actingOn === p.id}
                    onClick={() => handleProposal(p.id, true)}
                  >
                    <FiCheck size={13} /> {actingOn === p.id ? 'Loading…' : 'Approve Design'}
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={actingOn === p.id}
                    onClick={() => handleProposal(p.id, false)}
                    style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent', borderRadius: 50, padding: '9px 18px', fontWeight: 600, fontSize: '.78rem' }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Pipeline ── */}
      <div className="tracking-pipeline">
        <div className="pipeline">
          {PIPELINE.map((node, idx) => {
            const isDone   = idx < currentIdx;
            const isActive = idx === currentIdx;
            const isPend   = idx > currentIdx;
            return (
              <div key={node.status} className={`pipeline-step ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                <div className="pipe-icon">
                  {isDone ? <FiCheck size={19} /> : <span style={{ fontSize: 18 }}>{node.icon}</span>}
                </div>
                <div className="pipe-info">
                  <div className="pipe-title">{node.title}</div>
                  <div className="pipe-desc">{node.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Order items detail ── */}
      <div style={{ maxWidth: 760, margin: '0 auto 80px', padding: '0 40px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 30 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', color: 'var(--text)', marginBottom: 22 }}>
            Order Items & Specifications
          </h3>
          {order.items?.map((item: any) => (
            <div key={item.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.95rem' }}>
                  {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </span>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                  ₹{Number(item.price).toLocaleString('en-IN')}
                </span>
              </div>

              {item.isCustom && item.customSpec ? (
                <div style={{ fontSize: '.8rem', color: 'var(--text-2)', background: 'var(--bg-el)', padding: 14, borderRadius: 'var(--r-sm)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Custom Specifications:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 8 }}>
                    {item.customSpec.fabric   && <div>Fabric: <strong style={{ color: 'var(--text)' }}>{item.customSpec.fabric.name || item.customSpec.fabric}</strong></div>}
                    {item.customSpec.color    && <div>Color: <strong style={{ color: 'var(--text)' }}>{item.customSpec.color}</strong></div>}
                    {item.customSpec.size     && <div>Size: <strong style={{ color: 'var(--text)' }}>{item.customSpec.size}</strong></div>}
                  </div>
                  {/* Style selections */}
                  {item.customSpec.styles && Object.keys(item.customSpec.styles).length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>Style Selections:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {Object.entries(item.customSpec.styles).map(([k, v]: [string, any]) => (
                          <span key={k} style={{ padding: '2px 9px', background: 'var(--gold-subtle)', border: '1px solid var(--border-g)', borderRadius: 50, fontSize: '.72rem', color: 'var(--gold)', fontWeight: 600 }}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Measurements */}
                  {item.customSpec.measurements && Object.keys(item.customSpec.measurements).length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Body Measurements:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {Object.entries(item.customSpec.measurements).map(([k, v]: [string, any]) => (
                          <div key={k} style={{ fontSize: '.76rem' }}>
                            <span style={{ color: 'var(--text-3)', textTransform: 'capitalize' }}>{k}: </span>
                            <strong style={{ color: 'var(--text)' }}>{v}"</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>Ready-Made · Standard Fit</span>
              )}
            </div>
          ))}

          {/* Assigned tailor info */}
          {order.tailor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--gold-subtle)', border: '2px solid var(--border-g)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                {order.tailor.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>Assigned Tailor</div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{order.tailor.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
