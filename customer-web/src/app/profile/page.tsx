'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getProfile, saveMeasurements } from '@/lib/api';
import { FiUser, FiSettings, FiHeart, FiLogOut, FiCheck, FiPackage } from 'react-icons/fi';

type Tab = 'overview' | 'measurements' | 'designs';

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useApp();
  const router = useRouter();
  const [tab,     setTab]     = useState<Tab>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [ok,      setOk]      = useState('');
  const [m, setM] = useState({ chest:'', waist:'', shoulder:'', sleeve:'', inseam:'', neck:'', hip:'', fitPreference:'Slim Fit' });

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return; }
    getProfile().then(d => {
      setProfile(d);
      if (d?.measurements?.[0]) {
        const mx = d.measurements[0];
        setM({ chest:mx.chest||'', waist:mx.waist||'', shoulder:mx.shoulder||'', sleeve:mx.sleeve||'', inseam:mx.inseam||'', neck:mx.neck||'', hip:mx.hip||'', fitPreference:mx.fitPreference||'Slim Fit' });
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [isLoggedIn]);

  const saveM = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setOk('');
    try { await saveMeasurements(m); setOk('Measurements saved!'); setTimeout(()=>setOk(''),3000); }
    catch(err:any) { alert(err.message||'Failed'); }
    finally { setSaving(false); }
  };

  if (!isLoggedIn) return null;

  const NAV = [
    { id:'overview' as Tab, icon:<FiUser size={14}/>, label:'Overview' },
    { id:'measurements' as Tab, icon:<FiSettings size={14}/>, label:'Measurements' },
    { id:'designs' as Tab, icon:<FiHeart size={14}/>, label:'Saved Designs' },
  ];

  return (
    <div className="profile-layout">
      {/* Sidebar */}
      <div className="profile-card">
        <div className="profile-av">{user?.name?.charAt(0)||'U'}</div>
        <div className="profile-name">{user?.name}</div>
        <div className="profile-email">{user?.email}</div>
        <div className="profile-role" style={{ marginBottom:24 }}>{user?.role}</div>
        {NAV.map(n => (
          <button key={n.id} className={`dash-nav-item${tab===n.id?' active':''}`} onClick={()=>setTab(n.id)}>
            {n.icon} {n.label}
          </button>
        ))}
        <Link href="/orders" className="dash-nav-item" style={{ display:'flex', alignItems:'center', gap:9, color:'var(--text-2)', fontSize:'.88rem', fontWeight:500, padding:'11px 12px', textDecoration:'none', border:'none', background:'none', marginBottom:2, borderRadius:'var(--r-sm)' }}>
          <FiPackage size={14}/> My Orders
        </Link>
        <button className="dash-nav-item" style={{ color:'var(--danger)', marginTop:10 }} onClick={()=>{ logout(); router.push('/'); }}>
          <FiLogOut size={14}/> Log Out
        </button>
      </div>

      {/* Main */}
      <div className="profile-main">
        {loading ? (
          <>
            <div className="skeleton" style={{ height:28, width:'40%', marginBottom:16 }}/>
            <div className="skeleton" style={{ height:18, width:'60%', marginBottom:28 }}/>
            <div className="skeleton" style={{ height:120, width:'100%' }}/>
          </>
        ) : (
          <>
            {tab === 'overview' && (
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.7rem', color:'var(--text)', marginBottom:6 }}>Account Overview</h2>
                <p style={{ color:'var(--text-3)', marginBottom:28 }}>Your account details and recent activity.</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
                  {[['Full Name', profile?.name||'—'],['Email', profile?.email||'—']].map(([l,v])=>(
                    <div key={l} style={{ padding:18, background:'var(--bg-el)', borderRadius:'var(--r-md)' }}>
                      <div style={{ fontSize:'.72rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5 }}>{l}</div>
                      <div style={{ fontWeight:600, color:'var(--text)' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                  <Link href="/orders" className="btn btn-outline">View Order History <FiPackage size={13}/></Link>
                  {user?.role !== 'CUSTOMER' && (
                    <Link href={user?.role==='TAILOR'?'/tailor/dashboard':'/designer/dashboard'} className="btn btn-primary">Work Dashboard →</Link>
                  )}
                </div>
              </div>
            )}

            {tab === 'measurements' && (
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.7rem', color:'var(--text)', marginBottom:6 }}>Body Measurements</h2>
                <p style={{ color:'var(--text-3)', marginBottom:22 }}>Used automatically for all custom orders.</p>
                {ok && <div style={{ display:'flex', alignItems:'center', gap:8, padding:12, background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', borderRadius:'var(--r-sm)', color:'var(--success)', fontSize:'.86rem', marginBottom:18 }}><FiCheck/>{ok}</div>}
                <form onSubmit={saveM}>
                  <div className="measure-fields" style={{ marginBottom:20 }}>
                    {[['chest','Chest (in)'],['waist','Waist (in)'],['shoulder','Shoulder (in)'],['sleeve','Sleeve (in)'],['inseam','Inseam (in)'],['neck','Neck (in)'],['hip','Hip (in)']].map(([k,l])=>(
                      <div key={k} className="measure-field">
                        <label>{l}</label>
                        <input type="number" step=".5" value={(m as any)[k]} onChange={e=>setM(p=>({...p,[k]:e.target.value}))} placeholder="0.0"/>
                      </div>
                    ))}
                    <div className="measure-field">
                      <label>Fit Preference</label>
                      <select value={m.fitPreference} onChange={e=>setM(p=>({...p,fitPreference:e.target.value}))} style={{ padding:'11px 14px', background:'var(--bg-el)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text)' }}>
                        <option>Slim Fit</option><option>Regular Fit</option><option>Relaxed Fit</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save Measurements'}</button>
                </form>
              </div>
            )}

            {tab === 'designs' && (
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.7rem', color:'var(--text)', marginBottom:6 }}>Saved Designs</h2>
                <p style={{ color:'var(--text-3)', marginBottom:22 }}>Your saved custom configurations ready to re-order.</p>
                {!profile?.designs?.length ? (
                  <div className="empty">
                    <div className="empty-icon">🎨</div>
                    <h3 className="empty-title">No saved designs</h3>
                    <p className="empty-desc">Create one through the Customizer!</p>
                    <Link href="/customize/shirt" className="btn btn-primary">Start Customizing</Link>
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                    {profile.designs.map((d: any) => (
                      <div key={d.id} style={{ border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:18, background:'var(--bg-el)' }}>
                        <h4 style={{ color:'var(--text)', marginBottom:4 }}>{d.name}</h4>
                        <div style={{ color:'var(--gold)', fontSize:'.76rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>{d.category}</div>
                        <Link href={`/customize/${d.category.toLowerCase()}`} className="btn btn-gold-outline btn-sm">Re-configure</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
