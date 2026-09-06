'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getFabrics, getTailors } from '@/lib/api';
import {
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiCamera,
  FiAlertCircle,
  FiLock,
  FiMaximize2,
  FiFilm,
  FiX,
  FiDroplet,
  FiLayers,
  FiZoomIn
} from 'react-icons/fi';

/* ═══════════════════════════════════════════════════
   MASTER FORMALWEAR REFERENCE DATA
   Source: Formalwear Master Reference — Shirts, Pants & Blazers
═══════════════════════════════════════════════════ */

/* ── 23 MASTER FABRICS COLLECTION ── */
const MASTER_FABRIC_COLLECTION = [
  {
    id: 'cotton',
    name: 'Cotton',
    desc: 'Crisp, breathable all-natural staple weave. Highly absorbent, durable, and versatile for everyday and formal shirts.',
    swatchUrl: '/image/COTTON FABRICS.jpg',
    formality: 'High',
    priceDelta: 0,
    weave: 'Plain Weave',
    weight: '140 gsm',
    composition: '100% Pure Long-Staple Cotton',
  },
  {
    id: 'linen',
    name: 'Linen',
    desc: 'Ultra-breathable open flax weave with natural slub texture. Keeps you cool in warm climates with distinct relaxed drape.',
    swatchUrl: '/image/LINEN FABRIC.jpg',
    formality: 'Resort / Summer',
    priceDelta: 500,
    weave: 'Open Plain Weave',
    weight: '160 gsm',
    composition: '100% European Organic Flax',
  },
  {
    id: 'oxford',
    name: 'Oxford',
    desc: 'Basket-weave texture made with alternating white and colored threads. Soft, durable, and the definitive smart-casual choice.',
    swatchUrl: '/image/OXFORD FABRICS.jpg',
    formality: 'Med-High',
    priceDelta: 350,
    weave: 'Basket Weave',
    weight: '170 gsm',
    composition: '100% Combed Cotton',
  },
  {
    id: 'poplin',
    name: 'Poplin',
    desc: 'Smooth, tight plain weave with fine horizontal ribs. Crisp finish with minimal texture — the quintessential executive formal choice.',
    swatchUrl: '/image/poplin FABRIC.jpg',
    formality: 'Very High',
    priceDelta: 200,
    weave: 'Fine Poplin Weave',
    weight: '120 gsm',
    composition: '100% Egyptian Giza Cotton',
  },
  {
    id: 'twill',
    name: 'Twill',
    desc: 'Distinctive diagonal rib weave offering rich sheen, exceptional wrinkle resistance, and elegant drape.',
    swatchUrl: '/image/TWILL FABRICS.jpg',
    formality: 'High',
    priceDelta: 400,
    weave: '2/1 Diagonal Twill',
    weight: '165 gsm',
    composition: '100% Long-Staple Twill Cotton',
  },
  {
    id: 'denim',
    name: 'Denim',
    desc: 'Sturdy warp-faced twill textile with indigo dyed warp and white weft. Iconic rugged character that softens beautifully over time.',
    swatchUrl: '/image/DENIM FABRIC.jpg',
    formality: 'Casual / Frontier',
    priceDelta: 450,
    weave: '3/1 Right-Hand Twill',
    weight: '210 gsm',
    composition: '100% Selvedge Cotton Denim',
  },
  {
    id: 'chambray',
    name: 'Chambray',
    desc: 'Lightweight plain weave made with dyed warp and white weft. Looks similar to denim but lighter, softer, and more breathable.',
    swatchUrl: '/image/Chambray FABRIC.jpg',
    formality: 'Smart-Casual',
    priceDelta: 300,
    weave: 'Plain Weave',
    weight: '135 gsm',
    composition: '100% Cotton Chambray',
  },
  {
    id: 'flannel',
    name: 'Flannel',
    desc: 'Brushed surface providing insulating softness and warm tactile comfort. Ideal for autumn, winter, and layered overshirts.',
    swatchUrl: '/image/flannel-fabrics.jpg',
    formality: 'Casual / Winter',
    priceDelta: 600,
    weave: 'Brushed Twill Weave',
    weight: '200 gsm',
    composition: '80% Cotton, 20% Merino Wool Blend',
  },
  {
    id: 'corduroy',
    name: 'Corduroy',
    desc: 'Textured fabric featuring parallel vertical cords (wales) with rich velvety hand and vintage British tailoring heritage.',
    swatchUrl: '/image/Corduroy FABRIC.jpg',
    formality: 'Heritage Casual',
    priceDelta: 700,
    weave: 'Cut-Pile Wale Weave',
    weight: '260 gsm',
    composition: '100% Micro-Wale Cotton',
  },
  {
    id: 'rayon',
    name: 'Rayon',
    desc: 'Silky cellulose fabric with flowing drape, soft moisture-wicking touch, and vibrant color brilliance.',
    swatchUrl: '/image/Rayon FABRIC.jpg',
    formality: 'Medium',
    priceDelta: 300,
    weave: 'Silky Plain Weave',
    weight: '125 gsm',
    composition: '100% Rayon Viscose',
  },
  {
    id: 'viscose',
    name: 'Viscose',
    desc: 'Semi-synthetic fiber offering fluid silk-like luster, cooling breathability, and luxurious movement across the body.',
    swatchUrl: '/image/Viscose FABRIC.jpg',
    formality: 'Med-High',
    priceDelta: 350,
    weave: 'Smooth Viscose Weave',
    weight: '130 gsm',
    composition: '100% Premium Eco-Viscose',
  },
  {
    id: 'polyester',
    name: 'Polyester',
    desc: 'High-performance micro-poly fabric designed for crease recovery, easy-care resilience, and color longevity.',
    swatchUrl: '/image/Polyester FABRIC.jpg',
    formality: 'Standard',
    priceDelta: -100,
    weave: 'Engineered Micro-Weave',
    weight: '150 gsm',
    composition: '100% Performance Polyester',
  },
  {
    id: 'silk',
    name: 'Silk',
    desc: 'Natural mulberry protein filament. Unmatched natural shimmer, fluid drape, and ceremonial high luxury.',
    swatchUrl: '/image/SILK FABRIC.jpg',
    formality: 'Very High / Gala',
    priceDelta: 2400,
    weave: 'Mulberry Silk Weave',
    weight: '90 gsm',
    composition: '100% Pure Mulberry Silk',
  },
  {
    id: 'satin',
    name: 'Satin',
    desc: 'Glossy, highly lustrous surface with dull reverse side. Classic black-tie tuxedo lapels, trims, and evening shirts.',
    swatchUrl: '/image/SATIN.jpg',
    formality: 'Black-Tie / Evening',
    priceDelta: 1800,
    weave: 'Satin Weave (Floating Warp)',
    weight: '140 gsm',
    composition: 'Silk-Polyester Luxury Satin Blend',
  },
  {
    id: 'velvet',
    name: 'Velvet',
    desc: 'Dense cut-pile fabric with deep nap and light-absorbing richness. Luxurious evening jackets and smoking blazers.',
    swatchUrl: '/image/Velvet.jpg',
    formality: 'Evening Luxury',
    priceDelta: 2200,
    weave: 'Double-Cloth Cut-Pile',
    weight: '320 gsm',
    composition: 'Cotton-Silk Plush Velvet',
  },
  {
    id: 'wool',
    name: 'Wool',
    desc: 'Fine worsted natural wool with temperature-regulating crimp, natural stretch, and crisp drape.',
    swatchUrl: '/image/WOOL.jpg',
    formality: 'Very High',
    priceDelta: 1600,
    weave: 'Super 120s Worsted Twill',
    weight: '240 gsm',
    composition: '100% Superfine Australian Merino Wool',
  },
  {
    id: 'seersucker',
    name: 'Seersucker',
    desc: 'Iconic puckered fabric woven with slack-tension yarn. Keeps the fabric away from the skin for optimal air circulation.',
    swatchUrl: '/image/Seersucker.jpg',
    formality: 'Summer High-Style',
    priceDelta: 550,
    weave: 'Slack-Tension Crinkle Weave',
    weight: '130 gsm',
    composition: '100% Puckered Cotton',
  },
  {
    id: 'voile',
    name: 'Voile',
    desc: 'Semi-sheer lightweight fabric woven from high-twist yarn. Crisp yet whisper-soft, perfect for tropical climates.',
    swatchUrl: '/image/Voile.jpg',
    formality: 'Lightweight Formal',
    priceDelta: 400,
    weave: 'High-Twist Plain Weave',
    weight: '85 gsm',
    composition: '100% Swiss Cotton Voile',
  },
  {
    id: 'dobby',
    name: 'Dobby',
    desc: 'Distinctive geometric micro-motifs woven directly into the ground cloth using specialized dobby looms. Subtle richness.',
    swatchUrl: '/image/Dobby.png',
    formality: 'High',
    priceDelta: 650,
    weave: 'Dobby Loom Geometric Weave',
    weight: '145 gsm',
    composition: '100% Dobby Textured Cotton',
  },
  {
    id: 'jacquard',
    name: 'Jacquard',
    desc: 'Complex figured patterns woven directly into the textile with dimensional relief. Exceptional artistic distinction.',
    swatchUrl: '/image/Jacquard.jpg',
    formality: 'Very High / Statement',
    priceDelta: 1200,
    weave: 'Jacquard Damask Weave',
    weight: '190 gsm',
    composition: 'Silk-Cotton Jacquard Brocade',
  },
  {
    id: 'herringbone',
    name: 'Herringbone',
    desc: 'Sophisticated broken-twill chevron pattern. Offers visual structure, wrinkle recovery, and tailored prestige.',
    swatchUrl: '/image/Herringbone.jpg',
    formality: 'High',
    priceDelta: 500,
    weave: 'Broken Chevron Twill',
    weight: '160 gsm',
    composition: '100% Combed Herringbone Cotton',
  },
  {
    id: 'terry',
    name: 'Terry',
    desc: 'Plush looped-pile cotton fabric with high tactile comfort and moisture absorbency. Modern resort & polo styling.',
    swatchUrl: '/image/Terry.jpg',
    formality: 'Resort Casual',
    priceDelta: 300,
    weave: 'Looped Pile Weave',
    weight: '230 gsm',
    composition: '100% French Terry Cotton',
  },
  {
    id: 'jersey',
    name: 'Jersey',
    desc: 'Single-knit stretchy fabric offering supple flexibility and casual drape. Unmatched casual everyday comfort.',
    swatchUrl: '/image/Jersey.jpg',
    formality: 'Casual Stretch',
    priceDelta: 200,
    weave: 'Single Weft Knit',
    weight: '180 gsm',
    composition: '95% Pima Cotton, 5% Elastane',
  },
];

/* ── COLOR SELECTION (28 HUES IN 5 FAMILIES) ── */
const ALL_COLOR_SELECTION = [
  // Classic Essentials & Monochromes
  { id: 'pure-white',     name: 'Pure White',           hex: '#FFFFFF', border: '#D1D5DB', group: 'classic', desc: 'Timeless crisp formal white' },
  { id: 'off-white',      name: 'Off-White / Chalk',    hex: '#F8F9FA', border: '#D1D5DB', group: 'classic', desc: 'Subtle warm architectural white' },
  { id: 'soft-ivory',     name: 'Soft Ivory / Cream',   hex: '#FFFDD0', border: '#D1D5DB', group: 'classic', desc: 'Regal warm vintage undertone' },
  { id: 'jet-black',      name: 'Jet Black',            hex: '#0A0A0A', group: 'classic', desc: 'Deep black for formal & black-tie' },
  { id: 'charcoal-grey',  name: 'Charcoal Grey',        hex: '#2B2D42', group: 'classic', desc: 'Deep boardroom neutral' },
  { id: 'slate-grey',     name: 'Slate Grey',           hex: '#64748B', group: 'classic', desc: 'Balanced cool grey' },
  { id: 'silver-mist',    name: 'Silver Mist',          hex: '#CBD5E1', border: '#94A3B8', group: 'classic', desc: 'Lustrous light metallic grey' },

  // Blues & Navies
  { id: 'midnight-navy',  name: 'Midnight Navy',        hex: '#0F172A', group: 'blues', desc: 'The definitive tailoring navy' },
  { id: 'royal-navy',     name: 'Royal Navy',           hex: '#1E3A8A', group: 'blues', desc: 'Rich deep saturated navy' },
  { id: 'french-blue',    name: 'French Blue',          hex: '#2563EB', group: 'blues', desc: 'Vibrant distinguished blue' },
  { id: 'sky-blue',       name: 'Sky Blue',             hex: '#93C5FD', group: 'blues', desc: 'Classic everyday office staple' },
  { id: 'powder-blue',    name: 'Powder Blue',          hex: '#BFDBFE', border: '#93C5FD', group: 'blues', desc: 'Airy soft pastel blue' },
  { id: 'cerulean',       name: 'Cerulean / Azure',     hex: '#0284C7', group: 'blues', desc: 'Mediterranean bright blue' },
  { id: 'indigo',         name: 'Indigo Chambray',      hex: '#3730A3', group: 'blues', desc: 'Heritage dyed denim blue' },

  // Earth Tones & Greens
  { id: 'forest-green',   name: 'Deep Forest Green',    hex: '#14532D', group: 'earth', desc: 'Earthy luxury tailored green' },
  { id: 'olive-drab',     name: 'Classic Olive Green',  hex: '#3F6212', group: 'earth', desc: 'Tactical and casual earth tone' },
  { id: 'sage-green',     name: 'Sage Green',           hex: '#84A98C', group: 'earth', desc: 'Modern muted herbal tone' },
  { id: 'camel',          name: 'Warm Camel',           hex: '#C19A6B', group: 'earth', desc: 'British heritage luxury tan' },
  { id: 'sand-khaki',     name: 'Sand / Khaki',         hex: '#D4B996', group: 'earth', desc: 'Light neutral casual tone' },
  { id: 'tobacco-brown',  name: 'Tobacco Brown',        hex: '#78350F', group: 'earth', desc: 'Rich warm autumnal brown' },
  { id: 'mocha-espresso', name: 'Dark Mocha',           hex: '#451A03', group: 'earth', desc: 'Deep roasted espresso shade' },

  // Warm & Reds
  { id: 'royal-burgundy', name: 'Royal Burgundy',       hex: '#800020', group: 'warm', desc: 'Aristocratic deep wine' },
  { id: 'crimson-red',    name: 'Crimson Red',          hex: '#991B1B', group: 'warm', desc: 'Bold power statement red' },
  { id: 'burnt-terracotta',name:'Terracotta / Rust',    hex: '#C2410C', group: 'warm', desc: 'Warm Mediterranean terracotta' },
  { id: 'mustard-gold',   name: 'Mustard Gold',         hex: '#B45309', group: 'warm', desc: 'Vintage warm amber tone' },

  // Pastels & Soft Tones
  { id: 'dusty-rose',     name: 'Dusty Rose',           hex: '#FDA4AF', border: '#FB7185', group: 'pastels', desc: 'Sophisticated muted pink' },
  { id: 'pale-lilac',     name: 'Pale Lilac / Lavender',hex: '#DDD6FE', border: '#C4B5FD', group: 'pastels', desc: 'Ethereal subtle purple hue' },
  { id: 'mint-water',     name: 'Mint Water',           hex: '#A7F3D0', border: '#6EE7B7', group: 'pastels', desc: 'Cool refreshing summer pastel' },
];

/* ── TYPES / PATTERN SELECTION (22 TYPES IN 4 GROUPS) ── */
const ALL_TYPE_PATTERNS = [
  // Plain / Solid
  { id: 'solid-smooth',   name: 'Solid / Plain Smooth', type: 'plain',  desc: 'Flawless unpatterned monochromatic surface. Universal formal benchmark.', icon: '■' },
  { id: 'solid-textured', name: 'Solid Textured Weave', type: 'plain',  desc: 'Dimensional woven texture without contrast dye. Subtle refined depth.', icon: '░' },
  { id: 'melange-heather',name: 'Melange / Heathered',  type: 'plain',  desc: 'Interwoven multi-tone fibers creating a soft frosted appearance.', icon: '▒' },

  // Lined / Striped
  { id: 'pinstripe',      name: 'Pinstripe ("Line Line")', type: 'lined', desc: 'Sharp, ultra-thin pinhead stripes. Elongates the torso with precision.', icon: '|||' },
  { id: 'bengal-stripe',  name: 'Bengal Stripe',        type: 'lined', desc: 'Evenly spaced alternating white and colored vertical stripes.', icon: '||||' },
  { id: 'hairline-stripe',name: 'Hairline Micro-Stripe',type: 'lined', desc: 'Ultra-fine stripes placed one thread apart. Appears solid from afar.', icon: '|||||' },
  { id: 'candy-stripe',   name: 'Candy Stripe',         type: 'lined', desc: 'Vibrant medium-width classic summer stripes with crisp contrast.', icon: '❚❚❚' },
  { id: 'chalk-stripe',   name: 'Chalk Stripe',         type: 'lined', desc: 'Soft-edged woven rope or flannel stripes mimicking tailor\'s chalk.', icon: '░|░|' },
  { id: 'awning-stripe',  name: 'Awning / Bold Stripe', type: 'lined', desc: 'Wide architectural statement stripes for high-impact resort wear.', icon: '█ █' },

  // Checks & Plaids
  { id: 'windowpane',     name: 'Windowpane Check',     type: 'check', desc: 'Minimalist wide box check forming clean geometric window panes.', icon: '⊞' },
  { id: 'gingham',        name: 'Gingham Check',        type: 'check', desc: 'Two-color checkered block pattern of equal vertical & horizontal bands.', icon: '▦' },
  { id: 'tattersall',     name: 'Tattersall Grid',      type: 'check', desc: 'Thin dual-color overcheck grid on an off-white background.', icon: '┼┼' },
  { id: 'glen-plaid',     name: 'Glen Plaid / Prince of Wales', type: 'check', desc: 'Legendary criss-cross Glenurquhart check with rich heritage.', icon: '▤' },
  { id: 'tartan-plaid',   name: 'Tartan Heritage Plaid',type: 'check', desc: 'Multi-color highland intersecting horizontal and vertical bands.', icon: '▧' },
  { id: 'micro-check',    name: 'Micro-Graph Check',    type: 'check', desc: 'Tiny millimeter graph-paper check for modern boardroom polish.', icon: '⚏' },
  { id: 'buffalo-check',  name: 'Buffalo Block Check',  type: 'check', desc: 'Oversized lumberjack and overshirt double-tone check pattern.', icon: '◫' },

  // Geometric, Textured & Figures
  { id: 'houndstooth',    name: 'Houndstooth / Dogtooth', type: 'other', desc: 'Famous duotone jagged four-pointed broken check pattern.', icon: '❖' },
  { id: 'herringbone',    name: 'Herringbone Chevron',  type: 'other', desc: 'Distinguished V-shaped broken twill chevron zigzag weave.', icon: '≋' },
  { id: 'birdseye',       name: 'Birdseye Motif',       type: 'other', desc: 'Fine circular woven micro-dots resembling small bird eyes.', icon: '◉' },
  { id: 'nailhead',       name: 'Nailhead Micro-Dot',   type: 'other', desc: 'Square micro-dots creating rich visual texture and clean drape.', icon: '⊡' },
  { id: 'dobby-micro',    name: 'Dobby Geometric',      type: 'other', desc: 'Loom-woven micro diamond or waffle structural pattern.', icon: '◈' },
  { id: 'jacquard-damask',name: 'Jacquard Floral Damask',type: 'other', desc: 'Lustrous figured floral tapestry motif woven for evening gala wear.', icon: '✿' },
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

/* ── SHIRT STYLES (18 CUSTOM MODELS WITH SIGNATURE PRESETS) ── */
const SHIRT_MODELS = [
  {
    id: 'formal',
    name: 'Formal Shirt',
    desc: 'Pristine formal dress shirt designed for black-tie elegance and sharp boardroom tailoring.',
    locks: { collar: 'spread', cuff: 'french', sleeve: 'full', pocket: 'none' },
    features: { collar: 'Spread', cuff: 'French', sleeve: 'Full', pocket: 'None' },
  },
  {
    id: 'casual',
    name: 'Casual Shirt',
    desc: 'Relaxed everyday button-down shirt with durable barrel cuffs and utility chest pocket.',
    locks: { collar: 'button-down', cuff: 'barrel', sleeve: 'full', pocket: 'chest' },
    features: { collar: 'Button-Down', cuff: 'Barrel', sleeve: 'Full', pocket: 'Chest' },
  },
  {
    id: 'oxford',
    name: 'Oxford Shirt',
    desc: 'Heritage basket-weave Oxford shirt with roll collar, rounded barrel cuffs, and single chest pocket.',
    locks: { collar: 'button-down', cuff: 'rounded', sleeve: 'full', pocket: 'chest' },
    features: { collar: 'Button-Down', cuff: 'Rounded', sleeve: 'Full', pocket: 'Chest' },
  },
  {
    id: 'overshirt',
    name: 'Overshirt',
    desc: 'Contemporary layering piece featuring relaxed camp collar, dual-setting adjustable cuffs, and deep patch pocket.',
    locks: { collar: 'camp', cuff: 'adjustable', sleeve: 'full', pocket: 'patch' },
    features: { collar: 'Camp', cuff: 'Adjustable', sleeve: 'Full', pocket: 'Patch' },
  },
  {
    id: 'denim',
    name: 'Denim Shirt',
    desc: 'Authentic washed denim cut with western yoke, pearlized snap button cuffs, and secure flap pocket.',
    locks: { collar: 'western', cuff: 'snap', sleeve: 'full', pocket: 'flap' },
    features: { collar: 'Western', cuff: 'Snap', sleeve: 'Full', pocket: 'Flap' },
  },
  {
    id: 'linen',
    name: 'Linen Shirt',
    desc: 'Ultra-breathable summer linen shirt featuring breezy Cuban collar, folded short cuffs, and clean side slit pockets.',
    locks: { collar: 'cuban', cuff: 'folded', sleeve: 'short', pocket: 'side' },
    features: { collar: 'Cuban', cuff: 'Folded', sleeve: 'Short', pocket: 'Side' },
  },
  {
    id: 'flannel',
    name: 'Flannel Shirt',
    desc: 'Cozy brushed cotton-wool flannel with structured spread collar, sturdy barrel cuffs, and buttoned flap pocket.',
    locks: { collar: 'spread', cuff: 'barrel', sleeve: 'full', pocket: 'flap' },
    features: { collar: 'Spread', cuff: 'Barrel', sleeve: 'Full', pocket: 'Flap' },
  },
  {
    id: 'hawaiian',
    name: 'Hawaiian Shirt',
    desc: 'Resort-ready tropical silhouette with wide notch camp collar, straight short sleeves, and seamless pocketless flow.',
    locks: { collar: 'camp', cuff: 'straight', sleeve: 'short', pocket: 'none' },
    features: { collar: 'Camp', cuff: 'Straight', sleeve: 'Short', pocket: 'None' },
  },
  {
    id: 'cuban-collar',
    name: 'Cuban Collar Shirt',
    desc: 'Retro Riviera statement shirt with open Cuban collar, straight cuffs, and a tailored chest patch pocket.',
    locks: { collar: 'cuban', cuff: 'straight', sleeve: 'short', pocket: 'patch' },
    features: { collar: 'Cuban', cuff: 'Straight', sleeve: 'Short', pocket: 'Patch' },
  },
  {
    id: 'mandarin',
    name: 'Mandarin Shirt',
    desc: 'Sleek minimalist standing mandarin collar with clean button cuffs and a pocketless chest for contemporary eastern elegance.',
    locks: { collar: 'mandarin', cuff: 'button', sleeve: 'full', pocket: 'none' },
    features: { collar: 'Mandarin', cuff: 'Button', sleeve: 'Full', pocket: 'None' },
  },
  {
    id: 'western',
    name: 'Western Shirt',
    desc: 'Frontier heritage design with pointed western collar, pearlescent snap cuffs, and dual front chest pockets.',
    locks: { collar: 'western', cuff: 'snap', sleeve: 'full', pocket: 'double' },
    features: { collar: 'Western', cuff: 'Snap', sleeve: 'Full', pocket: 'Double' },
  },
  {
    id: 'utility',
    name: 'Utility Shirt',
    desc: 'Tactical field aesthetic featuring durable utility collar, adjustable tabs, and multiple cargo pockets.',
    locks: { collar: 'utility', cuff: 'adjustable', sleeve: 'full', pocket: 'multiple' },
    features: { collar: 'Utility', cuff: 'Adjustable', sleeve: 'Full', pocket: 'Multiple' },
  },
  {
    id: 'bowling',
    name: 'Bowling Shirt',
    desc: 'Vintage mid-century classic with two-tone camp collar, straight cut cuffs, and single chest pocket.',
    locks: { collar: 'camp', cuff: 'straight', sleeve: 'short', pocket: 'chest' },
    features: { collar: 'Camp', cuff: 'Straight', sleeve: 'Short', pocket: 'Chest' },
  },
  {
    id: 'dress',
    name: 'Dress Shirt',
    desc: 'Ceremonial white-tie gala dress shirt with wing tip collar for bowties, French double cuffs, and pocketless front.',
    locks: { collar: 'wing', cuff: 'french', sleeve: 'full', pocket: 'none' },
    features: { collar: 'Wing', cuff: 'French', sleeve: 'Full', pocket: 'None' },
  },
  {
    id: 'henley',
    name: 'Henley Shirt',
    desc: 'Modern collarless band neckline with buttoned front placket, short sleeves, and clean pocketless finish.',
    locks: { collar: 'band', cuff: 'button', sleeve: 'short', pocket: 'none' },
    features: { collar: 'Band', cuff: 'Button', sleeve: 'Short', pocket: 'None' },
  },
  {
    id: 'corduroy',
    name: 'Corduroy Shirt',
    desc: 'Richly textured fine-wale micro corduroy with sharp point collar, barrel cuffs, and reinforced chest patch pocket.',
    locks: { collar: 'point', cuff: 'barrel', sleeve: 'full', pocket: 'patch' },
    features: { collar: 'Point', cuff: 'Barrel', sleeve: 'Full', pocket: 'Patch' },
  },
  {
    id: 'shirt-jacket',
    name: 'Shirt Jacket',
    desc: 'Heavyweight overshirt hybrid featuring structured spread collar, dual-setting adjustable cuffs, and oversized dual patch pockets.',
    locks: { collar: 'spread', cuff: 'adjustable', sleeve: 'full', pocket: 'patch' },
    features: { collar: 'Spread', cuff: 'Adjustable', sleeve: 'Full', pocket: 'Patch' },
  },
  {
    id: 'tunic',
    name: 'Tunic Shirt',
    desc: 'Artisan longline tunic shirt featuring regal mandarin collar, full buttoned sleeves, and functional hidden side pockets.',
    locks: { collar: 'mandarin', cuff: 'button', sleeve: 'full', pocket: 'side' },
    features: { collar: 'Mandarin', cuff: 'Button', sleeve: 'Full', pocket: 'Side' },
  },
];

const SHIRT_COLLARS = [
  { id:'spread',      name:'Spread Collar',       desc:'Versatile formal collar. Works with most tie knots.' },
  { id:'button-down', name:'Button-Down Collar',  desc:'Classic roll collar with buttons for casual & Oxford styles.' },
  { id:'camp',        name:'Camp Collar',         desc:'One-piece flat notch open collar for overshirts & bowling styles.' },
  { id:'western',     name:'Western Collar',      desc:'Pointed heritage collar built for rugged frontier & denim looks.' },
  { id:'cuban',       name:'Cuban Collar',        desc:'Retro notched open lapel collar for summer linen shirts.' },
  { id:'mandarin',    name:'Mandarin Collar',     desc:'Minimalist short upright standing collar for modern eastern silhouettes.' },
  { id:'utility',     name:'Utility Collar',      desc:'Heavy-duty reinforced collar built for tactical and field shirts.' },
  { id:'wing',        name:'Wing Collar',         desc:'Folded points reserved for black-tie & white-tie tuxedo shirts.' },
  { id:'band',        name:'Band Collar',         desc:'Collarless neckline band ideal for clean casual Henley wear.' },
  { id:'point',       name:'Point / Straight',    desc:'Classic narrow spread. Traditional and universally appropriate.' },
  { id:'cutaway',     name:'Cutaway Collar',      desc:'Extreme spread — ideal for wide Windsor knots.' },
  { id:'windsor',     name:'Windsor Collar',      desc:'Wide spread named for the Duke of Windsor.' },
  { id:'club',        name:'Club Collar',         desc:'Rounded corners. Elegant Edwardian heritage.' },
];

const SHIRT_CUFFS = [
  { id:'french',      name:'French / Double Cuff', desc:'Folded back, fastened with cufflinks for maximum formality.' },
  { id:'barrel',      name:'Barrel Cuff',          desc:'Single layer, button closure. Everyday formal and casual standard.' },
  { id:'rounded',     name:'Rounded Barrel',       desc:'Curved edge barrel cuff typical of classic Oxford shirts.' },
  { id:'adjustable',  name:'Adjustable Cuff',      desc:'Dual-button sizing cuff for overshirts and jacket hybrids.' },
  { id:'snap',        name:'Snap Fastener Cuff',   desc:'Pearlized heavy-duty snap fasteners for western and denim shirts.' },
  { id:'folded',      name:'Folded Resort Cuff',   desc:'Permanently rolled/folded short hem for breezy linen shirts.' },
  { id:'straight',    name:'Straight Cut Cuff',    desc:'Clean straight-hemmed short sleeve for bowling and Hawaiian shirts.' },
  { id:'button',      name:'Single Button Cuff',   desc:'Clean minimalist single-button closure for tunics and mandarins.' },
  { id:'convertible', name:'Convertible Cuff',     desc:'Dual-purpose cuff that works with either buttons or cufflinks.' },
  { id:'mitred',      name:'Mitred Barrel',        desc:'Angled corner barrel cuff with clean architectural lines.' },
];

const SHIRT_SLEEVES = [
  { id:'full',        name:'Full Sleeve',          desc:'Full length tailored sleeve ending cleanly at the wrist.' },
  { id:'short',       name:'Short Sleeve',         desc:'Relaxed warm-weather sleeve ending mid-bicep.' },
];

const SHIRT_POCKETS = [
  { id:'none',        name:'No Pocket',            desc:'Seamless minimalist front — standard for formal and dress shirts.' },
  { id:'chest',       name:'Single Chest Pocket',  desc:'Tailored left breast pocket for everyday pens or glasses.' },
  { id:'patch',       name:'Patch Pocket',         desc:'Topstitched reinforced patch pocket for casual and corduroy shirts.' },
  { id:'flap',        name:'Flap Pocket',          desc:'Buttoned protective flap pocket for denim and flannel silhouettes.' },
  { id:'side',        name:'Side Seam Pockets',    desc:'Functional hidden side pockets tailored into long tunics and linen.' },
  { id:'double',      name:'Double Chest Pockets', desc:'Symmetrical twin chest pockets with flaps or snaps for western shirts.' },
  { id:'multiple',    name:'Multiple Utility Pockets', desc:'Multi-compartment tactical cargo pockets for overshirts.' },
];

const SHIRT_PLACKETS = [
  { id:'standard',    name:'Standard Placket',     desc:'Traditional button band. Appropriate for all formal contexts.' },
  { id:'french-front',name:'French Front',         desc:'Hidden buttons, very clean flat front. Elevated formal appearance.' },
  { id:'pleated-bib', name:'Pleated Bib Front',    desc:'Formal dress shirts only — black-tie and white-tie events.' },
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
  shirt:  ['Model','Fabric','Color & Pattern','Collar & Cuff','Sleeve & Pocket','Size','Summary'],
  pant:   ['Model','Fabric','Color & Pattern','Details','Size','Summary'],
  blazer: ['Model','Fabric','Color & Pattern','Lapel & Buttons','Vent & Pockets','Fit & Lining','Size','Summary'],
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
  const [inspectFabric, setInspectFabric] = useState<any | null>(null);
  const [inspectTab, setInspectTab] = useState<'image' | 'video'>('image');
  const [colorGroup, setColorGroup] = useState<string>('all');
  const [patternType, setPatternType] = useState<string>('all');

  // ── API fabrics (prefer local master collection with rich images)
  const localFabrics: Record<string,any[]> = { shirt: MASTER_FABRIC_COLLECTION, pant: PANT_FABRICS, blazer: BLAZER_FABRICS };
  const [fabrics, setFabrics] = useState<any[]>(localFabrics[slug]||MASTER_FABRIC_COLLECTION);

  useEffect(()=>{
    if (slug === 'shirt') {
      setFabrics(MASTER_FABRIC_COLLECTION);
    } else {
      getFabrics(slug.toUpperCase()).then(d=>{ if(d?.length) setFabrics(d.map((f:any)=>({ ...f, colors: typeof f.colors==='string' ? f.colors.split(',') : f.colors }))); }).catch(()=>{});
    }
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
          {slug==='shirt'
            ? 'Choose from our 18 iconic shirt silhouettes. Each model features its signature collar, cuff, sleeve, and pocket specifications calibrated by master artisans.'
            : 'The model defines the overall cut and silhouette. Some models lock certain detail options — these will be highlighted when you reach that step.'}
        </p>
        <div className="style-opts-grid">
          {modelList.map((m:any)=>(
            <div key={m.id} className={`style-opt-card${model?.id===m.id?' sel':''}`} onClick={()=>setModel(m)}>
              <div className="style-opt-name">{m.name}</div>
              <div className="style-opt-desc">{m.desc}</div>

              {/* Signature Feature Preview Grid (Shirt Models) */}
              {m.features && (
                <div style={{marginTop:12,padding:'8px 10px',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 10px',fontSize:'.7rem'}}>
                  <div style={{color:'var(--text-3)'}}>Collar: <strong style={{color:'var(--text)'}}>{m.features.collar}</strong></div>
                  <div style={{color:'var(--text-3)'}}>Cuff: <strong style={{color:'var(--text)'}}>{m.features.cuff}</strong></div>
                  <div style={{color:'var(--text-3)'}}>Sleeve: <strong style={{color:'var(--text)'}}>{m.features.sleeve}</strong></div>
                  <div style={{color:'var(--text-3)'}}>Pocket: <strong style={{color:'var(--text)'}}>{m.features.pocket}</strong></div>
                </div>
              )}

              {/* Locks notification pill */}
              {m.locks && Object.keys(m.locks).length>0 && (
                <div style={{marginTop:10,display:'flex',flexWrap:'wrap',gap:5}}>
                  {Object.entries(m.locks).map(([k, v]:any)=>(
                    <span key={k} style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 8px',background:'rgba(236,187,13,.1)',border:'1px solid rgba(236,187,13,.2)',borderRadius:50,fontSize:'.65rem',color:'var(--gold)'}}>
                      <FiLock size={9}/> {k}: {v}
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
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20, flexWrap:'wrap', gap:12}}>
        <div>
          <h2 className="step-heading">Select Fabric Material ({fabrics.length} Fabrics Available)</h2>
          <p style={{color:'var(--text-2)',fontSize:'.88rem',lineHeight:1.6}}>
            Choose from our 23 artisanal fabrics. Click any swatch to select, or click the <strong style={{color:'var(--gold)'}}>🔍 Zoom & Video</strong> button to inspect high-resolution weave texture and drape motion in full screen.
          </p>
        </div>
      </div>

      <div className="fabric-grid">
        {fabrics.map((f:any)=>{
          const isSel = fabric?.id === f.id;
          return (
            <div
              key={f.id}
              className={`fabric-card${isSel ? ' sel' : ''}`}
              onClick={()=>{
                setFabric(f);
                if (!getDetail('color')) setDetail('color', 'Pure White');
                if (!getDetail('pattern')) setDetail('pattern', 'Solid / Plain');
              }}
              style={{position:'relative', cursor:'pointer'}}
            >
              <div className="fabric-swatch" style={{position:'relative', overflow:'hidden'}}>
                <img
                  src={f.swatchUrl || `/image/shirt.jpg`}
                  alt={f.name}
                  style={{transition:'transform 0.3s ease'}}
                  onError={(e)=>{(e.target as HTMLImageElement).src='/image/shirt.jpg';}}
                />
                <button
                  type="button"
                  title="Inspect Texture & Drape Video"
                  onClick={(e)=>{
                    e.stopPropagation();
                    setInspectFabric(f);
                    setInspectTab('image');
                  }}
                  style={{
                    position:'absolute',
                    top:8,
                    right:8,
                    background:'rgba(10,12,18,0.78)',
                    backdropFilter:'blur(4px)',
                    border:'1px solid var(--border-g)',
                    borderRadius:50,
                    color:'var(--gold)',
                    padding:'4px 10px',
                    fontSize:'.7rem',
                    display:'flex',
                    alignItems:'center',
                    gap:4,
                    cursor:'pointer',
                    zIndex:2,
                  }}
                >
                  <FiZoomIn size={12}/> Zoom / Video
                </button>
              </div>

              <div className="fabric-info">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div className="fabric-name">{f.name}</div>
                  {isSel && <span style={{color:'var(--gold)', fontSize:'.75rem', fontWeight:700}}>✓ Selected</span>}
                </div>
                <div className="fabric-desc">{f.description || f.desc}</div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:7}}>
                  <div className="fabric-price">{(f.priceDelta||0)===0 ? 'Included' : `+₹${(f.priceDelta||0).toLocaleString('en-IN')}`}</div>
                  {f.formality && <span style={{fontSize:'.67rem',color:'var(--text-3)',fontStyle:'italic'}}>{f.formality}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Fabric Selected Banner — Links to Step 2 Color & Pattern Selection ── */}
      {fabric && (
        <div style={{marginTop: 32, padding: '20px 24px', background: 'var(--gold-subtle)', border: '1px solid var(--border-g)', borderRadius: 'var(--r-md)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
          <div>
            <span style={{fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.12em', color:'var(--gold)', fontWeight:700}}>Fabric Selected</span>
            <h3 style={{fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', color:'var(--text)', margin:'2px 0'}}>
              {fabric.name} — Ready for Color & Pattern Selection
            </h3>
            <p style={{color:'var(--text-2)', fontSize:'.82rem'}}>
              Continue to Step 2 to explore all 28 curated color tones and 22 pattern types (Plain, Lined / Striped, Checks, and more).
            </p>
          </div>
          <button
            type="button"
            className="btn btn-gold"
            onClick={()=>setStep(2)}
          >
            Choose Color & Pattern <FiArrowRight/>
          </button>
        </div>
      )}

      {/* ── High-Res Zoom & Drape Video Inspection Lightbox Modal ── */}
      {inspectFabric && (
        <div
          style={{
            position:'fixed',
            inset:0,
            background:'rgba(5, 7, 12, 0.88)',
            backdropFilter:'blur(10px)',
            zIndex:99999,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            padding:'20px',
          }}
          onClick={()=>setInspectFabric(null)}
        >
          <div
            style={{
              background:'var(--bg-card)',
              border:'1px solid var(--border-g)',
              borderRadius:'var(--r-lg)',
              maxWidth:'820px',
              width:'100%',
              maxHeight:'92vh',
              overflowY:'auto',
              boxShadow:'0 30px 60px -12px rgba(0,0,0,0.85)',
              position:'relative',
              padding:'28px',
            }}
            onClick={(e)=>e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid var(--border)', paddingBottom:16, marginBottom:20}}>
              <div>
                <span style={{fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.12em', color:'var(--gold)', fontWeight:700}}>Artisanal Fabric Inspection</span>
                <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', color:'var(--text)', margin:'4px 0'}}>
                  {inspectFabric.name}
                </h2>
                <p style={{color:'var(--text-2)', fontSize:'.85rem'}}>
                  {inspectFabric.description || inspectFabric.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={()=>setInspectFabric(null)}
                style={{background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', padding:6, borderRadius:50}}
              >
                <FiX size={24}/>
              </button>
            </div>

            {/* View Switcher: Photo Zoom vs Video Drape */}
            <div style={{display:'flex', gap:10, marginBottom:20}}>
              <button
                type="button"
                onClick={()=>setInspectTab('image')}
                style={{
                  display:'flex',
                  alignItems:'center',
                  gap:8,
                  padding:'10px 18px',
                  borderRadius:'var(--r-sm)',
                  border: inspectTab === 'image' ? '1px solid var(--gold)' : '1px solid var(--border)',
                  background: inspectTab === 'image' ? 'var(--gold-subtle)' : 'var(--bg-el)',
                  color: inspectTab === 'image' ? 'var(--gold)' : 'var(--text-2)',
                  fontWeight: 600,
                  fontSize: '.85rem',
                  cursor:'pointer',
                }}
              >
                <FiZoomIn size={16}/> High-Res Texture Zoom
              </button>
              <button
                type="button"
                onClick={()=>setInspectTab('video')}
                style={{
                  display:'flex',
                  alignItems:'center',
                  gap:8,
                  padding:'10px 18px',
                  borderRadius:'var(--r-sm)',
                  border: inspectTab === 'video' ? '1px solid var(--gold)' : '1px solid var(--border)',
                  background: inspectTab === 'video' ? 'var(--gold-subtle)' : 'var(--bg-el)',
                  color: inspectTab === 'video' ? 'var(--gold)' : 'var(--text-2)',
                  fontWeight: 600,
                  fontSize: '.85rem',
                  cursor:'pointer',
                }}
              >
                <FiFilm size={16}/> Drape & Movement Video
              </button>
            </div>

            {/* Tab 1: Image Zoom View */}
            {inspectTab === 'image' && (
              <div>
                <div style={{borderRadius:'var(--r-md)', overflow:'hidden', border:'1px solid var(--border)', background:'#000', textAlign:'center', position:'relative'}}>
                  <img
                    src={inspectFabric.swatchUrl || '/image/shirt.jpg'}
                    alt={inspectFabric.name}
                    style={{width:'100%', maxHeight:'420px', objectFit:'cover', display:'block'}}
                  />
                  <div style={{position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)', padding:'4px 10px', borderRadius:4, fontSize:'.72rem', color:'var(--text-2)'}}>
                    🔍 100% Macro High-Definition Texture View
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div style={{marginTop:20, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:12}}>
                  <div style={{padding:12, background:'var(--bg-el)', borderRadius:'var(--r-sm)', border:'1px solid var(--border)'}}>
                    <div style={{fontSize:'.68rem', color:'var(--text-3)', textTransform:'uppercase'}}>Weave Architecture</div>
                    <div style={{fontSize:'.88rem', fontWeight:700, color:'var(--text)', marginTop:3}}>{inspectFabric.weave || 'Premium Woven'}</div>
                  </div>
                  <div style={{padding:12, background:'var(--bg-el)', borderRadius:'var(--r-sm)', border:'1px solid var(--border)'}}>
                    <div style={{fontSize:'.68rem', color:'var(--text-3)', textTransform:'uppercase'}}>Fabric Weight</div>
                    <div style={{fontSize:'.88rem', fontWeight:700, color:'var(--text)', marginTop:3}}>{inspectFabric.weight || '150 gsm'}</div>
                  </div>
                  <div style={{padding:12, background:'var(--bg-el)', borderRadius:'var(--r-sm)', border:'1px solid var(--border)'}}>
                    <div style={{fontSize:'.68rem', color:'var(--text-3)', textTransform:'uppercase'}}>Formality Rating</div>
                    <div style={{fontSize:'.88rem', fontWeight:700, color:'var(--gold)', marginTop:3}}>{inspectFabric.formality || 'High'}</div>
                  </div>
                  <div style={{padding:12, background:'var(--bg-el)', borderRadius:'var(--r-sm)', border:'1px solid var(--border)'}}>
                    <div style={{fontSize:'.68rem', color:'var(--text-3)', textTransform:'uppercase'}}>Price Delta</div>
                    <div style={{fontSize:'.88rem', fontWeight:700, color:'var(--text)', marginTop:3}}>
                      {(inspectFabric.priceDelta||0)===0 ? 'Included' : `+₹${(inspectFabric.priceDelta||0).toLocaleString('en-IN')}`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Video Player View */}
            {inspectTab === 'video' && (
              <div>
                <div style={{borderRadius:'var(--r-md)', overflow:'hidden', border:'1px solid var(--border)', background:'#000', position:'relative'}}>
                  <video
                    controls
                    autoPlay
                    playsInline
                    style={{width:'100%', maxHeight:'420px', display:'block', background:'#000'}}
                    src={inspectFabric.videoUrl || `/video/fabrics/${inspectFabric.id}.mp4`}
                    onError={(e) => {
                      const vid = e.currentTarget;
                      if (!vid.src.includes('promo.mp4')) {
                        vid.src = '/video/promo.mp4';
                        vid.play().catch(()=>{});
                      }
                    }}
                  />
                </div>
                <div style={{marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--gold-subtle)', padding:'10px 14px', borderRadius:'var(--r-sm)', border:'1px solid var(--border-g)'}}>
                  <span style={{fontSize:'.78rem', color:'var(--gold)', display:'flex', alignItems:'center', gap:6}}>
                    <FiFilm size={14}/> <strong>Drape & Movement Preview:</strong> Observe wrinkle resistance, hand feel, and natural light reflection.
                  </span>
                  <span style={{fontSize:'.7rem', color:'var(--text-3)'}}>Ready for custom video upload</span>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div style={{marginTop:24, display:'flex', justifyContent:'flex-end', gap:12}}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={()=>setInspectFabric(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={()=>{
                  setFabric(inspectFabric);
                  if (!getDetail('color')) setDetail('color', 'Pure White');
                  if (!getDetail('pattern')) setDetail('pattern', 'Solid / Plain');
                  setInspectFabric(null);
                }}
              >
                <FiCheck size={16}/> Select {inspectFabric.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── Shirt detail steps ── */
  const renderShirtCollarsAndCuffs = ()=>(
    <div>
      <h2 className="step-heading">Collar Style</h2>
      <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:20}}>
        The collar establishes the neckline formality and stance. Options locked by the selected model are preserved for authentic silhouette styling.
      </p>
      {isLocked('collar') && <div style={{marginBottom:16}}><LockedOption label="Collar" value={details.collar||''}/></div>}
      <div className="style-opts-grid">
        {SHIRT_COLLARS.map(c=><OptionCard key={c.id} item={c} sel={getDetail('collar')===c.id} onSelect={()=>setDetail('collar',c.id)} locked={isLocked('collar')}/>)}
      </div>

      <h2 className="step-heading" style={{marginTop:36}}>Cuff Style</h2>
      <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:20}}>
        Select your wrist cuff construction. French cuffs require cufflinks, while barrel and snap cuffs offer everyday versatility.
      </p>
      {isLocked('cuff') && <div style={{marginBottom:16}}><LockedOption label="Cuff" value={details.cuff||''}/></div>}
      <div className="style-opts-grid">
        {SHIRT_CUFFS.map(c=><OptionCard key={c.id} item={c} sel={getDetail('cuff')===c.id} onSelect={()=>setDetail('cuff',c.id)} locked={isLocked('cuff')}/>)}
      </div>
    </div>
  );

  const renderShirtSleevePocketPlacket = ()=>(
    <div>
      <h2 className="step-heading">Sleeve Length</h2>
      <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:20}}>
        Choose between full tailored wrist sleeves or relaxed short sleeves.
      </p>
      {isLocked('sleeve') && <div style={{marginBottom:16}}><LockedOption label="Sleeve" value={details.sleeve||''}/></div>}
      <div className="style-opts-grid">
        {SHIRT_SLEEVES.map(s=><OptionCard key={s.id} item={s} sel={getDetail('sleeve')===s.id} onSelect={()=>setDetail('sleeve',s.id)} locked={isLocked('sleeve')}/>)}
      </div>

      <h2 className="step-heading" style={{marginTop:36}}>Pocket Design</h2>
      <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:20}}>
        Select your pocket configuration. Formal dress shirts are classically seamless and pocketless.
      </p>
      {isLocked('pocket') && <div style={{marginBottom:16}}><LockedOption label="Pocket" value={details.pocket||''}/></div>}
      <div className="style-opts-grid">
        {SHIRT_POCKETS.map(p=><OptionCard key={p.id} item={p} sel={getDetail('pocket')===p.id} onSelect={()=>setDetail('pocket',p.id)} locked={isLocked('pocket')}/>)}
      </div>

      <h2 className="step-heading" style={{marginTop:36}}>Front Placket</h2>
      <p style={{color:'var(--text-2)',fontSize:'.88rem',marginBottom:20}}>
        Select front button placket styling down the center chest.
      </p>
      {isLocked('placket') && <div style={{marginBottom:16}}><LockedOption label="Placket" value={details.placket||''}/></div>}
      <div className="style-opts-grid">
        {SHIRT_PLACKETS.map(pl=><OptionCard key={pl.id} item={pl} sel={getDetail('placket')===pl.id} onSelect={()=>setDetail('placket',pl.id)} locked={isLocked('placket')}/>)}
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

  /* ── Dedicated Step 2: COLOR SELECTION & TYPES / PATTERN SELECTION ── */
  const renderColorAndPattern = () => {
    const filteredColors = colorGroup === 'all'
      ? ALL_COLOR_SELECTION
      : ALL_COLOR_SELECTION.filter(c => c.group === colorGroup);

    const filteredPatterns = patternType === 'all'
      ? ALL_TYPE_PATTERNS
      : ALL_TYPE_PATTERNS.filter(p => p.type === patternType);

    const activeColor = getDetail('color') || 'Pure White';
    const activePattern = getDetail('pattern') || 'Solid / Plain Smooth';

    return (
      <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:24, padding:'16px 20px', background:'var(--bg-el)', border:'1px solid var(--border-g)', borderRadius:'var(--r-md)'}}>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <img
              src={fabric?.swatchUrl || '/image/shirt.jpg'}
              alt={fabric?.name || 'Fabric'}
              style={{width:54, height:54, borderRadius:'var(--r-sm)', objectFit:'cover', border:'1px solid var(--gold)'}}
            />
            <div>
              <span style={{fontSize:'.68rem', textTransform:'uppercase', letterSpacing:'.12em', color:'var(--gold)', fontWeight:700}}>Selected Fabric Material</span>
              <h3 style={{fontFamily:"'Playfair Display',serif", fontSize:'1.35rem', color:'var(--text)', margin:'2px 0'}}>
                {fabric?.name || 'Selected Fabric'}
              </h3>
              <div style={{fontSize:'.78rem', color:'var(--text-3)'}}>
                Current Dye: <strong style={{color:'var(--gold)'}}>{activeColor}</strong> · Type: <strong style={{color:'var(--gold)'}}>{activePattern}</strong>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={()=>setStep(1)}
          >
            Change Fabric
          </button>
        </div>

        {/* ── 1. COLOR SELECTION ── */}
        <div style={{marginBottom:40, padding:24, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-md)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:16}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <FiDroplet style={{color:'var(--gold)'}} size={18}/>
                <h2 className="step-heading" style={{margin:0, fontSize:'1.3rem'}}>Color Selection ({ALL_COLOR_SELECTION.length} Curated Hues)</h2>
              </div>
              <p style={{color:'var(--text-2)', fontSize:'.85rem', marginTop:4}}>
                Select from our heritage dyework shades. Active Color: <strong style={{color:'var(--gold)'}}>{activeColor}</strong>
              </p>
            </div>

            {/* Color Filter Tabs */}
            <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
              {[
                { id: 'all', label: 'All Colors' },
                { id: 'classic', label: 'Classic & Monochromes' },
                { id: 'blues', label: 'Blues & Navies' },
                { id: 'earth', label: 'Earth & Greens' },
                { id: 'warm', label: 'Warm & Reds' },
                { id: 'pastels', label: 'Pastels' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={()=>setColorGroup(tab.id)}
                  style={{
                    padding:'5px 12px',
                    borderRadius:50,
                    border: colorGroup === tab.id ? '1px solid var(--gold)' : '1px solid var(--border)',
                    background: colorGroup === tab.id ? 'var(--gold-subtle)' : 'var(--bg-el)',
                    color: colorGroup === tab.id ? 'var(--gold)' : 'var(--text-3)',
                    fontSize:'.75rem',
                    cursor:'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:10}}>
            {filteredColors.map(c => {
              const isSel = activeColor === c.name;
              return (
                <div
                  key={c.id}
                  onClick={()=>setDetail('color', c.name)}
                  style={{
                    display:'flex',
                    alignItems:'center',
                    gap:12,
                    padding:'10px 14px',
                    borderRadius:'var(--r-sm)',
                    border: isSel ? '2px solid var(--gold)' : '1px solid var(--border)',
                    background: isSel ? 'var(--gold-subtle)' : 'var(--bg-el)',
                    cursor:'pointer',
                    transition:'all 0.15s ease',
                  }}
                >
                  <span style={{
                    width:26,
                    height:26,
                    borderRadius:'50%',
                    background:c.hex,
                    display:'inline-block',
                    flexShrink:0,
                    border: c.border ? `1px solid ${c.border}` : '1px solid rgba(255,255,255,0.2)',
                    boxShadow:'0 2px 5px rgba(0,0,0,0.35)',
                  }}/>
                  <div style={{overflow:'hidden'}}>
                    <div style={{fontSize:'.82rem', fontWeight: isSel ? 700 : 600, color:'var(--text)', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>
                      {c.name}
                    </div>
                    <div style={{fontSize:'.67rem', color:'var(--text-3)', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>
                      {c.desc}
                    </div>
                  </div>
                  {isSel && <FiCheck style={{marginLeft:'auto', color:'var(--gold)', flexShrink:0}} size={14}/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2. TYPES / PATTERN SELECTION ── */}
        <div style={{padding:24, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-md)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:16}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <FiLayers style={{color:'var(--gold)'}} size={18}/>
                <h2 className="step-heading" style={{margin:0, fontSize:'1.3rem'}}>Types & Pattern Selection ({ALL_TYPE_PATTERNS.length} Types Available)</h2>
              </div>
              <p style={{color:'var(--text-2)', fontSize:'.85rem', marginTop:4}}>
                Choose your structural weave: Plain, Lined / Striped, Checks, or Geometric. Active: <strong style={{color:'var(--gold)'}}>{activePattern}</strong>
              </p>
            </div>

            {/* Type Filter Tabs */}
            <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
              {[
                { id: 'all', label: 'All Types' },
                { id: 'plain', label: 'Plain / Solid' },
                { id: 'lined', label: 'Lined / Striped' },
                { id: 'check', label: 'Checks & Plaids' },
                { id: 'other', label: 'Micro & Geometric' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={()=>setPatternType(tab.id)}
                  style={{
                    padding:'5px 12px',
                    borderRadius:50,
                    border: patternType === tab.id ? '1px solid var(--gold)' : '1px solid var(--border)',
                    background: patternType === tab.id ? 'var(--gold-subtle)' : 'var(--bg-el)',
                    color: patternType === tab.id ? 'var(--gold)' : 'var(--text-3)',
                    fontSize:'.75rem',
                    cursor:'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="style-opts-grid">
            {filteredPatterns.map(p => {
              const isSel = activePattern === p.name;
              return (
                <div
                  key={p.id}
                  className={`style-opt-card${isSel ? ' sel' : ''}`}
                  onClick={()=>setDetail('pattern', p.name)}
                  style={{cursor:'pointer'}}
                >
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                    <span style={{fontFamily:'monospace', fontSize:'1.2rem', color:'var(--gold)', letterSpacing:3}}>
                      {p.icon}
                    </span>
                    {isSel && (
                      <span style={{display:'inline-flex', alignItems:'center', gap:3, color:'var(--gold)', fontSize:'.72rem', fontWeight:700}}>
                        <FiCheck size={12}/> Selected
                      </span>
                    )}
                  </div>
                  <div className="style-opt-name">{p.name}</div>
                  <div className="style-opt-desc">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /* ── Step router ── */
  const renderStep = ()=>{
    if (slug==='shirt') {
      switch(step){
        case 0: return renderModels();
        case 1: return renderFabrics();
        case 2: return renderColorAndPattern();
        case 3: return renderShirtCollarsAndCuffs();
        case 4: return renderShirtSleevePocketPlacket();
        case 5: return renderSize();
        case 6: return renderSummary();
        default: return renderSummary();
      }
    }
    if (slug==='pant') {
      switch(step){
        case 0: return renderModels();
        case 1: return renderFabrics();
        case 2: return renderColorAndPattern();
        case 3: return renderPantDetails();
        case 4: return renderSize();
        case 5: return renderSummary();
        default: return renderSummary();
      }
    }
    // blazer
    switch(step){
      case 0: return renderModels();
      case 1: return renderFabrics();
      case 2: return renderColorAndPattern();
      case 3: return renderBlazerLapelButtons();
      case 4: return renderBlazerVentPockets();
      case 5: return renderBlazerFitLining();
      case 6: return renderSize();
      case 7: return renderSummary();
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
            getDetail('color')   && ['Color',   getDetail('color')],
            getDetail('pattern') && ['Pattern', getDetail('pattern')],
            selSize && ['Size Fit', selSize],
            measures?.chest && ['Chest', `${measures.chest}"`],
            measures?.waist && ['Waist', `${measures.waist}"`],
            measures?.shoulder && ['Shoulder', `${measures.shoulder}"`],
            getDetail('collar')  && ['Collar', getDetail('collar')],
            getDetail('cuff')    && ['Cuff',   getDetail('cuff')],
            getDetail('sleeve')  && ['Sleeve', getDetail('sleeve')],
            getDetail('pocket')  && ['Pocket', getDetail('pocket')],
            getDetail('placket') && ['Placket', getDetail('placket')],
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
