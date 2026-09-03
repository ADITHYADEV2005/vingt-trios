import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Vingt Trios — AI-Powered Custom Formalwear',
  description: 'Premium custom shirts, pants & blazers. AI body scan, expert tailors, Razorpay-secured checkout.',
  keywords: 'custom shirts, bespoke suits, tailored pants, blazers, made to measure India',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <Navbar />
          <div className="page">{children}</div>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
