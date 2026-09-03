'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getSupportTickets, updateSupportTicket, addTicketNote, escalateTicket, getCannedResponses, createCannedResponse } from '@/lib/api';
import { FiHelpCircle, FiAlertCircle, FiMessageSquare, FiTrendingUp, FiPlus, FiCheck } from 'react-icons/fi';

const STATUS_OPTS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTS = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export default function SupportQueuePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [canned, setCanned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New Canned Response Modal
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [cannedTitle, setCannedTitle] = useState('');
  const [cannedBody, setCannedBody] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        getSupportTickets({ status: statusFilter || undefined, take: 100 }),
        getCannedResponses(),
      ]);
      setTickets(tRes.tickets || []);
      setCanned(cRes || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateSupportTicket(id, { status });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEscalate = async (id: string) => {
    setUpdatingId(id);
    try {
      await escalateTicket(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Escalation failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !noteText.trim()) return;
    try {
      await addTicketNote(selectedTicket.id, noteText);
      setNoteText('');
      await loadData();
      alert('Internal note added to ticket.');
    } catch (err: any) {
      alert(err.message || 'Note creation failed');
    }
  };

  const handleCreateCanned = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCannedResponse({ title: cannedTitle, body: cannedBody });
      setCannedTitle('');
      setCannedBody('');
      setShowCannedModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add canned template');
    }
  };

  const columns: Column<any>[] = [
    { key: 'subject', header: 'Subject / Issue', render: (r) => <strong style={{ color: 'var(--text)' }}>{r.subject}</strong> },
    { key: 'customer', header: 'Customer', render: (r) => r.customer?.name || 'Customer' },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
    {
      key: 'status',
      header: 'Status Stage',
      render: (r) => (
        <select
          className="vt-select-sm"
          value={r.status}
          disabled={updatingId === r.id}
          onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
        >
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    { key: 'createdAt', header: 'Filed On', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
  ];

  return (
    <AdminLayout title="Support Queue & Quality Escalation Workflow" onRefresh={loadData}>
      <div className="vt-support-page">
        <div className="vt-filter-bar">
          <div className="vt-filter-group">
            <label>Filter Status:</label>
            <select className="vt-select-md" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Tickets ({tickets.length})</option>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="vt-btn vt-btn-secondary" onClick={() => setShowCannedModal(true)}>
            <FiPlus size={14} /> Add Canned Template
          </button>
        </div>

        <div className="vt-grid-2-1 gap-lg">
          {/* Left Table */}
          <div className="vt-detail-main">
            {loading ? (
              <div className="vt-skeleton-table" />
            ) : (
              <DataTable
                columns={columns}
                data={tickets}
                searchPlaceholder="Search ticket subject, customer..."
                onRowClick={(row) => setSelectedTicket(row)}
                actions={(row) => (
                  <button
                    className="vt-btn vt-btn-danger vt-btn-sm"
                    disabled={updatingId === row.id || row.priority === 'URGENT'}
                    onClick={() => handleEscalate(row.id)}
                  >
                    Escalate
                  </button>
                )}
              />
            )}
          </div>

          {/* Right Ticket Inspect & Notes Drawer */}
          <div className="vt-detail-side">
            {!selectedTicket ? (
              <div className="vt-card vt-feed-empty">
                Select a ticket from the queue to view details & add internal staff notes.
              </div>
            ) : (
              <div className="vt-card">
                <div className="vt-card-header">
                  <h3>Ticket #{selectedTicket.id.slice(0, 8)}</h3>
                  <StatusBadge status={selectedTicket.priority} />
                </div>

                <div className="vt-ticket-body mb-md">
                  <div className="vt-font-medium mb-xs">{selectedTicket.subject}</div>
                  <div className="vt-text-sub mb-sm">{selectedTicket.description}</div>
                  <div className="vt-text-sub font-xs">Client: {selectedTicket.customer?.name} ({selectedTicket.customer?.email})</div>
                </div>

                {/* Internal Notes Form */}
                <form onSubmit={handleAddNote} className="vt-form">
                  <div className="vt-form-group mb-sm">
                    <label>Internal Note:</label>
                    <textarea
                      className="vt-textarea-md"
                      rows={3}
                      placeholder="Add private staff note or notes on tailor communication..."
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                    />
                  </div>

                  {/* Canned Quick Insert */}
                  {canned.length > 0 && (
                    <div className="vt-form-group mb-sm">
                      <label>Insert Canned Template:</label>
                      <select
                        className="vt-select-sm w-full"
                        onChange={(e) => setNoteText(prev => prev + (prev ? '\n' : '') + e.target.value)}
                      >
                        <option value="">Select template...</option>
                        {canned.map((c: any) => (
                          <option key={c.id} value={c.body}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button type="submit" className="vt-btn vt-btn-gold w-full">Save Internal Note</button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Canned Response Modal */}
        {showCannedModal && (
          <div className="vt-modal-backdrop">
            <div className="vt-modal-card">
              <div className="vt-modal-header">
                <h3>Add Canned Response Template</h3>
                <button className="vt-close-btn" onClick={() => setShowCannedModal(false)}>✕</button>
              </div>
              <form onSubmit={handleCreateCanned} className="vt-form">
                <div className="vt-form-group mb-sm">
                  <label>Template Title:</label>
                  <input type="text" className="vt-input-md" value={cannedTitle} onChange={e => setCannedTitle(e.target.value)} required />
                </div>
                <div className="vt-form-group mb-md">
                  <label>Template Body:</label>
                  <textarea className="vt-textarea-md" rows={4} value={cannedBody} onChange={e => setCannedBody(e.target.value)} required />
                </div>
                <div className="vt-modal-actions">
                  <button type="button" className="vt-btn vt-btn-secondary" onClick={() => setShowCannedModal(false)}>Cancel</button>
                  <button type="submit" className="vt-btn vt-btn-gold">Create Template</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
