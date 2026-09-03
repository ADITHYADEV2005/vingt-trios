'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getPublicDesignerStorefront, toggleFollowDesigner } from '@/lib/api';
import {
  FiCompass, FiUsers, FiStar, FiExternalLink,
  FiSliders, FiCheckCircle, FiHeart
} from 'react-icons/fi';

export default function PublicDesignerStorefrontPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const designerProfileId = resolvedParams.id;
  const router = useRouter();
  const { isLoggedIn } = useApp();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPublicDesignerStorefront(designerProfileId);
      setProfile(res);
      setFollowersCount(res.followersCount || 0);
    } catch (err) {
      console.error('Failed to load storefront:', err);
    } finally {
      setLoading(false);
    }
  }, [designerProfileId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    try {
      const res = await toggleFollowDesigner(designerProfileId);
      setFollowing(res.following);
      setFollowersCount(prev => res.following ? prev + 1 : prev - 1);
    } catch (err: any) {
      alert(err.message || 'Follow action failed');
    }
  };

  if (loading) {
    return (
      <div className="vt-container my-xl">
        <div className="vt-skeleton-card" style={{ height: '300px' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="vt-container my-xl text-center">
        <h2>Designer Profile Not Found</h2>
      </div>
    );
  }

  const catalogItems = profile.catalogItems || [];

  return (
    <div className="vt-public-storefront-page">
      {/* Hero Header */}
      <section className="vt-storefront-hero">
        <div className="vt-container">
          <div className="vt-storefront-hero-content">
            <div className="vt-storefront-avatar">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'D'}
            </div>

            <div className="vt-storefront-info">
              <h1 className="vt-storefront-title">{profile.brandName || profile.name}</h1>
              <div className="vt-storefront-subtitle">Designed by <strong className="vt-gold-text">{profile.name}</strong></div>
              <div className="vt-storefront-tag mt-xs">{profile.specialization}</div>
              <p className="vt-storefront-bio mt-sm">{profile.bio || 'Creating original bespoke tailoring patterns for Vingt Trios.'}</p>

              <div className="vt-flex-align-gap mt-md">
                <button
                  className={`vt-btn ${following ? 'vt-btn-secondary' : 'vt-btn-gold'}`}
                  onClick={handleFollowToggle}
                >
                  <FiHeart size={14} fill={following ? 'var(--gold)' : 'none'} />
                  <span>{following ? 'Following' : 'Follow Designer'}</span>
                  <span className="vt-chip font-xs ml-xs">{followersCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Gallery */}
      <section className="vt-container my-xl">
        <div className="vt-section-head mb-lg">
          <h2>Approved Atelier Designs ({catalogItems.length})</h2>
          <p className="vt-text-sub">Select an original design to customize with your measurements.</p>
        </div>

        {catalogItems.length === 0 ? (
          <div className="vt-card vt-feed-empty">
            No live approved designs published yet. Check back soon!
          </div>
        ) : (
          <div className="vt-grid-3 gap-md">
            {catalogItems.map((item: any) => (
              <div key={item.id} className="vt-card vt-design-portfolio-card">
                <div className="vt-design-img-wrapper">
                  <img
                    src={item.mockupImageUrl || '/image/BLAZER.jpg'}
                    alt={item.title}
                    onError={(e: any) => { e.target.src = '/image/shirt.jpg'; }}
                  />
                </div>

                <div className="vt-design-card-body mt-sm">
                  <h4 className="vt-font-medium vt-gold-text">{item.title}</h4>
                  <div className="vt-text-sub font-xs my-xs">{item.description}</div>

                  <div className="vt-flex-align-gap justify-between mt-md">
                    <span className="vt-chip">{item.category}</span>
                    <button
                      className="vt-btn vt-btn-gold vt-btn-sm"
                      onClick={() => router.push(`/customize/${item.category.toLowerCase()}`)}
                    >
                      <FiSliders size={13} /> Customize Garment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
