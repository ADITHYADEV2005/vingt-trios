'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getGarments } from '@/lib/api';
import { FiArrowRight, FiFilter, FiX } from 'react-icons/fi';

const META: Record<string, { title: string; desc: string; img: string }> = {
  shirt:  { title: 'Shirts',  desc: 'Formal and semi-formal shirts cut to your measurements.', img: '/image/shirt.jpg' },
  pant:   { title: 'Pants',   desc: 'Precision-cut trousers in fine wools, chinos & tropical weaves.', img: '/image/pant.jpg' },
  blazer: { title: 'Blazers', desc: 'Single, double-breasted and tuxedo jackets in premium fabrics.', img: '/image/BLAZER.jpg' },
};

export default function CategoryPage() {
  const params  = useParams();
  const slug    = (params.category as string)?.toLowerCase() || 'shirt';
  const catEnum = slug.toUpperCase();
  const meta    = META[slug] || META.shirt;
  const { addToCart } = useApp();

  const [garments, setGarments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [fits,     setFits]     = useState<string[]>([]);
  const [selFits,  setSelFits]  = useState<string[]>([]);
  const [minP,     setMinP]     = useState('');
  const [maxP,     setMaxP]     = useState('');

  useEffect(() => {
    setLoading(true);
    setSelFits([]); setMinP(''); setMaxP('');
    getGarments(catEnum)
      .then(d => { setGarments(d); setFits([...new Set<string>(d.map((g: any) => g.fit))]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catEnum]);

  const filtered = garments.filter(g => {
    if (selFits.length && !selFits.includes(g.fit)) return false;
    if (minP && g.basePrice < +minP) return false;
    if (maxP && g.basePrice > +maxP) return false;
    return true;
  });

  const toggleFit = (f: string) =>
    setSelFits(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);

  return (
    <>
      {/* Hero */}
      <div className="cat-hero" style={{ backgroundImage: `url(${meta.img})` }}>
        <div className="cat-hero-overlay" />
        <div className="cat-hero-content">
          <span className="sec-label">Collections</span>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2.2rem,5vw,3.8rem)', fontWeight:900, color:'white', marginBottom:10 }}>
            {meta.title}
          </h1>
          <p style={{ color:'rgba(255,255,255,.65)', fontSize:'1rem', maxWidth:480 }}>{meta.desc}</p>
        </div>
      </div>

      {/* Customize CTA bar */}
      <div className="cat-cta-bar">
        <div>
          <h3 style={{ fontFamily:"'Playfair Display',serif", color:'var(--text)', fontSize:'1.1rem', marginBottom:3 }}>
            🎨 Can't find what you want?
          </h3>
          <p style={{ color:'var(--text-2)', fontSize:'.84rem' }}>Design your own — fabric, style, measurements, colour.</p>
        </div>
        <Link href={`/customize/${slug}`} className="btn btn-primary">
          Customize Your {meta.title.slice(0,-1)} <FiArrowRight />
        </Link>
      </div>

      {/* Layout */}
      <div className="cat-page">
        {/* Filters */}
        <aside className="filter-panel">
          <div className="filter-title"><FiFilter style={{ display:'inline', marginRight:6 }} />Filters</div>

          {fits.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-label">Fit</div>
              <div className="filter-opts">
                {fits.map(f => (
                  <label key={f} className="filter-opt">
                    <input type="checkbox" checked={selFits.includes(f)} onChange={() => toggleFit(f)} />
                    <span className="filter-opt-label">{f}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="filter-group">
            <div className="filter-group-label">Price Range (₹)</div>
            <div className="filter-price">
              <input className="filter-price-input" type="number" placeholder="Min" value={minP} onChange={e => setMinP(e.target.value)} />
              <input className="filter-price-input" type="number" placeholder="Max" value={maxP} onChange={e => setMaxP(e.target.value)} />
            </div>
          </div>

          {(selFits.length || minP || maxP) ? (
            <button className="btn btn-gold-outline btn-sm" style={{ width:'100%', marginTop:8 }}
              onClick={() => { setSelFits([]); setMinP(''); setMaxP(''); }}>
              <FiX /> Clear Filters
            </button>
          ) : null}
        </aside>

        {/* Grid */}
        <div>
          <p style={{ color:'var(--text-3)', fontSize:'.85rem', marginBottom:18 }}>
            {loading ? 'Loading…' : `${filtered.length} style${filtered.length !== 1 ? 's' : ''} found`}
          </p>

          {loading ? (
            <div className="product-grid">
              {Array.from({length:6}).map((_,i) => (
                <div key={i} className="product-card">
                  <div className="skeleton" style={{ height:300 }} />
                  <div style={{ padding:14 }}>
                    <div className="skeleton" style={{ height:13, marginBottom:8 }} />
                    <div className="skeleton" style={{ height:17, width:'70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👗</div>
              <h2 className="empty-title">No styles found</h2>
              <p className="empty-desc">Adjust your filters or design your own.</p>
              <Link href={`/customize/${slug}`} className="btn btn-primary">Customize Your Own <FiArrowRight /></Link>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((g: any) => (
                <div key={g.id} className="product-card">
                  <div className="product-img-wrap">
                    <img src={g.imageUrl} alt={g.name} onError={(e)=>{ (e.target as HTMLImageElement).src='/image/shirt.jpg'; }} />
                    <span className="product-badge">{g.fit}</span>
                    <button className="product-wishlist" aria-label="Wishlist">♡</button>
                  </div>
                  <div className="product-info">
                    <div className="product-fabric">{g.fabricName} · {g.color}</div>
                    <h3 className="product-name">{g.name}</h3>
                    <p className="product-desc">{g.description}</p>
                    <div className="product-footer">
                      <div className="product-price"><span className="cur">₹</span>{g.basePrice.toLocaleString('en-IN')}</div>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => addToCart({ id:g.id, name:g.name, category:g.category, price:g.basePrice, quantity:1, imageUrl:g.imageUrl, isCustom:false, preDesignedId:g.id })}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
