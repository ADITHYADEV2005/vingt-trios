'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartnerWebRootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/partner');
  }, [router]);

  return (
    <div className="vt-admin-loading-screen">
      <div className="vt-spinner" />
      <p>Redirecting to Vingt Trios Partner Network Console (Port 3002)...</p>
    </div>
  );
}
