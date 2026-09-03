'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  getTailorPortalOrderDetail, updateTailorOrderStage,
  flagTailorMeasurement, updateTailorShipping,
  getTailorOrderChat, sendTailorChatMessage
} from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { OrderTimeline } from '@/components/admin/OrderTimeline';
import {
  FiArrowLeft, FiScissors, FiSliders, FiCamera,
  FiAlertCircle, FiMessageSquare, FiTruck, FiCheck, FiSend
} from 'react-icons/fi';

const STAGES = ['CUTTING', 'STITCHING', 'QC', 'DISPATCH', 'SHIPPED'];

export default function TailorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Stage Photo Upload State
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoNote, setPhotoNote] = useState('');
  const [selectedStage, setSelectedStage] = useState('CUTTING');

  // Flag Measurement Modal State
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagIssue, setFlagIssue] = useState('');

  // Shipping State
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Chat State
  const [chatMsg, setChatMsg] = useState('');
  const [chatSending, setChatSending] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [oData, cData] = await Promise.all([
        getTailorPortalOrderDetail(orderId),
        getTailorOrderChat(orderId).catch(() => []),
      ]);
      setOrder(oData);
      setChats(cData || []);
      setSelectedStage(oData.status);
      if (oData.courierName) setCourierName(oData.courierName);
      if (oData.trackingNumber) setTrackingNumber(oData.trackingNumber);
    } catch (err: any) {
      alert(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStageUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateTailorOrderStage(orderId, {
        stage: selectedStage,
        photoUrl: photoUrl.trim() || undefined,
        note: photoNote.trim() || undefined,
      });
      setPhotoUrl('');
      setPhotoNote('');
      await loadData();
      alert(`Stage updated to ${selectedStage}!`);
    } catch (err: any) {
      alert(err.message || 'Stage update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagIssue.trim()) return;
    setUpdating(true);
    try {
      await flagTailorMeasurement(orderId, { issueDescription: flagIssue });
      setShowFlagModal(false);
      setFlagIssue('');
      await loadData();
      alert('Measurement issue flagged to admin & customer.');
    } catch (err: any) {
      alert(err.message || 'Flag action failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber || !courierName) return alert('Enter tracking number and courier');
    setUpdating(true);
    try {
      await updateTailorShipping(orderId, { trackingNumber, courierName });
      await loadData();
      alert('Order marked as SHIPPED with tracking number!');
    } catch (err: any) {
      alert(err.message || 'Shipping update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setChatSending(true);
    try {
      await sendTailorChatMessage(orderId, { message: chatMsg });
      setChatMsg('');
      const freshChats = await getTailorOrderChat(orderId);
      setChats(freshChats || []);
    } catch (err: any) {
      alert(err.message || 'Chat send failed');
    } finally {
      setChatSending(false);
    }
  };

  if (loading) {
    return (
      <div className="vt-skeleton-card" style={{ height: '450px' }} />
    );
  }

  if (!order) return <div className="vt-card">Order #{orderId} not found.</div>;

  // Extract measurements from customSpec
  const customItem = order.items?.find((i: any) => i.isCustom);
  const specObj = customItem?.customSpec;

  return (
    <div className="vt-tailor-detail-page">
      {/* Top Bar */}
      <div className="vt-detail-top-nav mb-md">
        <button className="vt-back-btn" onClick={() => router.push('/tailor/orders')}>
          <FiArrowLeft size={16} /> Back to Work Queue
        </button>
        <StatusBadge status={order.status} />
      </div>

      {/* Main Spec & Controls Layout */}
      <div className="vt-grid-2-1 gap-lg">
        {/* Left Column: Measurements Spec Sheet & Stage Stepper */}
        <div className="vt-detail-main">
          {/* Formatted Tailor Spec Sheet */}
          <div className="vt-card mb-md">
            <div className="vt-card-header">
              <h3><FiSliders size={16} /> Workshop Tailoring Spec Sheet</h3>
              <button className="vt-btn vt-btn-danger vt-btn-sm" onClick={() => setShowFlagModal(true)}>
                <FiAlertCircle size={14} /> Flag Measurement Issue
              </button>
            </div>

            {/* Customer Info */}
            <div className="vt-info-grid mb-md">
              <div><label>Customer:</label><span>{order.customer?.name} ({order.customer?.email})</span></div>
              <div><label>Order Date:</label><span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span></div>
              <div><label>Target Deadline:</label><span className="vt-gold-text">{order.deadline ? new Date(order.deadline).toLocaleDateString('en-IN') : 'Standard (7 Days)'}</span></div>
            </div>

            {/* Spec Items */}
            {order.items?.map((it: any) => (
              <div key={it.id} className="vt-spec-item">
                <div className="vt-font-medium vt-gold-text mb-xs">{it.name} ({it.category})</div>

                {it.isCustom && it.customSpec && (
                  <div className="vt-custom-spec-box">
                    <div className="vt-grid-2 gap-sm mb-sm">
                      <div>Fabric Selected: <strong>{it.customSpec.fabric?.name || it.customSpec.fabric || 'Standard'}</strong></div>
                      <div>Fit Preference: <strong>{it.customSpec.fitPreference || it.customSpec.size || 'Slim Fit'}</strong></div>
                    </div>

                    {/* Formatted Customer Measurements */}
                    {it.customSpec.measurements && (
                      <div className="vt-measurements-spec-grid mt-sm">
                        <div className="vt-spec-tile"><span>Chest:</span> <strong>{it.customSpec.measurements.chest || '--'}"</strong></div>
                        <div className="vt-spec-tile"><span>Waist:</span> <strong>{it.customSpec.measurements.waist || '--'}"</strong></div>
                        <div className="vt-spec-tile"><span>Shoulder:</span> <strong>{it.customSpec.measurements.shoulder || '--'}"</strong></div>
                        <div className="vt-spec-tile"><span>Sleeve:</span> <strong>{it.customSpec.measurements.sleeve || '--'}"</strong></div>
                        <div className="vt-spec-tile"><span>Inseam:</span> <strong>{it.customSpec.measurements.inseam || '--'}"</strong></div>
                        <div className="vt-spec-tile"><span>Neck:</span> <strong>{it.customSpec.measurements.neck || '--'}"</strong></div>
                        <div className="vt-spec-tile"><span>Hip:</span> <strong>{it.customSpec.measurements.hip || '--'}"</strong></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Stage Progress & Photo Upload Form */}
          <div className="vt-card mb-md">
            <div className="vt-card-header">
              <h3><FiScissors size={16} /> Stage Progress & Workshop Photo Upload</h3>
            </div>

            <form onSubmit={handleStageUpdate} className="vt-form">
              <div className="vt-form-group mb-sm">
                <label>Select Current Production Stage:</label>
                <select className="vt-select-md" value={selectedStage} onChange={e => setSelectedStage(e.target.value)}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="vt-form-group mb-sm">
                <label>Progress Photo URL (Optional trust builder):</label>
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="https://... photo of cutting or stitching stage"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                />
              </div>

              <div className="vt-form-group mb-md">
                <label>Stage Notes:</label>
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="e.g. Fabric cut to spec, stitching shoulders"
                  value={photoNote}
                  onChange={e => setPhotoNote(e.target.value)}
                />
              </div>

              <button type="submit" className="vt-btn vt-btn-gold w-full" disabled={updating}>
                {updating ? 'Updating...' : 'Update Stage & Upload Progress Photo'}
              </button>
            </form>

            {/* Uploaded Progress Photos Gallery */}
            {order.progressPhotos && order.progressPhotos.length > 0 && (
              <div className="vt-photo-gallery mt-md">
                <h4>Uploaded Progress Photos ({order.progressPhotos.length})</h4>
                <div className="vt-grid-3 gap-sm mt-sm">
                  {order.progressPhotos.map((p: any) => (
                    <div key={p.id} className="vt-photo-card">
                      <div className="vt-chip warning mb-xs">{p.stage}</div>
                      <div className="vt-text-sub">{p.note || 'No note'}</div>
                      <div className="vt-text-sub font-xs">{new Date(p.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Logistics Entry */}
          <div className="vt-card">
            <div className="vt-card-header">
              <h3><FiTruck size={16} /> Dispatch & Courier Tracking Entry</h3>
            </div>

            <form onSubmit={handleShippingSubmit} className="vt-form">
              <div className="vt-grid-2 gap-sm mb-md">
                <div className="vt-form-group">
                  <label>Courier Name:</label>
                  <input
                    type="text"
                    className="vt-input-md"
                    placeholder="e.g. BlueDart / Delhivery"
                    value={courierName}
                    onChange={e => setCourierName(e.target.value)}
                    required
                  />
                </div>

                <div className="vt-form-group">
                  <label>Tracking Number:</label>
                  <input
                    type="text"
                    className="vt-input-md"
                    placeholder="e.g. BD123456789IN"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="vt-btn vt-btn-success w-full" disabled={updating}>
                <FiCheck size={14} /> Mark Order Dispatched & Save Tracking
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Chat & Timeline */}
        <div className="vt-detail-side">
          {/* Customer Chat Drawer */}
          <div className="vt-card mb-md">
            <div className="vt-card-header">
              <h3><FiMessageSquare size={16} /> Order Chat Thread</h3>
            </div>

            <div className="vt-chat-box">
              <div className="vt-chat-messages">
                {chats.length === 0 ? (
                  <div className="vt-feed-empty">No messages in chat thread yet.</div>
                ) : (
                  chats.map((c: any) => (
                    <div key={c.id} className={`vt-chat-msg ${c.senderRole === 'TAILOR' ? 'tailor' : 'customer'}`}>
                      <div className="vt-chat-sender">{c.sender?.name} ({c.senderRole})</div>
                      <div className="vt-chat-bubble">{c.message}</div>
                      <div className="vt-chat-time">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChat} className="vt-chat-input-row mt-sm">
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="Type message to customer..."
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                />
                <button type="submit" className="vt-btn vt-btn-gold" disabled={chatSending}>
                  <FiSend size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Timeline */}
          <div className="vt-card">
            <div className="vt-card-header">
              <h3>Order Stage History</h3>
            </div>
            <OrderTimeline timeline={order.timeline || []} />
          </div>
        </div>
      </div>

      {/* Flag Measurement Modal */}
      {showFlagModal && (
        <div className="vt-modal-backdrop">
          <div className="vt-modal-card">
            <div className="vt-modal-header">
              <h3>Flag Measurement / Spec Issue</h3>
              <button className="vt-close-btn" onClick={() => setShowFlagModal(false)}>✕</button>
            </div>

            <form onSubmit={handleFlagSubmit} className="vt-form">
              <div className="vt-form-group mb-md">
                <label>Issue Description (e.g. Chest waist ratio inconsistent):</label>
                <textarea
                  className="vt-textarea-md"
                  rows={4}
                  placeholder="Describe the spec inconsistency or request admin re-scan..."
                  value={flagIssue}
                  onChange={e => setFlagIssue(e.target.value)}
                  required
                />
              </div>

              <div className="vt-modal-actions">
                <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowFlagModal(false)}>Cancel</button>
                <button type="submit" className="vt-btn vt-btn-danger" disabled={updating}>
                  Submit Flag Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
