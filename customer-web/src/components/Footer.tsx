'use client';
import Link from 'next/link';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <img src="/image/VINGT TRIOS.png" alt="" style={{ height: 38, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
              Vingt <span style={{ color: 'var(--gold)' }}>Trios</span>
            </span>
          </div>
          <p className="footer-brand-desc">
            Premium AI-powered custom formalwear. Every garment crafted to your exact measurements by expert tailors.
          </p>
          <div className="footer-socials" style={{ marginTop: 18 }}>
            {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
              <a key={i} href="#" className="footer-social-btn"><Icon size={13} /></a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="footer-heading">Shop</h4>
          <div className="footer-links">
            <Link href="/categories/shirt"  className="footer-link">Custom Shirts</Link>
            <Link href="/categories/pant"   className="footer-link">Custom Pants</Link>
            <Link href="/categories/blazer" className="footer-link">Custom Blazers</Link>
            <Link href="/customize/shirt"   className="footer-link">Design Your Own</Link>
          </div>
        </div>
        <div>
          <h4 className="footer-heading">Company</h4>
          <div className="footer-links">
            <Link href="/about" className="footer-link">About Us</Link>
            <a href="#" className="footer-link">Our Tailors</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Press</a>
          </div>
        </div>
        <div>
          <h4 className="footer-heading">Support</h4>
          <div className="footer-links">
            <a href="#" className="footer-link">Size Guide</a>
            <a href="#" className="footer-link">Shipping</a>
            <a href="#" className="footer-link">Returns</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <a href="mailto:hello@vingttrios.com" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiMail size={12} /> hello@vingttrios.com
            </a>
            <a href="tel:+918000000000" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiPhone size={12} /> +91 80000 00000
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copy">© 2026 Vingt Trios. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 18 }}>
          <a href="#" className="footer-link" style={{ fontSize: '.76rem' }}>Privacy</a>
          <a href="#" className="footer-link" style={{ fontSize: '.76rem' }}>Terms</a>
        </div>
      </div>
    </footer>
  );
}
