'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { getStylesAdmin, createStyle, updateStyle, deleteStyle } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const TYPES = ['COLLAR', 'SLEEVE', 'CUT', 'EMBROIDERY', 'POCKET', 'BUTTON'];

export default function StyleLibraryPage() {
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStyle, setEditingStyle] = useState<any>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('COLLAR');
  const [category, setCategory] = useState('SHIRT');
  const [priceDelta, setPriceDelta] = useState('0');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStylesAdmin({ take: 100 });
      setStyles(res.styles || []);
    } catch (err) {
      console.error('Failed to load styles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingStyle(null);
    setName('');
    setType('COLLAR');
    setCategory('SHIRT');
    setPriceDelta('0');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (st: any) => {
    setEditingStyle(st);
    setName(st.name);
    setType(st.type);
    setCategory(st.category);
    setPriceDelta(st.priceDelta.toString());
    setDescription(st.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        type,
        category,
        priceDelta: parseFloat(priceDelta) || 0,
        description,
      };

      if (editingStyle) {
        await updateStyle(editingStyle.id, payload);
      } else {
        await createStyle(payload);
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this style option from customization engine?')) return;
    try {
      await deleteStyle(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', header: 'Pattern / Style Name', render: (r) => <strong style={{ color: 'var(--text)' }}>{r.name}</strong> },
    { key: 'type', header: 'Option Type', render: (r) => <span className="vt-chip warning">{r.type}</span> },
    { key: 'category', header: 'Garment Category', render: (r) => <span className="vt-chip">{r.category}</span> },
    { key: 'priceDelta', header: 'Surcharge (₹)', render: (r) => `+₹${r.priceDelta.toLocaleString('en-IN')}` },
  ];

  return (
    <AdminLayout title="Style & Pattern Customization Library" onRefresh={loadData}>
      <div className="vt-catalog-styles-page">
        <div className="vt-filter-bar">
          <div className="vt-filter-group">
            <h3>Customization Parameters ({styles.length})</h3>
          </div>
          <button className="vt-btn vt-btn-gold" onClick={handleOpenCreate}>
            <FiPlus size={16} /> Add Style Option
          </button>
        </div>

        {loading ? (
          <div className="vt-skeleton-table" />
        ) : (
          <DataTable
            columns={columns}
            data={styles}
            searchPlaceholder="Search style name, type..."
            actions={(row) => (
              <div className="vt-flex-align-gap">
                <button className="vt-btn-icon" onClick={() => handleOpenEdit(row)}>
                  <FiEdit2 size={15} />
                </button>
                <button className="vt-btn-icon danger" onClick={() => handleDelete(row.id)}>
                  <FiTrash2 size={15} />
                </button>
              </div>
            )}
          />
        )}

        {showModal && (
          <div className="vt-modal-backdrop">
            <div className="vt-modal-card">
              <div className="vt-modal-header">
                <h3>{editingStyle ? 'Edit Pattern Option' : 'Add New Style Option'}</h3>
                <button className="vt-close-btn" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="vt-form">
                <div className="vt-form-group mb-sm">
                  <label>Pattern / Feature Name:</label>
                  <input type="text" className="vt-input-md" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="vt-grid-2 gap-sm mb-sm">
                  <div className="vt-form-group">
                    <label>Feature Type:</label>
                    <select className="vt-select-md" value={type} onChange={e => setType(e.target.value)}>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="vt-form-group">
                    <label>Garment Category:</label>
                    <select className="vt-select-md" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="SHIRT">SHIRT</option>
                      <option value="PANT">PANT</option>
                      <option value="BLAZER">BLAZER</option>
                      <option value="ALL">ALL CATEGORIES</option>
                    </select>
                  </div>
                </div>

                <div className="vt-form-group mb-md">
                  <label>Style Surcharge Delta (₹):</label>
                  <input type="number" className="vt-input-md" value={priceDelta} onChange={e => setPriceDelta(e.target.value)} required />
                </div>

                <div className="vt-modal-actions">
                  <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="vt-btn vt-btn-gold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Style Option'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
