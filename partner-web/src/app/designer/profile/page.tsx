'use client';
import { useState, useEffect, useCallback } from 'react';
import { getDesignerPortalProfile, updateDesignerPortalProfile } from '@/lib/api';
import { FiUser, FiCompass, FiDollarSign, FiSave, FiCheckCircle } from 'react-icons/fi';

export default function DesignerProfileSetupPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [specialization, setSpecialization] = useState('Formalwear & Embroidery');
  const [bio, setBio] = useState('');
  const [portfolioImages, setPortfolioImages] = useState('');

  // Social Links
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [behance, setBehance] = useState('');

  // Bank Info
  const [bankAccountNum, setBankAccountNum] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDesignerPortalProfile();
      setProfile(res);
      setName(res.name || '');
      setBrandName(res.brandName || '');
      setSpecialization(res.specialization || 'Formalwear & Embroidery');
      setBio(res.bio || '');
      setPortfolioImages(res.portfolioImages || '');

      if (res.socialLinks) {
        try {
          const s = typeof res.socialLinks === 'string' ? JSON.parse(res.socialLinks) : res.socialLinks;
          setInstagram(s.instagram || '');
          setWebsite(s.website || '');
          setBehance(s.behance || '');
        } catch {}
      }

      if (res.bankAccount) {
        try {
          const b = typeof res.bankAccount === 'string' ? JSON.parse(res.bankAccount) : res.bankAccount;
          setBankAccountNum(b.accountNumber || '');
          setIfsc(b.ifsc || '');
          setBankName(b.bankName || '');
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load designer profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDesignerPortalProfile({
        name,
        brandName,
        specialization,
        bio,
        portfolioImages,
        socialLinks: JSON.stringify({ instagram, website, behance }),
        bankAccount: JSON.stringify({ accountNumber: bankAccountNum, ifsc, bankName }),
      });
      alert('Brand profile & Razorpay payout setup saved!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="vt-skeleton-card" style={{ height: '400px' }} />;
  }

  return (
    <div className="vt-designer-profile-page">
      <div className="vt-card mb-lg">
        <div className="vt-card-header">
          <h3><FiCompass size={18} /> Designer Brand Setup & Razorpay Royalty Payouts</h3>
        </div>
        <p className="vt-text-sub">
          Configure your public brand storefront profile, portfolio links, and bank account for Razorpay Royalty settlements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="vt-form">
        <div className="vt-grid-2 gap-lg mb-lg">
          {/* Left Column: Brand Info */}
          <div className="vt-card">
            <h4 className="mb-md">Couture Brand Identity</h4>

            <div className="vt-form-group mb-sm">
              <label>Designer Name:</label>
              <input
                type="text"
                className="vt-input-md"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="vt-form-group mb-sm">
              <label>Brand / House Name:</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="e.g. Maison Adithya Atelier"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
              />
            </div>

            <div className="vt-form-group mb-sm">
              <label>Specialization & Design Focus:</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="e.g. Italian Cut Formalwear & Zardozi Embroidery"
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
              />
            </div>

            <div className="vt-form-group mb-sm">
              <label>Brand Bio / Atelier Philosophy:</label>
              <textarea
                className="vt-textarea-md"
                rows={3}
                placeholder="Describe your design heritage and aesthetic approach..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>

            <div className="vt-form-group mb-md">
              <label>Portfolio Showcase Images (comma-separated URLs):</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="/image/BLAZER.jpg, /image/shirt.jpg"
                value={portfolioImages}
                onChange={e => setPortfolioImages(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Social Links & Bank Payout */}
          <div className="vt-card">
            <h4 className="mb-md">Social Presence & Royalty Payouts</h4>

            <div className="vt-form-group mb-sm">
              <label>Instagram Handle:</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="@couture_house"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
              />
            </div>

            <div className="vt-grid-2 gap-sm mb-md">
              <div className="vt-form-group">
                <label>Website URL:</label>
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="https://..."
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>

              <div className="vt-form-group">
                <label>Behance / Portfolio:</label>
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="behance.net/..."
                  value={behance}
                  onChange={e => setBehance(e.target.value)}
                />
              </div>
            </div>

            <hr className="my-md" style={{ borderColor: 'var(--border)' }} />

            <h4 className="mb-md"><FiDollarSign size={16} /> Razorpay Royalty Bank Account</h4>

            <div className="vt-form-group mb-sm">
              <label>Bank Account Number:</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="Enter account number for settlements"
                value={bankAccountNum}
                onChange={e => setBankAccountNum(e.target.value)}
              />
            </div>

            <div className="vt-grid-2 gap-sm mb-md">
              <div className="vt-form-group">
                <label>IFSC Code:</label>
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="e.g. HDFC0001234"
                  value={ifsc}
                  onChange={e => setIfsc(e.target.value)}
                />
              </div>

              <div className="vt-form-group">
                <label>Bank Name:</label>
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="e.g. HDFC Bank"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="vt-btn vt-btn-gold w-full" disabled={saving}>
              <FiSave size={15} /> {saving ? 'Saving Profile...' : 'Save Brand Profile & Royalty Payouts'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
