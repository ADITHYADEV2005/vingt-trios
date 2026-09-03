import React from 'react';
import { FiCheckCircle, FiClock, FiTruck, FiPackage, FiScissors, FiDollarSign } from 'react-icons/fi';

interface TimelineItem {
  id: string;
  status: string;
  note?: string;
  actorName?: string;
  createdAt: string;
}

const ICON_MAP: Record<string, any> = {
  PAID: FiDollarSign,
  ASSIGNED: FiScissors,
  PRODUCTION: FiPackage,
  QC: FiCheckCircle,
  SHIPPED: FiTruck,
  DELIVERED: FiCheckCircle,
  CANCELLED: FiClock,
};

export function OrderTimeline({ timeline }: { timeline: TimelineItem[] }) {
  if (!timeline || timeline.length === 0) {
    return <div className="vt-timeline-empty">No timeline recorded yet.</div>;
  }

  return (
    <div className="vt-timeline">
      {timeline.map((item, idx) => {
        const Icon = ICON_MAP[item.status] || FiClock;
        const isLast = idx === timeline.length - 1;

        return (
          <div key={item.id} className={`vt-timeline-item ${isLast ? 'active' : ''}`}>
            <div className="vt-timeline-marker">
              <div className="vt-timeline-icon">
                <Icon size={13} />
              </div>
              {!isLast && <div className="vt-timeline-line" />}
            </div>

            <div className="vt-timeline-content">
              <div className="vt-timeline-header">
                <span className="vt-timeline-status">{item.status}</span>
                <span className="vt-timeline-date">{new Date(item.createdAt).toLocaleString('en-IN')}</span>
              </div>
              {item.note && <div className="vt-timeline-note">{item.note}</div>}
              {item.actorName && <div className="vt-timeline-actor">Logged by {item.actorName}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
