'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { getPricingRulesAdmin, createPricingRule, updatePricingRule, deletePricingRule } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign } from 'react-icons/fi';

export default function PricingRuleEnginePage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('SHIRT');
  const [basePrice, setBasePrice] = useState('1999');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPricingRulesAdmin();
      setRules(res || []);
    } catch (err) {
      console.error('Failed to load pricing rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setName('Standard Bespoke Rule');
    setCategory('SHIRT');
    setBasePrice('1999');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        category,
        basePrice: parseFloat(basePrice) || 0,
      };

      if (editingRule) {
        await updatePricingRule(editingRule.id, payload);
      } else {
        await createPricingRule(payload);
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
    if (!confirm('Delete pricing rule?')) return;
    try {
      await deletePricingRule(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', header: 'Rule Name', render: (r) => <strong style={{ color: 'var(--text)' }}>{r.name}</strong> },
    { key: 'category', header: 'Category', render: (r) => <span className="vt-chip">{r.category}</span> },
    { key: 'basePrice', header: 'Base Garment Price (₹)', render: (r) => `₹${r.basePrice.toLocaleString('en-IN')}` },
    { key: 'createdAt', header: 'Last Updated', render: (r) => new Date(r.updatedAt || r.createdAt).toLocaleDateString('en-IN') },
  ];

  return (
    <AdminLayout title="Dynamic Pricing Rule Engine" onRefresh={loadData}>
      <div className="vt-catalog-pricing-page">
        <div className="vt-filter-bar">
          <div className="vt-filter-group">
            <h3>Active Category Base Rules ({rules.length})</h3>
          </div>
          <button className="vt-btn vt-btn-gold" onClick={handleOpenCreate}>
            <FiPlus size={16} /> Add Base Pricing Rule
          </button>
        </div>

        {loading ? (
          <div className="vt-skeleton-table" />
        ) : (
          <DataTable
            columns={columns}
            data={rules}
            searchPlaceholder="Search pricing rules..."
            actions={(row) => (
              <div className="vt-flex-align-gap">
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
                <h3>{editingRule ? 'Edit Base Rule' : 'Create Category Base Rule'}</h3>
                <button className="vt-close-btn" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="vt-form">
                <div className="vt-form-group mb-sm">
                  <label>Rule Identifier Name:</label>
                  <input type="text" className="vt-input-md" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="vt-grid-2 gap-sm mb-md">
                  <div className="vt-form-group">
                    <label>Garment Category:</label>
                    <select className="vt-select-md" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="SHIRT">SHIRT</option>
                      <option value="PANT">PANT</option>
                      <option value="BLAZER">BLAZER</option>
                    </select>
                  </div>
                  <div className="vt-form-group">
                    <label>Base Price (₹):</label>
                    <input type="number" className="vt-input-md" value={basePrice} onChange={e => setBasePrice(e.target.value)} required />
                  </div>
                </div>

                <div className="vt-modal-actions">
                  <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="vt-btn vt-btn-gold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Pricing Rule'}
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
