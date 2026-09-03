'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getGarments } from '@/lib/api';
import { FiArrowRight, FiVolume2, FiVolumeX, FiScissors, FiCheckCircle, FiUser, FiTruck } from 'react-icons/fi';

const CATS = [
  { key: 'shirt',  title: 'Shirts',  tag: 'New Collection', desc: 'Egyptian Poplin, Royal Oxford & premium Linen.', img: '/image/shirt.jpg' },
  { key: 'pant',   title: 'Pants',   tag: 'Best Seller',    desc: 'Fine Wool, Chino & Tropical weaves.', img: '/image/pant.jpg' },
  { key: 'blazer', title: 'Blazers', tag: 'Premium',        desc: 'Super 120s Wool to Luxury Velvet.', img: '/image/BLAZER.jpg' },
];
const HIW = [
  { icon:'👕', step:'01', title:'Choose Garment', desc:'Shirts, pants or blazers' },
  { icon:'✂️', step:'02', title:'Customize',      desc:'Style, fabric & colour' },
  { icon:'📏', step:'03', title:'Measurements',   desc:'Standard or AI body scan' },
  { icon:'🧵', step:'04', title:'Pick Tailor',    desc:'From expert craftsmen' },
  { icon:'💳', step:'05', title:'Pay Securely',   desc:'Razorpay checkout' },
  { icon:'📦', step:'06', title:'Track & Receive',desc:'Live order tracking' },
];
const REVIEWS = [
  { name:'Arjun Menon',    role:'Marketing Director, Bangalore', init:'AM', text:'The blazer fits like it was built for me — because it was. Stunning quality and the AI scan is surprisingly precise.' },
  { name:'Priya Sharma',   role:'Consultant, Mumbai',            init:'PS', text:'Three custom shirts and every one is perfect. Fabric swatches made choosing effortless and delivery was ahead of schedule.' },
  { name:'Rahul Krishnan', role:'Founder, Hyderabad',            init:'RK', text:'Bespoke Gurkha trousers in Tropical Wool turned around in 5 days. Simply exquisite. Ordering every month now.' },
];
const VALUES = [
  { icon:<FiScissors size={22}/>, title:'Expert Tailors',  desc:'Vetted craftsmen with 10+ years experience' },
  { icon:<FiCheckCircle size={22}/>, title:'Quality Check', desc:'Every garment inspected before dispatch' },
  { icon:<FiUser size={22}/>,       title:'AI Measurements',desc:'Precision body-scanning technology' },
  { icon:<FiTruck size={22}/>,      title:'Fast Delivery',  desc:'5–10 business days nationwide' },
];

export default function HomePage() {
  const [muted, setMuted] = useState(true);
  const [garments, setGarments] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addToCart } = useApp();

  useEffect(() => { getGarments().then(setGarments).catch(() => {}); }, []);

  const toggleMute = () => {
    if (videoRef.current) { videoRef.current.muted = !muted; setMuted(!muted); }
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
  <video
    ref={videoRef}
    className="hero-video"
    autoPlay
    muted={muted}
    loop
    playsInline
    preload="auto"
  >
    <source src="/video/promo.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  <div className="hero-overlay" />

  <div className="hero-content">
    <h1 className="hero-title">
      Tailored for <span className="gold">Your Story</span>
    </h1>

    <p className="hero-sub">
      Bespoke shirts, pants &amp; blazers. AI-powered measurements,
      expert craftsmanship, and premium tailoring delivered to your door.
    </p>

    <div className="hero-btns">
      <Link href="/categories/shirt" className="btn btn-primary btn-lg">
        Shop Now <FiArrowRight />
      </Link>

      <Link href="/customize/shirt" className="btn btn-outline btn-lg">
        Customize Yours
      </Link>
    </div>
  </div>

  <button
    className="hero-mute"
    onClick={toggleMute}
    aria-label={muted ? "Unmute video" : "Mute video"}
  >
    {muted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
  </button>
</section>

      {/* ── CATEGORY TILES ── */}
      <section className="cats-section">
        <div className="cats-header">
          <span className="sec-label">Collections</span>
          <h2 className="sec-title">Explore Our Range</h2>
          <p className="sec-sub">Three categories, infinite possibilities — each fully customizable.</p>
        </div>
        <div className="cats-grid">
          {CATS.map(c => (
            <Link key={c.key} href={`/categories/${c.key}`} className="cat-card">
              <img src={c.img} alt={c.title} onError={(e)=>{ (e.target as HTMLImageElement).src='/image/shirt.jpg'; }} />
              <div className="cat-overlay" />
              <div className="cat-content">
                <span className="cat-tag">{c.tag}</span>
                <h3 className="cat-name">{c.title}</h3>
                <p className="cat-desc">{c.desc}</p>
                <span className="cat-cta">Explore {c.title} <FiArrowRight /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {garments.length > 0 && (
        <section className="products-section">
          <div style={{ marginBottom:32 }}>
            <span className="sec-label">Ready to Wear</span>
            <h2 className="sec-title">Featured Styles</h2>
          </div>
          <div className="product-grid">
            {garments.slice(0,6).map((g: any) => (
              <div key={g.id} className="product-card">
                <div className="product-img-wrap">
                  <img src={g.imageUrl} alt={g.name} onError={(e)=>{ (e.target as HTMLImageElement).src='/image/shirt.jpg'; }} />
                  <span className="product-badge">{g.category}</span>
                  <button className="product-wishlist" aria-label="Wishlist">♡</button>
                </div>
                <div className="product-info">
                  <div className="product-fabric">{g.fabricName}</div>
                  <h3 className="product-name">{g.name}</h3>
                  <p className="product-desc">{g.description}</p>
                  <div className="product-footer">
                    <div className="product-price"><span className="cur">₹</span>{g.basePrice.toLocaleString('en-IN')}</div>
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart({ id:g.id, name:g.name, category:g.category, price:g.basePrice, quantity:1, imageUrl:g.imageUrl, isCustom:false, preDesignedId:g.id })}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:38 }}>
            <Link href="/categories/shirt" className="btn btn-gold-outline">View All Styles <FiArrowRight /></Link>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="hiw-section">
        <div className="hiw-header">
          <span className="sec-label">Process</span>
          <h2 className="sec-title">How It Works</h2>
          <p className="sec-sub">From click to wardrobe — your garment, your way.</p>
        </div>
        <div className="hiw-grid">
          {HIW.map(h => (
            <div key={h.step} className="hiw-step">
              <div className="hiw-icon">{h.icon}</div>
              <div className="hiw-num">Step {h.step}</div>
              <div className="hiw-title">{h.title}</div>
              <div className="hiw-desc">{h.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUE PROPS ── */}
      <section className="value-section">
        <div className="value-grid">
          {VALUES.map((v,i) => (
            <div key={i} className="value-item">
              <div className="value-icon">{v.icon}</div>
              <h4 className="value-title">{v.title}</h4>
              <p className="value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="cta-strip">
        <span className="sec-label">Exclusive</span>
        <h2 className="sec-title" style={{ marginBottom:12 }}>Craft Your Signature Look</h2>
        <p style={{ color:'var(--text-2)', marginBottom:28 }}>Fabric, fit, style, and tailor — all in your control.</p>
        <Link href="/customize/shirt" className="btn btn-primary btn-lg">Start Customizing <FiArrowRight /></Link>
      </section>
    </>
  );
}
