'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDesignerDesign } from '@/lib/api';
import { FiArrowLeft, FiPlusCircle, FiImage, FiTag, FiLock, FiCheck } from 'react-icons/fi';

const CATEGORIES = ['SHIRT', 'PANT', 'BLAZER', 'ALL'];
const FABRIC_OPTS = ['Italian Wool', 'Egyptian Cotton', 'Pure Linen', 'Silk Velvet', 'ALL FABRICS'];

export default function StudioUploadWizardPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SHIRT');
  const [mockupImageUrl, setMockupUrl] = useState('/image/BLAZER.jpg');
  const [sketchUrl, setSketchUrl] = useState('');
  const [tags, setTags] = useState('formalwear, Italian cut, seasonal');
  const [compatibleFabrics, setFabrics] = useState('ALL FABRICS');
  const [licensingTier, setLicensingTier] = useState('OPEN_USE');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (isDraft: boolean) => {
    if (!title.trim()) return alert('Enter a design title');
    setSaving(true);
    try {
      await createDesignerDesign({
        title,
        category,
        mockupImageUrl,
        sketchUrl: sketchUrl.trim() || undefined,
        tags,
        compatibleFabrics,
        licensingTier,
        description,
        isDraft,
      });
      alert(isDraft ? 'Design saved as Draft!' : 'Design submitted for Admin Approval!');
      router.push('/designer/designs');
    } catch (err: any) {
      alert(err.message || 'Creation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vt-designer-upload-page">
      <div className="vt-detail-top-nav mb-md">
        <button className="vt-back-btn" onClick={() => router.push('/designer/designs')}>
          <FiArrowLeft size={16} /> Back to Design Portfolio
        </button>
      </div>

      <div className="vt-card style={{ maxWidth: '800px', margin: '0 auto' }}">
        <div className="vt-card-header">
          <h3><FiPlusCircle size={18} /> Studio Design Creation & Upload Wizard</h3>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="vt-form">
          <div className="vt-form-group mb-sm">
            <label>Design Title / Pattern Name:</label>
            <input
              type="text"
              className="vt-input-md"
              placeholder="e.g. Royal Oxford Houndstooth Blazer"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="vt-grid-2 gap-sm mb-sm">
            <div className="vt-form-group">
              <label>Product Category:</label>
              <select className="vt-select-md" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="vt-form-group">
              <label>Licensing Tier:</label>
              <select className="vt-select-md" value={licensingTier} onChange={e => setLicensingTier(e.target.value)}>
                <option value="OPEN_USE">OPEN USE — Monetize per order across platform</option>
                <option value="EXCLUSIVE">EXCLUSIVE — Exclusive boutique collection</option>
              </select>
            </div>
          </div>

          <div className="vt-grid-2 gap-sm mb-sm">
            <div className="vt-form-group">
              <label>Mockup / Render Image URL:</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="/image/BLAZER.jpg"
                value={mockupImageUrl}
                onChange={e => setMockupUrl(e.target.value)}
                required
              />
            </div>

            <div className="vt-form-group">
              <label>Flat Sketch / Blueprint URL (Optional):</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="URL to technical sketch"
                value={sketchUrl}
                onChange={e => setSketchUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="vt-grid-2 gap-sm mb-sm">
            <div className="vt-form-group">
              <label>Style Tags (comma-separated):</label>
              <input
                type="text"
                className="vt-input-md"
                placeholder="embroidery, slim-fit, formalwear"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>

            <div className="vt-form-group">
              <label>Compatible Fabrics:</label>
              <select className="vt-select-md" value={compatibleFabrics} onChange={e => setFabrics(e.target.value)}>
                {FABRIC_OPTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="vt-form-group mb-md">
            <label>Design Notes & Feasibility Description:</label>
            <textarea
              className="vt-textarea-md"
              rows={4}
              placeholder="Describe embroidery thread specs, recommended collar cut, lapel width, and stitching notes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="vt-flex-align-gap justify-end">
            <button
              type="button"
              className="vt-btn vt-btn-secondary"
              disabled={saving}
              onClick={() => handleSave(true)}
            >
              Save as Draft
            </button>

            <button
              type="submit"
              className="vt-btn vt-btn-gold"
              disabled={saving}
            >
              <FiCheck size={14} /> {saving ? 'Submitting...' : 'Submit for Admin Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
