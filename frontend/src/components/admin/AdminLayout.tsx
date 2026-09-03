'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

export function AdminLayout({
  children,
  title = 'Admin Operations',
  onRefresh,
}: {
  children: React.ReactNode;
  title?: string;
  onRefresh?: () => void;
}) {
  const { user, isLoggedIn, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    // Verify admin role
    if (user?.role !== 'ADMIN') {
      router.push('/profile');
      return;
    }
    setAuthorized(true);
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !authorized) {
    return (
      <div className="vt-admin-loading-screen">
        <div className="vt-spinner" />
        <p>Verifying Security Credentials...</p>
      </div>
    );
  }

  return (
    <div className="vt-admin-wrapper">
      <AdminSidebar user={user} onLogout={logout} />
      <div className="vt-admin-main-container">
        <AdminTopBar title={title} onRefresh={onRefresh} />
        <main className="vt-admin-content-pane">
          {children}
        </main>
      </div>
    </div>
  );
}
