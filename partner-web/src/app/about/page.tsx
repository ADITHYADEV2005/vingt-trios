'use client';
import Link from 'next/link';
import { FiTarget, FiHeart, FiAward, FiShield, FiArrowLeft } from 'react-icons/fi';

const TEAM = [
  // Row 1: Midhun & Vismaya
  { name: 'Midhun S Mohan', role: 'CEO & Founder', avatar: 'M', img: '/image/CEO AND FOUNDER.jpg', bio: 'Visionary strategist leading Vingt Trios with a passion for architectural fashion and premium tailoring technology. Midhun oversees overall company direction and brand legacy.' },
  { name: 'Vismaya', role: 'Chief Financial Officer', avatar: 'V', img: '/image/CFO.png',bio: 'Financial mastermind ensuring healthy fiscal operations, sustainable scaling, and premium resource allocation to match our growth standards.' },
  // Row 2: Adithya Dev & L Sai Likitha
  { name: 'Adithya Dev', role: 'CTO & Co-Founder', avatar: 'A', img: '/image/CTO.jpeg',bio: 'Lead systems engineer designing the AI body scan algorithm, real-time tailor assignment queue, and interactive customization engine.' },
  { name: 'L Sai Likitha', role: 'Chief Operating Officer', avatar: 'L', img: '/image/COO.png', bio: 'Operations director coordinating designer-tailor workflows, quality compliance checks, and seamless global logistics.' },
  // Row 3: Sreejith S & Nayana S Prasad
  { name: 'Sreejith S', role: 'CMO & Co-Founder', avatar: 'S', bio: 'Digital storyteller curating global marketing campaigns, premium branding partnerships, and customized experience circles.' },
  { name: 'Nayana S Prasad', role: 'Chief Design Officer', avatar: 'N', bio: 'Haute couture specialist leading style collections, fabric curation, and designer onboarding protocols.' },
];

export default function AboutPage() {
  return (
    <div style={{ padding: '56px 40px 100px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Back button */}
      <Link href="/" className="btn btn-outline btn-sm" style={{ marginBottom: 32 }}>
        <FiArrowLeft /> Back to Home
      </Link>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <span className="sec-label">Our Story</span>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,5vw,4.2rem)', fontWeight: 900, color: 'white', marginBottom: 18 }}>
          Vingt <span style={{ color: 'var(--gold)' }}>Trios</span>
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.75 }}>
          Founded in 2026, Vingt Trios was built on a simple yet powerful premise: luxury tailoring should be accessible, precise, and custom-designed for every individual. By combining high-definition AI body-scanning technology with legacy handcraftsmanship, we deliver bespoke perfection directly to your doorstep.
        </p>
      </div>

      {/* Mission / Values Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 72 }}>
        <div style={{ padding: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--gold)', marginBottom: 14 }}>
            <FiTarget size={20} />
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'white' }}>Our Mission</h3>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.65 }}>
            To democratize haute couture by bridging ancient tailoring heritage with cutting-edge AI technologies, ensuring every garment feels like a second skin.
          </p>
        </div>
        <div style={{ padding: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--gold)', marginBottom: 14 }}>
            <FiHeart size={20} />
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'white' }}>Our Vision</h3>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.65 }}>
            To become the premier global custom wardrobe platform, championing ethical craftsman compensation, absolute zero-waste sizing, and sustainable slow-fashion longevity.
          </p>
        </div>
      </div>

      {/* Company Details */}
      <div style={{ marginBottom: 80 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', color: 'white', marginBottom: 20, textAlign: 'center' }}>
          Crafting the Future of Bespoke
        </h2>
        <div style={{ color: 'var(--text-2)', fontSize: '.95rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p>
            Vingt Trios represents a group of master tailors, digital artists, and systems engineers collaborating under a singular label. Unlike traditional clothing manufacturers that produce millions of standard-sized garments that end up in landfills, Vingt Trios creates every piece individually upon order. 
          </p>
          <p>
            Our fabrics are sourced from the finest mills across Italy, India, and England, featuring Egyptian cotton poplins, super worsted wools, and organic linen. Every cut is reviewed by a dedicated digital fashion designer before being assigned to one of our master tailors. We support and empower local artisan tailors, providing fair-wage premiums and a state-of-the-art digital storefront.
          </p>
        </div>
      </div>

      {/* ── Team Section (2-Column Rows Grid) ── */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="sec-label">Leadership</span>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.4rem', color: 'white' }}>
            Meet the Executive Board
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: '.92rem' }}>
            The leaders steering Vingt Trios toward digital and sartorial excellence.
          </p>
        </div>

        {/* 2-column grid representing the pairs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {TEAM.map((m, i) => (
            <div key={i} className="dash-stat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '36px 28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', transition: 'border-color var(--t)' }}>
              <div style={{
                width: 110, height: 110, borderRadius: '50%',
                background: 'var(--gold-subtle)', border: '2px solid var(--border-g)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Playfair Display',serif", fontSize: '2.5rem', fontWeight: 700, color: 'var(--gold)',
                marginBottom: 20, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}>
                {m.img ? (
                  <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  m.avatar
                )}
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>
                {m.name}
              </h3>
              <div style={{ color: 'var(--gold)', fontSize: '.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
                {m.role}
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: '.86rem', lineHeight: 1.65, maxWidth: '340px' }}>
                {m.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
