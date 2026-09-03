'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { FiTrash2, FiArrowRight, FiShoppingCart } from 'react-icons/fi';

declare global { interface Window { Razorpay: any; } }

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartTotal, isLoggedIn, user, token } = useApp();
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000'}/orders/create-payment`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map(i=>({ name:i.name, category:i.category, price:i.price, quantity:i.quantity, isCustom:i.isCustom, preDesignedId:i.preDesignedId, customSpec:i.customSpec })),
          tailorId: cart.find(i=>i.tailorId)?.tailorId,
        }),
      });
      const data = await res.json();

      if (data.isMockMode) {
        // Simulate success
        await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000'}/orders/verify-payment`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
          body: JSON.stringify({ razorpayOrderId:data.razorpayOrderId, razorpayPaymentId:`mock_pay_${Date.now()}`, items:cart, tailorId:cart.find(i=>i.tailorId)?.tailorId, totalPrice:data.amount }),
        });
        clearCart(); router.push('/orders');
        return;
      }

      // Real Razorpay
      const script = document.createElement('script');
      script.src   = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rz = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          amount: data.amount * 100,
          currency:'INR',
          name:'Vingt Trios',
          description:'Custom Formalwear Order',
          order_id: data.razorpayOrderId,
          handler: async (resp: any) => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000'}/orders/verify-payment`, {
              method:'POST',
              headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
              body: JSON.stringify({ ...resp, items:cart, tailorId:cart.find(i=>i.tailorId)?.tailorId, totalPrice:data.amount }),
            });
            clearCart(); router.push('/orders');
          },
          prefill:{ name:user?.name, email:user?.email },
          theme:{ color:'#ECBB0D' },
        });
        rz.open();
      };
      document.body.appendChild(script);
    } catch(e:any) { alert(e.message||'Checkout failed'); }
    finally { setLoading(false); }
  };

  if (cart.length === 0) return (
    <div className="empty" style={{ padding:'100px 20px' }}>
      <div className="empty-icon"><FiShoppingCart size={52}/></div>
      <h2 className="empty-title">Your cart is empty</h2>
      <p className="empty-desc">Browse our collections or design your own garment.</p>
      <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
        <Link href="/categories/shirt" className="btn btn-primary">Browse Shirts <FiArrowRight/></Link>
        <Link href="/customize/shirt"  className="btn btn-outline">Customize <FiArrowRight/></Link>
      </div>
    </div>
  );

  return (
    <div className="cart-layout">
      {/* Items */}
      <div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', color:'var(--text)', marginBottom:26 }}>
          Shopping Cart <span style={{ fontSize:'1rem', color:'var(--text-3)', fontFamily:'Inter,sans-serif' }}>({cart.length})</span>
        </h1>
        {cart.map(item=>(
          <div key={item.id} className="cart-item">
            <div className="cart-img">
              <img src={item.imageUrl||'/image/shirt.jpg'} alt={item.name} onError={(e)=>{ (e.target as HTMLImageElement).src='/image/shirt.jpg'; }}/>
            </div>
            <div className="cart-info">
              <h3 className="cart-item-name">{item.name}</h3>
              {item.isCustom && <div className="cart-item-detail">Custom · {item.fabric||''}{item.color?` · ${item.color}`:''}</div>}
              {!item.isCustom && <div className="cart-item-detail">Ready-Made · {item.category}</div>}
              <div className="cart-item-detail">Qty: {item.quantity}</div>
              <div className="cart-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
            </div>
            <button className="cart-remove" onClick={()=>removeFromCart(item.id)} aria-label="Remove"><FiTrash2/></button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="cart-summary">
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'var(--text)', marginBottom:22, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
          Order Summary
        </h2>
        <div className="price-row"><span className="price-row-l">Subtotal</span><span className="price-row-v">₹{cartTotal.toLocaleString('en-IN')}</span></div>
        <div className="price-row"><span className="price-row-l">Shipping</span><span className="price-row-v" style={{ color:'var(--success)' }}>Free</span></div>
        <div className="price-row"><span className="price-row-l">GST (5%)</span><span className="price-row-v">₹{(cartTotal*0.05).toLocaleString('en-IN',{maximumFractionDigits:0})}</span></div>
        <div className="price-divider"/>
        <div className="price-total-row" style={{ marginBottom:24 }}>
          <span className="price-total-l">Total</span>
          <span className="price-total-v">₹{(cartTotal*1.05).toLocaleString('en-IN',{maximumFractionDigits:0})}</span>
        </div>
        <button className="btn btn-primary" style={{ width:'100%' }} onClick={checkout} disabled={loading}>
          {loading?'Processing…':'Proceed to Payment'} {!loading&&<FiArrowRight/>}
        </button>
        <p style={{ textAlign:'center', fontSize:'.74rem', color:'var(--text-3)', marginTop:12 }}>
          Secured by Razorpay · 256-bit SSL
        </p>
        <div style={{ marginTop:20 }}>
          <button className="btn btn-outline" style={{ width:'100%' }} onClick={clearCart}>Clear Cart</button>
        </div>
      </div>
    </div>
  );
}
