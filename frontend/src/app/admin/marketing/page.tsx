'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { getBannersAdmin, createBanner, toggleBanner, deleteBanner, getCouponsAdmin, createCoupon, deleteCoupon, triggerEmailCampaign, triggerPushNotification } from '@/lib/api';
import { FiTag, FiImage, FiSend, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';

export default function MarketingPage() {
  const [tab, setTab] = useState<'coupons' | 'banners' | 'campaigns'>('coupons');
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Coupon Form State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENT');
  const [amount, setAmount] = useState('15');
  const [usageLimit, setUsageLimit] = useState('100');

  // Banner Form State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Campaign Form State
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [campaignAudience, setCampaignAudience] = useState('ALL_CUSTOMERS');
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bList, cList] = await Promise.all([
        getBannersAdmin(),
        getCouponsAdmin(),
      ]);
      setBanners(bList || []);
      setCoupons(cList || []);
    } catch (err) {
      console.error('Failed to load marketing data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon({ code, discountType, amount: parseFloat(amount), usageLimit: parseInt(usageLimit) });
      setShowCouponModal(false);
      setCode('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Coupon creation failed');
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBanner({ title: bannerTitle, imageUrl, videoUrl, isActive: true });
      setShowBannerModal(false);
      setBannerTitle('');
      setImageUrl('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Banner creation failed');
    }
  };

  const handleTriggerCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await triggerEmailCampaign({ subject: campaignSubject, body: campaignBody, audience: campaignAudience });
      alert('Email campaign queued for broadcast!');
      setCampaignSubject('');
      setCampaignBody('');
    } catch (err: any) {
      alert(err.message || 'Campaign trigger failed');
    } finally {
      setSending(false);
    }
  };

  const couponColumns: Column<any>[] = [
    { key: 'code', header: 'Coupon Code', render: (r) => <strong className="vt-gold-text">{r.code}</strong> },
    { key: 'discountType', header: 'Type', render: (r) => <span className="vt-chip">{r.discountType}</span> },
    { key: 'amount', header: 'Discount Value', render: (r) => r.discountType === 'PERCENT' ? `${r.amount}% OFF` : `₹${r.amount} OFF` },
    { key: 'usage', header: 'Usage Count', render: (r) => `${r.usedCount} / ${r.usageLimit}` },
    { key: 'createdAt', header: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
  ];

  return (
    <AdminLayout title="Marketing, Coupons & Promotion Management" onRefresh={loadData}>
      <div className="vt-marketing-page">
        <div className="vt-tabs">
          <button className={`vt-tab-btn ${tab === 'coupons' ? 'active' : ''}`} onClick={() => setTab('coupons')}>
            Discounts & Coupons ({coupons.length})
          </button>
          <button className={`vt-tab-btn ${tab === 'banners' ? 'active' : ''}`} onClick={() => setTab('banners')}>
            Homepage Banners ({banners.length})
          </button>
          <button className={`vt-tab-btn ${tab === 'campaigns' ? 'active' : ''}`} onClick={() => setTab('campaigns')}>
            Campaign Broadcast Tool
          </button>
        </div>

        {loading ? (
          <div className="vt-skeleton-table" />
        ) : tab === 'coupons' ? (
          <>
            <div className="vt-filter-bar">
              <h3>Active Coupons</h3>
              <button className="vt-btn vt-btn-gold" onClick={() => setShowCouponModal(true)}>
                <FiPlus size={16} /> Create Coupon Code
              </button>
            </div>
            <DataTable
              columns={couponColumns}
              data={coupons}
              searchPlaceholder="Search coupon codes..."
              actions={(row) => (
                <button className="vt-btn-icon danger" onClick={async () => { await deleteCoupon(row.id); loadData(); }}>
                  <FiTrash2 size={15} />
                </button>
              )}
            />
          </>
        ) : tab === 'banners' ? (
          <>
            <div className="vt-filter-bar">
              <h3>Homepage Banners & Promo Videos</h3>
              <button className="vt-btn vt-btn-gold" onClick={() => setShowBannerModal(true)}>
                <FiPlus size={16} /> Add New Banner
              </button>
            </div>
            <div className="vt-grid-3 gap-md">
              {banners.map((b: any) => (
                <div key={b.id} className="vt-card">
                  <div className="vt-font-medium mb-xs">{b.title}</div>
                  <div className="vt-text-sub font-xs mb-sm">{b.imageUrl || 'No image URL'}</div>
                  <button className="vt-btn vt-btn-danger vt-btn-sm" onClick={async () => { await deleteBanner(b.id); loadData(); }}>
                    Remove Banner
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="vt-card style={{ maxWidth: '600px' }}">
            <h3>Email / Push Broadcast Tool</h3>
            <form onSubmit={handleTriggerCampaign} className="vt-form mt-md">
              <div className="vt-form-group mb-sm">
                <label>Target Audience Segment:</label>
                <select className="vt-select-md" value={campaignAudience} onChange={e => setCampaignAudience(e.target.value)}>
                  <option value="ALL_CUSTOMERS">All Registered Customers</option>
                  <option value="TAILORS">All Tailors</option>
                  <option value="DESIGNERS">All Fashion Designers</option>
                </select>
              </div>

              <div className="vt-form-group mb-sm">
                <label>Campaign Subject / Headline:</label>
                <input type="text" className="vt-input-md" value={campaignSubject} onChange={e => setCampaignSubject(e.target.value)} required />
              </div>

              <div className="vt-form-group mb-md">
                <label>Campaign Body Text:</label>
                <textarea className="vt-textarea-md" rows={4} value={campaignBody} onChange={e => setCampaignBody(e.target.value)} required />
              </div>

              <button type="submit" className="vt-btn vt-btn-gold w-full" disabled={sending}>
                <FiSend size={15} /> {sending ? 'Transmitting Broadcast...' : 'Broadcast Campaign'}
              </button>
            </form>
          </div>
        )}

        {/* Coupon Modal */}
        {showCouponModal && (
          <div className="vt-modal-backdrop">
            <div className="vt-modal-card">
              <div className="vt-modal-header">
                <h3>Create Promotional Coupon Code</h3>
                <button className="vt-close-btn" onClick={() => setShowCouponModal(false)}>✕</button>
              </div>
              <form onSubmit={handleCreateCoupon} className="vt-form">
                <div className="vt-form-group mb-sm">
                  <label>Coupon Code (e.g. BESPOKE20):</label>
                  <input type="text" className="vt-input-md" value={code} onChange={e => setCode(e.target.value)} required />
                </div>
                <div className="vt-grid-2 gap-sm mb-sm">
                  <div className="vt-form-group">
                    <label>Discount Type:</label>
                    <select className="vt-select-md" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                      <option value="PERCENT">PERCENT (%)</option>
                      <option value="FIXED">FIXED AMOUNT (₹)</option>
                    </select>
                  </div>
                  <div className="vt-form-group">
                    <label>Discount Amount / Value:</label>
                    <input type="number" className="vt-input-md" value={amount} onChange={e => setAmount(e.target.value)} required />
                  </div>
                </div>
                <div className="vt-form-group mb-md">
                  <label>Maximum Usage Limit:</label>
                  <input type="number" className="vt-input-md" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} required />
                </div>
                <div className="vt-modal-actions">
                  <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowCouponModal(false)}>Cancel</button>
                  <button type="submit" className="vt-btn vt-btn-gold">Create Coupon</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Banner Modal */}
        {showBannerModal && (
          <div className="vt-modal-backdrop">
            <div className="vt-modal-card">
              <div className="vt-modal-header">
                <h3>Add Homepage Banner</h3>
                <button className="vt-close-btn" onClick={() => setShowBannerModal(false)}>✕</button>
              </div>
              <form onSubmit={handleCreateBanner} className="vt-form">
                <div className="vt-form-group mb-sm">
                  <label>Banner Headline:</label>
                  <input type="text" className="vt-input-md" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} required />
                </div>
                <div className="vt-form-group mb-md">
                  <label>Banner Image URL:</label>
                  <input type="text" className="vt-input-md" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
                </div>
                <div className="vt-modal-actions">
                  <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowBannerModal(false)}>Cancel</button>
                  <button type="submit" className="vt-btn vt-btn-gold">Add Banner</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
