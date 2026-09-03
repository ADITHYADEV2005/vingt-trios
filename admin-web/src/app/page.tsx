'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminWebRootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="vt-admin-loading-screen">
      <div className="vt-spinner" />
      <p>Redirecting to Vingt Trios Admin Control Center (Port 3001)...</p>
    </div>
  );
}
