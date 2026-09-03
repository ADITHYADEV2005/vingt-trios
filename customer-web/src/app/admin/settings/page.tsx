'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { getAdminAccounts, updateAdminRole, request2FA, verify2FA } from '@/lib/api';
import { FiSliders, FiShield, FiKey, FiUserCheck, FiCheckCircle } from 'react-icons/fi';

const ADMIN_ROLES = ['SUPER_ADMIN', 'SUPPORT', 'FINANCE', 'CATALOG'];

export default function AdminSettingsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 2FA State
  const [otpStep, setOtpStep] = useState<'idle' | 'requested'>('idle');
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminAccounts();
      setAccounts(res || []);
    } catch (err) {
      console.error('Failed to load admin accounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdminRoleChange = async (userId: string, adminRole: string) => {
    setUpdatingId(userId);
    try {
      await updateAdminRole(userId, adminRole);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Admin role update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRequestOtp = async () => {
    setOtpLoading(true);
    try {
      await request2FA();
      setOtpStep('requested');
      alert('2FA Verification OTP dispatched to server log & email!');
    } catch (err: any) {
      alert(err.message || 'OTP request failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    try {
      await verify2FA({ otp: otpInput });
      setOtpVerified(true);
      setOtpStep('idle');
      alert('2FA Multi-Factor Authentication Verified!');
    } catch (err: any) {
      alert(err.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', header: 'Staff Member Name', render: (r) => <strong style={{ color: 'var(--text)' }}>{r.name}</strong> },
    { key: 'email', header: 'Email Address', render: (r) => r.email },
    {
      key: 'adminRole',
      header: 'Sub-Account Scope Role',
      render: (r) => (
        <select
          className="vt-select-sm"
          value={r.adminRole || 'SUPER_ADMIN'}
          disabled={updatingId === r.id}
          onChange={(e) => handleAdminRoleChange(r.id, e.target.value)}
        >
          {ADMIN_ROLES.map(role => (
            <option key={role} value={role}>{role.replace('_', ' ')}</option>
          ))}
        </select>
      ),
    },
    { key: 'createdAt', header: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
  ];

  return (
    <AdminLayout title="System Settings & Staff Role-Based Access Control" onRefresh={loadData}>
      <div className="vt-settings-page">
        <div className="vt-grid-2 gap-lg mb-lg">
          {/* Staff Sub-Accounts Card */}
          <div className="vt-card">
            <div className="vt-card-header">
              <h3><FiShield size={16} /> Role-Based Sub-Accounts ({accounts.length})</h3>
            </div>
            <p className="vt-text-sub mb-md">
              Configure permission scopes for staff members: Super Admin, Support Staff, Finance, and Catalog Manager.
            </p>
            {loading ? (
              <div className="vt-skeleton-table" />
            ) : (
              <DataTable
                columns={columns}
                data={accounts}
                searchPlaceholder="Search staff name..."
              />
            )}
          </div>

          {/* 2FA Multi-Factor Security Card */}
          <div className="vt-card">
            <div className="vt-card-header">
              <h3><FiKey size={16} /> Two-Factor Authentication (2FA)</h3>
            </div>
            <p className="vt-text-sub mb-md">
              Secure your administrator account with Email OTP Multi-Factor Verification.
            </p>

            {otpVerified ? (
              <div className="vt-alert-banner success">
                <FiCheckCircle size={18} />
                <span>2FA Session Active & Verified</span>
              </div>
            ) : otpStep === 'idle' ? (
              <div className="vt-2fa-box">
                <button
                  className="vt-btn vt-btn-gold"
                  onClick={handleRequestOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Generating OTP...' : 'Enable / Request 2FA OTP Code'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="vt-form">
                <div className="vt-form-group mb-md">
                  <label>Enter 6-Digit OTP Code:</label>
                  <input
                    type="text"
                    className="vt-input-md"
                    placeholder="e.g. 123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="vt-btn vt-btn-gold" disabled={otpLoading}>
                  {otpLoading ? 'Verifying OTP...' : 'Verify 2FA OTP Code'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
