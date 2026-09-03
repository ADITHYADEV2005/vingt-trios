'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiCheckCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { getNotifications, markNotificationRead } from '@/lib/api';

export function AdminTopBar({ title, onRefresh }: { title: string; onRefresh?: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    loadNotifs();
  }, []);

  const loadNotifs = async () => {
    try {
      setLoadingNotifs(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      // Ignore background errors
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="vt-admin-topbar">
      {/* Page Title & Breadcrumb */}
      <div className="vt-topbar-left">
        <h1 className="vt-topbar-title">{title}</h1>
        <div className="vt-topbar-badge">SYSTEM SECURED</div>
      </div>

      {/* Actions */}
      <div className="vt-topbar-right">
        {onRefresh && (
          <button className="vt-icon-action-btn" title="Refresh Page Data" onClick={onRefresh}>
            <FiRefreshCw size={15} />
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="vt-notif-wrapper">
          <button
            className={`vt-icon-action-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifs(!showNotifs)}
            title="System Alerts"
          >
            <FiBell size={16} />
            {unreadCount > 0 && <span className="vt-notif-count">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div className="vt-notif-dropdown">
              <div className="vt-notif-header">
                <span>System Notifications ({notifications.length})</span>
                <button className="vt-text-btn" onClick={loadNotifs}>Refresh</button>
              </div>

              <div className="vt-notif-list">
                {notifications.length === 0 ? (
                  <div className="vt-notif-empty">No alerts at this time</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`vt-notif-item ${n.read ? 'read' : 'unread'}`}>
                      <div className="vt-notif-content">
                        <div className="vt-notif-item-title">{n.title}</div>
                        <div className="vt-notif-item-msg">{n.message}</div>
                        <div className="vt-notif-item-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {!n.read && (
                        <button className="vt-notif-check" onClick={() => handleRead(n.id)}>
                          <FiCheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Site Link */}
        <a href="/" target="_blank" rel="noopener noreferrer" className="vt-live-site-link">
          <span>Live Store</span>
          <FiExternalLink size={13} />
        </a>
      </div>
    </header>
  );
}
