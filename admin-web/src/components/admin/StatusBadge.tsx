import React from 'react';

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  PAID: { label: 'PAID', class: 'badge-paid' },
  ASSIGNED: { label: 'ASSIGNED', class: 'badge-assigned' },
  PRODUCTION: { label: 'IN PRODUCTION', class: 'badge-production' },
  QC: { label: 'QUALITY CHECK', class: 'badge-qc' },
  SHIPPED: { label: 'SHIPPED', class: 'badge-shipped' },
  DELIVERED: { label: 'DELIVERED', class: 'badge-delivered' },
  CANCELLED: { label: 'CANCELLED', class: 'badge-cancelled' },
  PENDING: { label: 'PENDING', class: 'badge-pending' },
  APPROVED: { label: 'APPROVED', class: 'badge-approved' },
  REJECTED: { label: 'REJECTED', class: 'badge-rejected' },
  OPEN: { label: 'OPEN', class: 'badge-open' },
  IN_PROGRESS: { label: 'IN PROGRESS', class: 'badge-in-progress' },
  RESOLVED: { label: 'RESOLVED', class: 'badge-resolved' },
  CLOSED: { label: 'CLOSED', class: 'badge-closed' },
  URGENT: { label: 'URGENT', class: 'badge-urgent' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || { label: status, class: 'badge-default' };
  return (
    <span className={`vt-status-badge ${config.class}`}>
      {config.label}
    </span>
  );
}
