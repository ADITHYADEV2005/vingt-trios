import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4">

      {/* Hero */}
      <section className="py-24 text-center">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">
          Made to measure
        </p>
        <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Clothing that fits<br />exactly you
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Design every detail. Enter your measurements. A skilled tailor builds it perfectly — delivered to your door.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/catalog" className="bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-700">
            Browse Catalog
          </Link>
          <Link href="/register" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50">
            Create Account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="text-3xl mb-4">📐</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your exact measurements</h3>
          <p className="text-gray-500 text-sm">Save your body measurements once. Every garment is cut to your precise dimensions.</p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="text-3xl mb-4">✂️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Design every detail</h3>
          <p className="text-gray-500 text-sm">Choose collar, cuff, buttons, fabric, and embroidery. Your garment, your choices.</p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="text-3xl mb-4">🌿</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Eco-Luxury fabrics</h3>
          <p className="text-gray-500 text-sm">Premium deadstock fabrics from luxury fashion houses — sustainable and exclusive.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center bg-gray-900 rounded-3xl mb-16 px-8">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to wear what is yours?</h2>
        <p className="text-gray-400 mb-8">Start with your measurements. Choose your fabric. We handle the rest.</p>
        <Link href="/register" className="bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-100">
          Start designing
        </Link>
      </section>

    </div>
  );
}
