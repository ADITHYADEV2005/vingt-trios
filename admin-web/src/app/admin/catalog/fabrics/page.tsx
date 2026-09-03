'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { getFabricsAdmin, createFabric, updateFabric, deleteFabric } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiCheck } from 'react-icons/fi';

export default function FabricsCatalogPage() {
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFabric, setEditingFabric] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('SHIRT');
  const [priceDelta, setPriceDelta] = useState('0');
  const [stockLevel, setStockLevel] = useState('100');
  const [colors, setColors] = useState('White, Black, Navy');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFabricsAdmin({ take: 100 });
      setFabrics(res.fabrics || []);
    } catch (err) {
      console.error('Failed to load fabrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingFabric(null);
    setName('');
    setCategory('SHIRT');
    setPriceDelta('0');
    setStockLevel('100');
    setColors('White, Black, Navy');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (fab: any) => {
    setEditingFabric(fab);
    setName(fab.name);
    setCategory(fab.category);
    setPriceDelta(fab.priceDelta.toString());
    setStockLevel(fab.stockLevel.toString());
    setColors(fab.colors || '');
    setDescription(fab.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        category,
        priceDelta: parseFloat(priceDelta) || 0,
        stockLevel: parseInt(stockLevel) || 0,
        colors,
        description,
        inStock: parseInt(stockLevel) > 0,
      };

      if (editingFabric) {
        await updateFabric(editingFabric.id, payload);
      } else {
        await createFabric(payload);
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
    if (!confirm('Are you sure you want to delete this fabric from the library?')) return;
    try {
      await deleteFabric(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', header: 'Fabric Name', render: (r) => <strong style={{ color: 'var(--text)' }}>{r.name}</strong> },
    { key: 'category', header: 'Category', render: (r) => <span className="vt-chip">{r.category}</span> },
    { key: 'priceDelta', header: 'Surcharge (₹)', render: (r) => `+₹${r.priceDelta.toLocaleString('en-IN')}` },
    {
      key: 'stockLevel',
      header: 'Stock Level',
      render: (r) => (
        r.stockLevel < 10 ? (
          <span className="vt-chip danger"><FiAlertCircle size={12} /> Low Stock ({r.stockLevel})</span>
        ) : (
          <span className="vt-chip success">{r.stockLevel} units</span>
        )
      ),
    },
    { key: 'colors', header: 'Available Colors', render: (r) => r.colors || 'Standard' },
  ];

  return (
    <AdminLayout title="Fabric Library & Inventory Control" onRefresh={loadData}>
      <div className="vt-catalog-fabrics-page">
        <div className="vt-filter-bar">
          <div className="vt-filter-group">
            <h3>Fabric Inventory ({fabrics.length})</h3>
          </div>
          <button className="vt-btn vt-btn-gold" onClick={handleOpenCreate}>
            <FiPlus size={16} /> Add New Fabric
          </button>
        </div>

        {loading ? (
          <div className="vt-skeleton-table" />
        ) : (
          <DataTable
            columns={columns}
            data={fabrics}
            searchPlaceholder="Search fabric name, category, color..."
            actions={(row) => (
              <div className="vt-flex-align-gap">
                <button className="vt-btn-icon" title="Edit Fabric" onClick={() => handleOpenEdit(row)}>
                  <FiEdit2 size={15} />
                </button>
                <button className="vt-btn-icon danger" title="Delete Fabric" onClick={() => handleDelete(row.id)}>
                  <FiTrash2 size={15} />
                </button>
              </div>
            )}
          />
        )}

        {/* Modal */}
        {showModal && (
          <div className="vt-modal-backdrop">
            <div className="vt-modal-card">
              <div className="vt-modal-header">
                <h3>{editingFabric ? 'Edit Fabric Spec' : 'Add New Fabric to Library'}</h3>
                <button className="vt-close-btn" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="vt-form">
                <div className="vt-form-group mb-sm">
                  <label>Fabric Name:</label>
                  <input type="text" className="vt-input-md" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="vt-grid-2 gap-sm mb-sm">
                  <div className="vt-form-group">
                    <label>Category:</label>
                    <select className="vt-select-md" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="SHIRT">SHIRT</option>
                      <option value="PANT">PANT</option>
                      <option value="BLAZER">BLAZER</option>
                      <option value="ALL">ALL CATEGORIES</option>
                    </select>
                  </div>
                  <div className="vt-form-group">
                    <label>Surcharge Delta (₹):</label>
                    <input type="number" className="vt-input-md" value={priceDelta} onChange={e => setPriceDelta(e.target.value)} required />
                  </div>
                </div>

                <div className="vt-grid-2 gap-sm mb-sm">
                  <div className="vt-form-group">
                    <label>Inventory Stock Level:</label>
                    <input type="number" className="vt-input-md" value={stockLevel} onChange={e => setStockLevel(e.target.value)} required />
                  </div>
                  <div className="vt-form-group">
                    <label>Color Options (comma-separated):</label>
                    <input type="text" className="vt-input-md" value={colors} onChange={e => setColors(e.target.value)} />
                  </div>
                </div>

                <div className="vt-form-group mb-md">
                  <label>Fabric Description / Weave details:</label>
                  <textarea className="vt-textarea-md" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                </div>

                <div className="vt-modal-actions">
                  <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="vt-btn vt-btn-gold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Fabric Spec'}
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
