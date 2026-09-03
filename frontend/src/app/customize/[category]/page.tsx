'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getFabrics, getTailors } from '@/lib/api';
import { FiCheck, FiArrowRight, FiArrowLeft, FiCamera, FiAlertCircle, FiLock } from 'react-icons/fi';

/* ═══════════════════════════════════════════════════
   MASTER FORMALWEAR REFERENCE DATA
   Source: Formalwear Master Reference — Shirts, Pants & Blazers
═══════════════════════════════════════════════════ */

const SHIRT_FABRICS = [
  { id:'poplin',      name:'Poplin',                  desc:'Fine yarn, tight over-under weave, smooth minimal texture. The default office/business shirt fabric.',       formality:'High',      priceDelta:0 },
  { id:'broadcloth',  name:'Broadcloth',              desc:'Like poplin but denser with a higher thread count. Smooth, flat surface ideal for formal settings.',         formality:'High',      priceDelta:400 },
  { id:'royal-oxford',name:'Royal Oxford',            desc:'Finer than standard Oxford with a subtle sheen. Pairs beautifully with a suit.',                            formality:'High',      priceDelta:600 },
  { id:'pinpoint',    name:'Pinpoint Oxford',         desc:'Finer yarn than basket-weave Oxford. Medium-high formality with a softer hand.',                            formality:'Med-High',  priceDelta:500 },
  { id:'twill',       name:'Twill / Herringbone',     desc:'Diagonal weave, textured, resists creasing. Winter-leaning, excellent for colder months.',                  formality:'Med-High',  priceDelta:700 },
  { id:'silk',        name:'Silk',                    desc:'Natural sheen, soft drape. Very high formality — special occasion only. Delicate care required.',            formality:'Very High', priceDelta:3200 },
  { id:'egyptian',    name:'Egyptian Cotton',         desc:'Long-staple premium cotton, superfine and exceptionally soft. A mark of a truly bespoke shirt.',             formality:'High',      priceDelta:900 },
  { id:'filafil',     name:'Fil-à-fil (End-on-end)',  desc:'Alternating coloured and white yarn giving a heathered, tonal look. Elegant and distinctive.',              formality:'High',      priceDelta:800 },
  { id:'dobby',       name:'Dobby Weave',             desc:'Small woven geometric pattern in cotton or silk. Often paired with French cuffs for maximum formality.',     formality:'High',      priceDelta:1100 },
];

const PANT_FABRICS = [
  { id:'worsted-wool',   name:'Worsted Wool',             desc:'Smooth, structured, wrinkle-resistant. The standard suit trouser fabric worldwide.',                      formality:'Very High', priceDelta:0 },
  { id:'tropical-wool',  name:'Tropical Wool',            desc:'Lighter weight wool with natural stretch. High formality, suitable for all seasons.',                     formality:'High',      priceDelta:800 },
  { id:'gabardine',      name:'Gabardine',                desc:'Tight twill weave with subtle sheen. Durable, high-formality, available in wool, cotton, or blends.',     formality:'High',      priceDelta:600 },
  { id:'cotton-twill',   name:'Cotton Twill',             desc:'Diagonal weave, soft but structured. Bridges formal and semi-formal dress codes.',                        formality:'Med-High',  priceDelta:200 },
  { id:'poly-viscose',   name:'Poly-Viscose Stretch',     desc:'Structured look with added stretch and comfort. Modern office wear staple.',                              formality:'Med-High',  priceDelta:100 },
  { id:'cotton-blend',   name:'Cotton-Blend (Chino wt)', desc:'Breathable cotton blend. Bridges formal and smart-casual dress codes.',                                   formality:'Medium',    priceDelta:0 },
  { id:'silk-trouser',   name:'Silk Trousers',            desc:'Rare and luxurious. Does not shrink. Reserved for very high-end special occasions.',                      formality:'Very High', priceDelta:4000 },
  { id:'quality-poly',   name:'Quality Polyester',        desc:'Durable, holds shape well. A budget-conscious option that still looks sharp.',                            formality:'Medium',    priceDelta:-200 },
];

const BLAZER_FABRICS = [
  { id:'worsted-wool-b', name:'Worsted Wool',          desc:'Smooth, fine, structured. The definitive formal blazer fabric for business and formal events.',             formality:'Very High', priceDelta:0 },
  { id:'hopsack',        name:'Hopsack Wool',          desc:'Loosely woven and breathable. Doesn\'t wrinkle easily — ideal for travel and all-season wear.',            formality:'High',      priceDelta:1200 },
  { id:'flannel-wool',   name:'Flannel Wool',          desc:'Soft, brushed, exceptionally warm. The winter blazer par excellence.',                                      formality:'High',      priceDelta:1400 },
  { id:'tweed-herr',     name:'Tweed — Herringbone',   desc:'Heritage wool weave, formal-leaning. Classic country-to-city versatility.',                                 formality:'High',      priceDelta:1600 },
  { id:'tweed-glen',     name:'Tweed — Glen Plaid',    desc:'Prince of Wales pattern. Formal-leaning heritage check — boardroom-appropriate.',                           formality:'High',      priceDelta:1600 },
  { id:'cashmere',       name:'Cashmere Blend',         desc:'Ultra-soft luxury fibre. Exceptional drape and warmth. Winter garment of distinction.',                    formality:'Very High', priceDelta:5500 },
  { id:'velvet',         name:'Velvet',                desc:'Napped sheen, statement evening fabric. Black-tie-adjacent — not standard business-formal.',                formality:'Evening',   priceDelta:3000 },
  { id:'cotton-twill-b', name:'Cotton Twill / Gabardine',desc:'Structured but casual-leaning. Ideal for a business-casual blazer or a summer occasion.',               formality:'Med',       priceDelta:0 },
];

/* ── SHIRT STYLES ── */
const SHIRT_MODELS = [
  { id:'dress-shirt',  name:'Formal Dress Shirt',      desc:'Standard everyday formal shirt. Versatile across all business settings.' },
  { id:'slim-fit',     name:'Slim / Tailored Fit',     desc:'Closer to the body with a tapered waist. Modern, polished silhouette.' },
  { id:'athletic-fit', name:'Modern / Athletic Fit',   desc:'Fuller chest and shoulders, tapered waist. For athletic builds.' },
  { id:'classic-fit',  name:'Classic / Regular Fit',   desc:'Full cut through chest and waist. Traditional comfort and movement.' },
  { id:'black-tie',    name:'Full-Dress / Black-Tie Shirt', desc:'Wing collar, French cuffs, sometimes a pleated bib. Black-tie and white-tie only.' },
];

const SHIRT_COLLARS = [
  { id:'spread',    name:'Spread Collar',    desc:'The most versatile formal collar. Works with most tie knots.' },
  { id:'cutaway',   name:'Cutaway Collar',   desc:'Extreme spread — ideal for wide Windsor knots. Very contemporary.' },
  { id:'windsor',   name:'Windsor Collar',   desc:'Wide spread, similar to cutaway. Named for the Duke of Windsor.' },
  { id:'point',     name:'Point / Straight', desc:'Classic narrow spread. Traditional and always appropriate.' },
  { id:'wing',      name:'Wing Collar',      desc:'Folded points. Black-tie and white-tie only — worn with a bow tie.' },
  { id:'club',      name:'Club Collar',      desc:'Rounded corners. Elegant Edwardian heritage. Pairs with a bar pin.' },
  { id:'band',      name:'Band Collar',      desc:'No fold, no tie. Semi-formal — considered collarless modern styling.' },
];

const SHIRT_CUFFS = [
  { id:'barrel',       name:'Barrel Cuff',          desc:'Single layer, button closure. Everyday formal standard.' },
  { id:'french',       name:'French / Double Cuff',  desc:'Folded back, fastened with cufflinks. Most formal cuff. Pairs with formal jackets.' },
  { id:'convertible',  name:'Convertible Cuff',      desc:'Works with both buttons and cufflinks — the flexible option.' },
  { id:'rounded',      name:'Rounded Barrel',        desc:'Barrel cuff with rounded corners. Subtle cosmetic distinction.' },
  { id:'mitred',       name:'Mitred Barrel',         desc:'Barrel cuff with angled corners. Clean, architectural edge.' },
];

const SHIRT_PLACKETS = [
  { id:'standard',    name:'Standard Placket',     desc:'Traditional button band. Appropriate for all formal contexts.' },
  { id:'french-front',name:'French Front',          desc:'Hidden buttons, very clean flat front. Elevated formal appearance.' },
  { id:'pleated-bib', name:'Pleated Bib Front',     desc:'Formal dress shirts only — black-tie and white-tie events.' },
];

/* ── PANT STYLES ── */
const PANT_MODELS = [
  { id:'dress-trouser', name:'Dress / Suit Trouser',    desc:'Standard tailored trouser. Matched to a suit or blazer.', locks:{} },
  { id:'gurkha',        name:'Gurkha Pants',            desc:'High-waisted, wide waistband, double forward pleats, side buckle/tab. Military heritage. Semi-formal to formal.', locks:{ front:'double-pleat', rise:'high', waistband:'gurkha-tab' } },
  { id:'cigarette',     name:'Cigarette Pants',         desc:'Slim, narrow leg, no ankle break. Clean modern silhouette.', locks:{ front:'flat', fit:'slim' } },
  { id:'high-waist',    name:'High-Waist Pleated',      desc:'Waistband above natural waist — worn with blazers and waistcoats.', locks:{ rise:'high' } },
  { id:'oxford-bags',   name:'Oxford Bags',             desc:'Wide, loose-leg heritage trouser. Bold statement silhouette.', locks:{ fit:'relaxed', front:'double-pleat' } },
  { id:'birjis',        name:'Birjis Pants',            desc:'Straight-leg heritage silhouette. Distinguished and timeless.', locks:{} },
  { id:'bootcut',       name:'Bootcut / Flare',         desc:'Flared from the knee. Fashion-formal rather than boardroom-formal.', locks:{} },
  { id:'chinos',        name:'Chinos',                  desc:'Smart-casual bridge between formal and casual lines.', locks:{ front:'flat' } },
];

const PANT_FRONTS = [
  { id:'flat',          name:'Flat Front',        desc:'No pleats — slim and athletic silhouette. Modern formal standard.' },
  { id:'single-pleat',  name:'Single Pleat',      desc:'Classic drape with added ease. Traditional formal choice.' },
  { id:'double-pleat',  name:'Double Pleat',      desc:'Maximum ease and drape. Heritage formal styling.' },
  { id:'reverse-pleat', name:'Reverse Pleat',     desc:'Fold faces outward, stitched to the back of the waistband. Smoothest formal look.' },
];

const PANT_RISES = [
  { id:'mid',  name:'Mid Rise',  desc:'Standard modern rise — sits at natural waist.' },
  { id:'high', name:'High Rise', desc:'Sits above natural waist. Required for Gurkha, Oxford bags, and heritage styles.' },
];

const PANT_WAISTBANDS = [
  { id:'belt-loop',   name:'Standard Belt Loop',       desc:'Standard belt loop waistband. Works with any belt.' },
  { id:'gurkha-tab',  name:'Gurkha Buckle / Tab',      desc:'Double side-tab closure — no belt required. Defines the Gurkha silhouette.' },
  { id:'extended-tab',name:'Extended Tab / Hook',       desc:'Classic extended waistband tab with hook closure. Elegant heritage detail.' },
];

const PANT_HEMS = [
  { id:'finished',  name:'Finished Hem',    desc:'Folded and stitched hem. Standard formal finish.' },
  { id:'unfinished',name:'Unfinished Hem',  desc:'Raw hem — for custom-length alteration after delivery.' },
  { id:'cuffed',    name:'Cuffed / Turn-Up',desc:'Folded turn-up at the ankle. Classic heritage detail on formal trousers.' },
];

const PANT_FITS = [
  { id:'slim',    name:'Slim Fit',         desc:'Close-fitting through thigh and knee.' },
  { id:'tapered', name:'Tapered Fit',      desc:'Regular through thigh, tapers to ankle.' },
  { id:'regular', name:'Regular / Classic',desc:'Full, comfortable cut through leg.' },
  { id:'relaxed', name:'Relaxed Fit',      desc:'Generous cut for ease of movement.' },
];

/* ── BLAZER STYLES ── */
const BLAZER_MODELS = [
  { id:'single-breasted', name:'Single-Breasted', desc:'One column of buttons, narrow overlap. The most versatile blazer for business and semi-formal.', locks:{ buttons:'2-button' } },
  { id:'double-breasted', name:'Double-Breasted', desc:'Two columns, wide overlap, peak lapel standard. Dressier — weddings and formal events.', locks:{ lapel:'peak', buttons:'6-button-db' } },
  { id:'three-piece',     name:'Three-Piece Suit',desc:'Matched with a waistcoat for maximum boardroom formality.', locks:{} },
  { id:'tuxedo',          name:'Tuxedo Jacket',   desc:'Satin lapel (peak or shawl). Black-tie only. The most formal jacket in a wardrobe.', locks:{ lapel:'shawl', vent:'ventless', pockets:'jetted' } },
];

const BLAZER_LAPELS = [
  { id:'notch', name:'Notch Lapel', desc:'Standard, versatile. Works on all single-breasted jackets.' },
  { id:'peak',  name:'Peak Lapel',  desc:'Dressier. Standard on double-breasted; optional on single-breasted.' },
  { id:'shawl', name:'Shawl Lapel', desc:'Rounded, no notch. Tuxedo and formal evening jackets only.' },
];

const BLAZER_BUTTONS = [
  { id:'1-button',    name:'1-Button (SB)', desc:'Minimal, modern. Best with slim-fit single-breasted jackets.' },
  { id:'2-button',    name:'2-Button (SB)', desc:'The classic standard. Timeless and universally appropriate.' },
  { id:'3-button',    name:'3-Button (SB)', desc:'Traditional British cut. Often "three-roll-two" stance.' },
  { id:'4-button-db', name:'4-Button (DB)', desc:'Double-breasted with 4 buttons (2 functional). Compact and modern.' },
  { id:'6-button-db', name:'6-Button (DB)', desc:'Double-breasted with 6 buttons (2–3 functional). Classic and bold.' },
];

const BLAZER_VENTS = [
  { id:'single-vent', name:'Single / Centre Vent', desc:'Classic. Works with most body types. American-leaning style.' },
  { id:'dual-vent',   name:'Double / Side Vents',  desc:'More formal drape. British-leaning. Better for movement.' },
  { id:'ventless',    name:'Ventless',              desc:'Sleekest silhouette. Italian influence. Less traditional for business.' },
];

const BLAZER_POCKETS = [
  { id:'flap',   name:'Flap Pockets',       desc:'Standard exterior flap. Slightly more casual of the formal options.' },
  { id:'jetted', name:'Jetted / Welt Pockets',desc:'No flap, sleek finish. More formal. Standard on tuxedos.' },
  { id:'besom',  name:'Besom Pockets',       desc:'Narrow bound opening. Very clean — elevated formal option.' },
];

const BLAZER_LININGS = [
  { id:'full',    name:'Full Lining',   desc:'Fully lined interior. Standard for formal blazers and all weather.' },
  { id:'half',    name:'Half Lining',   desc:'Body lining only, sleeves unlined. Breathable — warmer climates.' },
  { id:'unlined', name:'Unlined',       desc:'No lining. Casual blazers and summer only.' },
];

const BLAZER_FITS = [
  { id:'slim',    name:'Slim Fit',    desc:'Close through chest and waist. Contemporary silhouette.' },
  { id:'modern',  name:'Modern Fit',  desc:'Slightly roomier than slim. Versatile and flattering.' },
  { id:'classic', name:'Classic Fit', desc:'Traditional full cut. Comfortable and traditional.' },
];

/* ── BASE PRICES ── */
const BASE: Record<string,number> = { shirt:2499, pant:3499, blazer:9999 };

const STEPS: Record<string,string[]> = {
  shirt:  ['Model','Fabric','Collar','Cuff','Placket','Size','Summary'],
  pant:   ['Model','Fabric','Details','Size','Summary'],
  blazer: ['Model','Fabric','Lapel & Buttons','Vent & Pockets','Fit & Lining','Size','Summary'],
};

const SIZES: Record<string,string[]> = {
  shirt:  ['XS (34)','S (36)','M (38)','L (40)','XL (42)','XXL (44)','XXXL (46)'],
  pant:   ['28″','30″','32″','34″','36″','38″','40″','42″'],
  blazer: ['34','36','38','40','42','44','46','48'],
};

import AIScan from '@/components/AIScan';


/* ── LOCKED CHIP ── */
function LockedOption({ label, value }: { label:string; value:string }) {
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--gold-subtle)',border:'1px solid var(--border-g)',borderRadius:50,color:'var(--gold)',fontSize:'.82rem',fontWeight:600}}>
      <FiLock size={11}/> {label}: <strong>{value}</strong>
    </div>
  );
}

/* ── OPTION CARD ── */
function OptionCard({ item, sel, onSelect, locked }: { item:any; sel:boolean; onSelect:()=>void; locked?:boolean }) {
  return (
    <div
      className={`style-opt-card${sel?' sel':''}${locked?' locked':''}`}
      onClick={locked ? undefined : onSelect}
      style={locked ? { opacity:.55, cursor:'not-allowed' } : {}}
    >
      <div className="style-opt-name">{item.name}</div>
      {item.desc && <div className="style-opt-desc">{item.desc}</div>}
      {item.formality && <div style={{marginTop:5,fontSize:'.68rem',color:'var(--gold)',fontWeight:600,letterSpacing:'.06em'}}>{item.formality}</div>}
      {locked && <div style={{marginTop:4,display:'flex',alignItems:'center',gap:4,fontSize:'.68rem',color:'var(--text-3)'}}><FiLock size={10}/> Set by model</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN WIZARD
═══════════════════════════════════════════════════ */
export default function CustomizePage() {
  const params = useParams();
  const router = useRouter();
  const slug   = ((params.category as string)||'shirt').toLowerCase();
  const { addToCart, isLoggedIn } = useApp();

  const steps  = STEPS[slug] || STEPS.shirt;
  const base   = BASE[slug] || 2499;

  // ── State
  const [gender,   setGender]  = useState<'mens'|'womens'|null>(null);
  const [step,     setStep]    = useState(0);
  const [model,    setModel]   = useState<any>(null);
  const [fabric,   setFabric]  = useState<any>(null);
  const [details,  setDetails] = useState<Record<string,string>>({});
  const [sizeMode, setSizeMode]= useState<'standard'|'ai'>('standard');
  const [selSize,  setSelSize] = useState('');
  const [measures, setMeasures]= useState<Record<string,string>>({});
  const [tailors,  setTailors] = useState<any[]>([]);
  const [tailor,   setTailor]  = useState<any>(null);
  const [apiError, setApiError]= useState('');

  // ── API fabrics (prefer local static data, API is supplementary)
  const localFabrics: Record<string,any[]> = { shirt:SHIRT_FABRICS, pant:PANT_FABRICS, blazer:BLAZER_FABRICS };
  const [fabrics, setFabrics] = useState<any[]>(localFabrics[slug]||SHIRT_FABRICS);

  useEffect(()=>{
    getFabrics(slug.toUpperCase()).then(d=>{ if(d?.length) setFabrics(d.map((f:any)=>({ ...f, colors: typeof f.colors==='string' ? f.colors.split(',') : f.colors }))); }).catch(()=>{});
    getTailors().then(setTailors).catch(()=>{});
  },[slug]);

  // ── When model changes, auto-apply locks
  useEffect(()=>{
    if (!model?.locks) return;
    setDetails(prev=>{
      const next = {...prev};
      Object.entries(model.locks).forEach(([k,v])=>{ next[k] = v as string; });
      return next;
    });
  },[model]);

  const isLocked = (key:string) => model?.locks && key in model.locks;
  const getDetail = (key:string) => details[key] || '';
  const setDetail = (key:string, val:string) => {
    if (isLocked(key)) return;
    setDetails(prev=>({...prev,[key]:val}));
  };

  const priceDelta = (fabric?.priceDelta||0) + (tailor?.charge||0);
  const total = base + priceDelta;

  const garmentLabel = slug.charAt(0).toUpperCase()+slug.slice(1);

  const addAndGo = ()=>{
    if (!isLoggedIn){ router.push('/login'); return; }
    const genderLabel = gender === 'mens' ? "Men's" : "Women's";
    addToCart({
      id:`custom-${slug}-${Date.now()}`,
      name:`Custom ${genderLabel} ${garmentLabel}`,
      category:slug.toUpperCase(),
      price:total, quantity:1,
      imageUrl:fabric?.swatchUrl||`/image/${slug==='pant'?'pant':slug==='blazer'?'BLAZER':'shirt'}.jpg`,
      isCustom:true,
      fabric:fabric?.name,
      tailorId:tailor?.id,
      customSpec:{ gender: genderLabel, model:model?.name, fabric, details, size:selSize, measurements:measures, tailor },
    });
    router.push('/cart');
  };

  /* ════ STEP RENDERERS ════ */

  /* ── Models ── */
  const renderModels = ()=>{
    const modelList = slug==='shirt' ? SHIRT_MODELS : slug==='pant' ? PANT_MODELS : BLAZER_MODELS;
    return (
      <div>
        <h2 className="step-heading">Select a Model / Silhouette</h2>
        <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:24,lineHeight:1.6}}>
          The model defines the overall cut and silhouette. Some models lock certain detail options — these will be highlighted when you reach that step.
        </p>
        <div className="style-opts-grid">
          {modelList.map((m:any)=>(
            <div key={m.id} className={`style-opt-card${model?.id===m.id?' sel':''}`} onClick={()=>setModel(m)}>
              <div className="style-opt-name">{m.name}</div>
              <div className="style-opt-desc">{m.desc}</div>
              {m.locks && Object.keys(m.locks).length>0 && (
                <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:5}}>
                  {Object.entries(m.locks).map(([k]:any)=>(
                    <span key={k} style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 7px',background:'rgba(236,187,13,.1)',border:'1px solid rgba(236,187,13,.2)',borderRadius:50,fontSize:'.65rem',color:'var(--gold)'}}>
                      <FiLock size={9}/> {k} locked
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── Fabrics ── */
  const renderFabrics = ()=>(
    <div>
      <h2 className="step-heading">Choose Your Fabric</h2>
      <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:24,lineHeight:1.6}}>
        All fabrics shown are garment-appropriate — incompatible fabrics are excluded. Price adjustments are shown relative to the base fabric.
      </p>
      <div className="fabric-grid">
        {fabrics.map((f:any)=>(
          <div key={f.id} className={`fabric-card${fabric?.id===f.id?' sel':''}`} onClick={()=>setFabric(f)}>
            <div className="fabric-swatch">
              <img src={f.swatchUrl||`/image/${slug==='blazer'?'BLAZER':slug==='pant'?'pant':'shirt'}.jpg`} alt={f.name}
                onError={(e)=>{(e.target as HTMLImageElement).src='/image/shirt.jpg';}}/>
            </div>
            <div className="fabric-info">
              <div className="fabric-name">{f.name}</div>
              <div className="fabric-desc">{f.description||f.desc}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:7}}>
                <div className="fabric-price">{(f.priceDelta||0)===0?'Included':`+₹${(f.priceDelta||0).toLocaleString('en-IN')}`}</div>
                {f.formality && <span style={{fontSize:'.67rem',color:'var(--text-3)',fontStyle:'italic'}}>{f.formality}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Shirt detail steps ── */
  const renderShirtCollars = ()=>(
    <div>
      <h2 className="step-heading">Collar Style</h2>
      <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:20}}>
        The collar defines the shirt's formality. Wing collars are black-tie/white-tie only and should be worn with a bow tie.
      </p>
      {isLocked('collar') && <div style={{marginBottom:16}}><LockedOption label="Collar" value={details.collar||''}/></div>}
      <div className="style-opts-grid">
        {SHIRT_COLLARS.map(c=><OptionCard key={c.id} item={c} sel={getDetail('collar')===c.id} onSelect={()=>setDetail('collar',c.id)} locked={isLocked('collar')}/>)}
      </div>
      <h2 className="step-heading" style={{marginTop:32}}>Cuff Style</h2>
      <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:20}}>French/Double cuffs require cufflinks and represent the most formal option — ideal with a suit jacket.</p>
      <div className="style-opts-grid">
        {SHIRT_CUFFS.map(c=><OptionCard key={c.id} item={c} sel={getDetail('cuff')===c.id} onSelect={()=>setDetail('cuff',c.id)} locked={false}/>)}
      </div>
      <h2 className="step-heading" style={{marginTop:32}}>Placket</h2>
      <div className="style-opts-grid">
        {SHIRT_PLACKETS.map(c=><OptionCard key={c.id} item={c} sel={getDetail('placket')===c.id} onSelect={()=>setDetail('placket',c.id)} locked={false}/>)}
      </div>
    </div>
  );

  /* ── Pant details step ── */
  const renderPantDetails = ()=>(
    <div>
      <h2 className="step-heading">Trouser Details</h2>
      {/* Locks notice */}
      {model?.locks && Object.keys(model.locks).length>0 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:8,padding:14,background:'var(--gold-subtle)',border:'1px solid var(--border-g)',borderRadius:'var(--r-sm)',marginBottom:22}}>
          <span style={{fontSize:'.8rem',color:'var(--text-2)',width:'100%',marginBottom:4}}><FiLock size={12} style={{display:'inline',marginRight:4}}/>Options locked by <strong style={{color:'var(--gold)'}}>{model.name}</strong>:</span>
          {Object.entries(model.locks).map(([k,v]:any)=><LockedOption key={k} label={k} value={v}/>)}
        </div>
      )}
      {[
        {label:'Front / Pleat', key:'front',  items:PANT_FRONTS },
        {label:'Fit',           key:'fit',    items:PANT_FITS   },
        {label:'Rise',          key:'rise',   items:PANT_RISES  },
        {label:'Waistband',     key:'waistband',items:PANT_WAISTBANDS},
        {label:'Hem',           key:'hem',    items:PANT_HEMS   },
      ].map(({label,key,items})=>(
        <div key={key} style={{marginBottom:28}}>
          <h3 style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>{label}</h3>
          <div className="style-opts-grid">
            {items.map(it=><OptionCard key={it.id} item={it} sel={getDetail(key)===it.id} onSelect={()=>setDetail(key,it.id)} locked={isLocked(key)}/>)}
          </div>
        </div>
      ))}
    </div>
  );

  /* ── Blazer steps ── */
  const renderBlazerLapelButtons = ()=>(
    <div>
      <h2 className="step-heading">Lapel & Button Configuration</h2>
      {model?.id==='tuxedo' && (
        <div style={{display:'flex',alignItems:'center',gap:8,padding:12,background:'var(--gold-subtle)',border:'1px solid var(--border-g)',borderRadius:'var(--r-sm)',marginBottom:20}}>
          <FiLock size={13} style={{color:'var(--gold)',flexShrink:0}}/><span style={{fontSize:'.82rem',color:'var(--text-2)'}}>Tuxedo jacket: lapel locked to <strong style={{color:'var(--gold)'}}>Shawl</strong> (peak available on request). Lining and pockets also auto-set.</span>
        </div>
      )}
      <h3 style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Lapel</h3>
      <div className="style-opts-grid">
        {BLAZER_LAPELS.map(it=><OptionCard key={it.id} item={it} sel={getDetail('lapel')===it.id} onSelect={()=>setDetail('lapel',it.id)} locked={isLocked('lapel')}/>)}
      </div>
      <h3 style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12,marginTop:28}}>Buttons</h3>
      <div className="style-opts-grid">
        {BLAZER_BUTTONS
          .filter(b=> model?.id==='double-breasted' ? b.id.includes('-db') : !b.id.includes('-db') || model?.id==='tuxedo' )
          .map(it=><OptionCard key={it.id} item={it} sel={getDetail('buttons')===it.id} onSelect={()=>setDetail('buttons',it.id)} locked={isLocked('buttons')}/>)
        }
      </div>
    </div>
  );

  const renderBlazerVentPockets = ()=>(
    <div>
      <h2 className="step-heading">Back Vent & Pockets</h2>
      <h3 style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Back Vent</h3>
      <div className="style-opts-grid">
        {BLAZER_VENTS.map(it=><OptionCard key={it.id} item={it} sel={getDetail('vent')===it.id} onSelect={()=>setDetail('vent',it.id)} locked={isLocked('vent')}/>)}
      </div>
      <h3 style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12,marginTop:28}}>Pocket Style</h3>
      <div className="style-opts-grid">
        {BLAZER_POCKETS.map(it=><OptionCard key={it.id} item={it} sel={getDetail('pockets')===it.id} onSelect={()=>setDetail('pockets',it.id)} locked={isLocked('pockets')}/>)}
      </div>
    </div>
  );

  const renderBlazerFitLining = ()=>(
    <div>
      <h2 className="step-heading">Fit & Lining</h2>
      <h3 style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Fit</h3>
      <div className="style-opts-grid">
        {BLAZER_FITS.map(it=><OptionCard key={it.id} item={it} sel={getDetail('fit')===it.id} onSelect={()=>setDetail('fit',it.id)} locked={false}/>)}
      </div>
      <h3 style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12,marginTop:28}}>Lining</h3>
      <div className="style-opts-grid">
        {BLAZER_LININGS.map(it=><OptionCard key={it.id} item={it} sel={getDetail('lining')===it.id} onSelect={()=>setDetail('lining',it.id)} locked={false}/>)}
      </div>
      <h3 style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12,marginTop:28}}>Sleeve Buttons</h3>
      <div className="style-opts-grid">
        {[{id:'functional',name:"Surgeon's Cuffs",desc:"Functional buttonholes — the mark of a truly bespoke jacket."},{id:'decorative',name:'Decorative Buttons',desc:'Non-functional. Standard on most made-to-order jackets.'}]
          .map(it=><OptionCard key={it.id} item={it} sel={getDetail('sleevebtn')===it.id} onSelect={()=>setDetail('sleevebtn',it.id)} locked={false}/>)
        }
      </div>
    </div>
  );

  /* ── Size step ── */
  const renderSize = ()=>(
    <div>
      <h2 className="step-heading">Size & Measurements</h2>
      <div className="measure-opts">
        <div className={`measure-opt-card${sizeMode==='standard'?' sel':''}`} onClick={()=>setSizeMode('standard')}>
          <div className="measure-opt-icon">📐</div>
          <div className="measure-opt-title">Standard Size Chart</div>
          <div className="measure-opt-desc">Pick from our size chart. Quick and reliable for most body types.</div>
        </div>
        <div className={`measure-opt-card${sizeMode==='ai'?' sel':''}`} onClick={()=>setSizeMode('ai')}>
          <div className="measure-opt-icon">🤖</div>
          <div className="measure-opt-title">AI Body Scan</div>
          <div className="measure-opt-desc">Webcam-powered precision measurement analysis. Recommended for custom fit.</div>
        </div>
      </div>
      {sizeMode==='standard' ? (
        <div>
          <h4 style={{color:'var(--text-2)',fontSize:'.78rem',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:14}}>Select Size</h4>
          <div className="size-chips">
            {(SIZES[slug]||SIZES.shirt).map(sz=>(
              <button key={sz} className={`size-chip${selSize===sz?' sel':''}`} onClick={()=>setSelSize(sz)}>{sz}</button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {measures?.chest && (
            <div style={{padding:'12px 18px',background:'var(--gold-subtle)',border:'1px solid var(--border-g)',borderRadius:'var(--r-sm)',marginBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:'var(--gold)',fontSize:'.88rem',fontWeight:700}}>
                ✓ AI Scan Applied: Chest {measures.chest}&quot; · Waist {measures.waist}&quot; · Shoulder {measures.shoulder}&quot; · Inseam {measures.inseam}&quot;
              </div>
              <button className="btn btn-primary btn-sm" onClick={()=>setStep(s=>Math.min(s+1,steps.length-1))}>
                Proceed to Review <FiArrowRight/>
              </button>
            </div>
          )}
          <AIScan
            initialGender={gender || 'mens'}
            initialGarment={slug || 'shirt'}
            onDone={m=>{
              setMeasures(m);
              setSelSize('Custom AI Scan');
              setStep(s=>Math.min(s+1,steps.length-1));
            }}
          />
        </div>
      )}
    </div>
  );

  /* ── Summary step ── */
  const renderSummary = ()=>{
    const summary: [string,string][] = [
      ['Garment',  `Custom ${gender === 'mens' ? "Men's" : "Women's"} ${garmentLabel}`],
      ['Model',    model?.name||'—'],
      ['Fabric',   fabric?.name||'—'],
      ['Size / Fit', selSize||'—'],
      ...(measures?.chest ? [
        ['AI Measurements', `Chest: ${measures.chest}" · Waist: ${measures.waist}" · Shoulder: ${measures.shoulder}" · Inseam: ${measures.inseam}"`] as [string,string]
      ] : []),
      ...(Object.entries(details).filter(([,v])=>!!v).map(([k,v]):[string,string]=>[k.charAt(0).toUpperCase()+k.slice(1), v])),
      ['Tailor',   tailor?.name||'No tailor selected'],
    ];
    return (
      <div>
        <h2 className="step-heading">Order Summary</h2>
        <div style={{background:'var(--bg-el)',borderRadius:'var(--r-md)',padding:22,marginBottom:22}}>
          {summary.map(([l,v])=>(
            <div key={l} className="price-row" style={{borderBottom:'1px solid var(--border)',padding:'10px 0'}}>
              <span className="price-row-l" style={{textTransform:'capitalize'}}>{l}</span>
              <span className="price-row-v" style={{fontSize:'.85rem',textAlign:'right',maxWidth:260}}>{v}</span>
            </div>
          ))}
        </div>
        {/* Tailor selection */}
        {tailors.length>0 && (
          <div style={{marginBottom:22}}>
            <h4 style={{color:'var(--text-2)',fontSize:'.78rem',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12}}>Choose a Tailor (Optional)</h4>
            <div className="tailor-cards-grid">
              {tailors.map((t:any)=>(
                <div key={t.id} className={`tailor-card${tailor?.id===t.id?' sel':''}`} onClick={()=>setTailor(tailor?.id===t.id?null:t)}>
                  <div className="tailor-card-head">
                    <div className="tailor-av">{t.name?.charAt(0)}</div>
                    <div>
                      <div className="tailor-name">{t.name}</div>
                      <div className="tailor-rating"><span className="tailor-stars">★</span> {Number(t.rating).toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="tailor-stats">
                    <div className="tailor-stat"><div className="tailor-stat-l">Charge</div><div className="tailor-stat-v gold">₹{Number(t.charge).toLocaleString('en-IN')}</div></div>
                    <div className="tailor-stat"><div className="tailor-stat-l">Turnaround</div><div className="tailor-stat-v">{t.turnaroundDays}d</div></div>
                  </div>
                  <p className="tailor-bio">{t.bio}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{background:'var(--bg-el)',borderRadius:'var(--r-md)',padding:20,marginBottom:20}}>
          {[['Base Price',`₹${base.toLocaleString('en-IN')}`],fabric?.priceDelta>0&&['Fabric Upgrade',`+₹${fabric.priceDelta.toLocaleString('en-IN')}`],tailor&&['Tailor Charge',`₹${Number(tailor.charge).toLocaleString('en-IN')}`]].filter(Boolean).map(([l,v]:any)=>(
            <div key={l} className="price-row"><span className="price-row-l">{l}</span><span className="price-row-v">{v}</span></div>
          ))}
          <div className="price-divider"/>
          <div className="price-total-row"><span className="price-total-l">Total</span><span className="price-total-v">₹{total.toLocaleString('en-IN')}</span></div>
        </div>
        <button className="btn btn-primary btn-lg" style={{width:'100%'}} onClick={addAndGo}>
          Add to Cart & Checkout <FiArrowRight/>
        </button>
      </div>
    );
  };

  /* ── Step router ── */
  const renderStep = ()=>{
    if (slug==='shirt') {
      switch(step){
        case 0: return renderModels();
        case 1: return renderFabrics();
        case 2: return renderShirtCollars();
        case 3: return renderSize();
        case 4: return renderSummary();
        default: return renderSummary();
      }
    }
    if (slug==='pant') {
      switch(step){
        case 0: return renderModels();
        case 1: return renderFabrics();
        case 2: return renderPantDetails();
        case 3: return renderSize();
        case 4: return renderSummary();
        default: return renderSummary();
      }
    }
    // blazer
    switch(step){
      case 0: return renderModels();
      case 1: return renderFabrics();
      case 2: return renderBlazerLapelButtons();
      case 3: return renderBlazerVentPockets();
      case 4: return renderBlazerFitLining();
      case 5: return renderSize();
      case 6: return renderSummary();
      default: return renderSummary();
    }
  };

  if (!gender) {
    return (
      <div style={{padding:'40px',maxWidth:'800px',margin:'40px auto',textAlign:'center'}}>
        <span className="sec-label">Customization Department</span>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.5rem',color:'var(--text)',marginBottom:10}}>
          Choose Department
        </h1>
        <p style={{color:'var(--text-2)',marginBottom:36}}>
          Select a department to design your custom {slug}. Patterns and fits are customized based on this department selection.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div
            className="style-opt-card"
            onClick={()=>setGender('mens')}
            style={{padding:40,cursor:'pointer',border:'2px solid var(--border)',borderRadius:'var(--r-lg)',background:'var(--bg-card)',transition:'all 0.2s'}}
          >
            <div style={{fontSize:48,marginBottom:16}}>👔</div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:'var(--text)',marginBottom:8}}>Men's Custom</h3>
            <p style={{color:'var(--text-3)',fontSize:'.84rem'}}>Tailored custom patterns fit for gentlemen's specifications.</p>
          </div>
          <div
            className="style-opt-card"
            onClick={()=>setGender('womens')}
            style={{padding:40,cursor:'pointer',border:'2px solid var(--border)',borderRadius:'var(--r-lg)',background:'var(--bg-card)',transition:'all 0.2s'}}
          >
            <div style={{fontSize:48,marginBottom:16}}>👚</div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:'var(--text)',marginBottom:8}}>Women's Custom</h3>
            <p style={{color:'var(--text-3)',fontSize:'.84rem'}}>Precision custom designs tailored to women's specifications.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'20px 0'}}>
      <style>{`.step-heading{font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--text);margin-bottom:8px;}.style-opts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:12px;}`}</style>

      <div style={{padding:'28px 40px 0',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <span className="sec-label">{gender === 'mens' ? "Men's" : "Women's"} Customization</span>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(1.7rem,3vw,2.4rem)',color:'var(--text)'}}>
            Design Your {garmentLabel}
          </h1>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={()=>{setGender(null); setStep(0); setModel(null); setFabric(null); setDetails({});}}
        >
          Change Dept
        </button>
      </div>

      <div className="wizard-layout">
        {/* ── Main panel ── */}
        <div className="wizard-main">
          {/* Progress */}
          <div className="wizard-steps">
            {steps.map((s,i)=>(
              <div key={s} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?1:'none'}}>
                <div className="step-node">
                  <div className={`step-bubble${i===step?' active':i<step?' done':''}`}>{i<step?<FiCheck/>:i+1}</div>
                  <div className={`step-label${i===step?' active':''}`}>{s}</div>
                </div>
                {i<steps.length-1 && <div className={`step-connector${i<step?' done':''}`}/>}
              </div>
            ))}
          </div>

          {renderStep()}

          {/* Navigation */}
          <div className="wizard-nav">
            <button className="btn btn-outline" onClick={()=>setStep(s=>Math.max(s-1,0))} disabled={step===0}><FiArrowLeft/> Back</button>
            {step<steps.length-1 && <button className="btn btn-primary" onClick={()=>setStep(s=>Math.min(s+1,steps.length-1))}>Continue <FiArrowRight/></button>}
          </div>
        </div>

        {/* ── Price sidebar ── */}
        <div className="price-sidebar">
          <h3 className="price-sidebar-title">Your Configuration</h3>
          {[
            ['Gender', gender === 'mens' ? "Men's" : "Women's"],
            model   && ['Model',   model.name],
            fabric  && ['Fabric',  fabric.name],
            selSize && ['Size Fit', selSize],
            measures?.chest && ['Chest', `${measures.chest}"`],
            measures?.waist && ['Waist', `${measures.waist}"`],
            measures?.shoulder && ['Shoulder', `${measures.shoulder}"`],
            getDetail('collar')  && ['Collar', getDetail('collar')],
            getDetail('cuff')    && ['Cuff',   getDetail('cuff')],
            getDetail('lapel')   && ['Lapel',  getDetail('lapel')],
            getDetail('vent')    && ['Vent',   getDetail('vent')],
            getDetail('front')   && ['Front',  getDetail('front')],
            getDetail('rise')    && ['Rise',   getDetail('rise')],
            tailor  && ['Tailor',  tailor.name],
          ].filter(Boolean).map(([l,v]:any)=>(
            <div key={l} className="price-row"><span className="price-row-l">{l}</span><span className="price-row-v" style={{fontSize:'.8rem',textAlign:'right'}}>{v}</span></div>
          ))}
          <div className="price-divider"/>
          <div className="price-row"><span className="price-row-l">Base</span><span className="price-row-v">₹{base.toLocaleString('en-IN')}</span></div>
          {fabric?.priceDelta>0 && <div className="price-row"><span className="price-row-l">Fabric</span><span className="price-row-v">+₹{fabric.priceDelta.toLocaleString('en-IN')}</span></div>}
          {tailor && <div className="price-row"><span className="price-row-l">Tailor</span><span className="price-row-v">₹{Number(tailor.charge).toLocaleString('en-IN')}</span></div>}
          <div className="price-divider"/>
          <div className="price-total-row">
            <span className="price-total-l">Total</span>
            <span className="price-total-v">₹{total.toLocaleString('en-IN')}</span>
          </div>
          {step<steps.length-1 && (
            <button className="btn btn-gold-outline" style={{width:'100%',marginTop:18}} onClick={()=>setStep(s=>Math.min(s+1,steps.length-1))}>
              Continue <FiArrowRight/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
