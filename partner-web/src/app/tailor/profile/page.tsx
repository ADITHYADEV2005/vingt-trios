'use client';
import { useState, useEffect, useCallback } from 'react';
import { getTailorPortalProfile, updateTailorPortalProfile } from '@/lib/api';
import { FiUser, FiScissors, FiDollarSign, FiSave, FiCheckCircle, FiPower } from 'react-icons/fi';

export default function TailorProfileSetupPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [shopName, setShopName] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [location, setLocation] = useState('');
  const [specializations, setSpecializations] = useState('SHIRT,PANT,BLAZER');
  const [bio, setBio] = useState('');
  const [portfolioImages, setPortfolioImages] = useState('');
  const [maxConcurrentOrders, setMaxConcurrentOrders] = useState('10');
  const [isAvailable, setIsAvailable] = useState(true);

  // Bank Info
  const [bankAccountNum, setBankAccountNum] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTailorPortalProfile();
      setProfile(res);
      setShopName(res.shopName || '');
      setExperienceYears(res.experienceYears ? res.experienceYears.toString() : '5');
      setLocation(res.location || '');
      setSpecializations(res.specializations || 'SHIRT,PANT,BLAZER');
      setBio(res.bio || '');
      setPortfolioImages(res.portfolioImages || '');
      setMaxConcurrentOrders(res.maxConcurrentOrders ? res.maxConcurrentOrders.toString() : '10');
      setIsAvailable(res.isAvailable ?? true);

      if (res.bankAccount) {
        try {
          const b = typeof res.bankAccount === 'string' ? JSON.parse(res.bankAccount) : res.bankAccount;
          setBankAccountNum(b.accountNumber || '');
          setIfsc(b.ifsc || '');
          setBankName(b.bankName || '');
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
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
      await updateTailorPortalProfile({
        shopName,
        experienceYears: parseInt(experienceYears) || 5,
        location,
        specializations,
        bio,
        portfolioImages,
        maxConcurrentOrders: parseInt(maxConcurrentOrders) || 10,
        isAvailable,
        bankAccount: JSON.stringify({ accountNumber: bankAccountNum, ifsc, bankName }),
      });
      alert('Workshop profile & Razorpay payout setup saved!');
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
    <div className="vt-tailor-profile-setup-page">
      <div className="vt-card mb-lg">
        <div className="vt-card-header">
          <h3><FiScissors size={18} /> Tailor Workshop Setup & Bank Payout Details</h3>
        </div>
        <p className="vt-text-sub">
          Set up your shop portfolio, specialization tags, capacity limits, and bank account for Razorpay Settlements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="vt-form">
        <div className="vt-grid-2 gap-lg mb-lg">
          {/* Left Column: Workshop Info & Portfolio */}
          <div className="vt-card">
            <h4 className="mb-md">Workshop & Credibility Setup</h4>

            <div className="vt-form-group mb-sm">
              <label>Shop / Workshop Name:</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="e.g. Sugandhi Master Tailors"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
              />
            </div>

            <div className="vt-grid-2 gap-sm mb-sm">
              <div className="vt-form-group">
                <label>Years of Experience:</label>
                <input
                  type="number"
                  className="vt-input-md"
                  value={experienceYears}
                  onChange={e => setExperienceYears(e.target.value)}
                />
              </div>

              <div className="vt-form-group">
                <label>City / Location:</label>
                <input
                  type="text"
                  className="vt-input-md"
                  placeholder="e.g. Mumbai, MH"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="vt-form-group mb-sm">
              <label>Specialization Tags (comma-separated):</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="SHIRT, PANT, BLAZER, EMBROIDERY"
                value={specializations}
                onChange={e => setSpecializations(e.target.value)}
              />
            </div>

            <div className="vt-form-group mb-sm">
              <label>Portfolio Work Photos (comma-separated URLs):</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="/image/shirt.jpg, /image/BLAZER.jpg"
                value={portfolioImages}
                onChange={e => setPortfolioImages(e.target.value)}
              />
            </div>

            <div className="vt-form-group mb-md">
              <label>Bio / Workshop Background:</label>
              <textarea
                className="vt-textarea-md"
                rows={3}
                placeholder="Describe your tailoring experience and quality guarantee..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Capacity Limits & Razorpay Bank Setup */}
          <div className="vt-card">
            <h4 className="mb-md">Order Capacity & Bank Setup</h4>

            <div className="vt-form-group mb-sm">
              <label>Max Concurrent Orders Capacity:</label>
              <input
                type="number"
                className="vt-input-md"
                value={maxConcurrentOrders}
                onChange={e => setMaxConcurrentOrders(e.target.value)}
              />
            </div>

            <div className="vt-form-group mb-md">
              <label>Availability Toggle:</label>
              <select
                className="vt-select-md w-full"
                value={isAvailable ? 'true' : 'false'}
                onChange={e => setIsAvailable(e.target.value === 'true')}
              >
                <option value="true">Active — Accepting New Orders</option>
                <option value="false">Paused — Not Accepting New Orders</option>
              </select>
            </div>

            <hr className="my-md" style={{ borderColor: 'var(--border)' }} />

            <h4 className="mb-md"><FiDollarSign size={16} /> Razorpay Bank Payout Details</h4>

            <div className="vt-form-group mb-sm">
              <label>Bank Account Number:</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="Enter 12-16 digit account number"
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
              <FiSave size={15} /> {saving ? 'Saving Profile...' : 'Save Profile & Payout Setup'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
