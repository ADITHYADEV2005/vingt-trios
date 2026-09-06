import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database...');

  // 1. Create Default Users with different roles
  const hashedPassword = await bcrypt.hash('VingtTrios123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'adithyadevkichu@gmail.com' },
    update: {},
    create: {
      email: 'adithyadevkichu@gmail.com',
      password: hashedPassword,
      name: 'Adithya Dev (Admin)',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@vingttrios.com' },
    update: {},
    create: {
      email: 'customer@vingttrios.com',
      password: hashedPassword,
      name: 'Adithya Dev',
      role: 'CUSTOMER',
    },
  });

  const tailorUser1 = await prisma.user.upsert({
    where: { email: 'tailor1@vingttrios.com' },
    update: {},
    create: {
      email: 'tailor1@vingttrios.com',
      password: hashedPassword,
      name: 'Sugandhi',
      role: 'TAILOR',
    },
  });

  const tailorUser2 = await prisma.user.upsert({
    where: { email: 'tailor2@vingttrios.com' },
    update: {},
    create: {
      email: 'tailor2@vingttrios.com',
      password: hashedPassword,
      name: 'Karuna',
      role: 'TAILOR',
    },
  });

  const designerUser = await prisma.user.upsert({
    where: { email: 'designer@vingttrios.com' },
    update: {},
    create: {
      email: 'designer@vingttrios.com',
      password: hashedPassword,
      name: 'Zara Couture (Fashion Designer)',
      role: 'DESIGNER',
    },
  });

  console.log('Users seeded successfully.');

  // 2. Create Tailor Profiles for selection in the customization flow
  await prisma.tailorProfile.deleteMany({});
  
  const tailor1 = await prisma.tailorProfile.create({
    data: {
      userId: tailorUser1.id,
      name: 'Sugandhi',
      rating: 4.9,
      charge: 1800.0,
      turnaroundDays: 5,
      bio: 'Over 25 years of bespoke tailoring experience specializing in premium Italian suits and classic formal shirts.',
      portfolioImages: '/image/BLAZER.jpg,/image/shirt.jpg',
      applicationStatus: 'APPROVED',
    },
  });

  const tailor2 = await prisma.tailorProfile.create({
    data: {
      userId: tailorUser2.id,
      name: 'Karuna',
      rating: 4.6,
      charge: 1200.0,
      turnaroundDays: 8,
      bio: 'High precision commercial tailoring team offering affordable custom fits and durable everyday formal wear.',
      portfolioImages: '/image/pant.jpg,/image/shirt we.jpg',
      applicationStatus: 'APPROVED',
    },
  });

  console.log('Tailor profiles seeded.');

  // 3. Seed Fabrics
  await prisma.fabric.deleteMany({});

  const fabrics = [
    // 23 Master Shirt Fabrics
    {
      name: 'Cotton',
      description: 'Crisp, breathable all-natural staple weave. Highly absorbent, durable, and versatile for everyday and formal shirts.',
      category: 'SHIRT',
      priceDelta: 0.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/COTTON FABRICS.jpg',
    },
    {
      name: 'Linen',
      description: 'Ultra-breathable open flax weave with natural slub texture. Keeps you cool in warm climates with distinct relaxed drape.',
      category: 'SHIRT',
      priceDelta: 500.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/LINEN FABRIC.jpg',
    },
    {
      name: 'Oxford',
      description: 'Basket-weave texture made with alternating white and colored threads. Soft, durable, and the definitive smart-casual choice.',
      category: 'SHIRT',
      priceDelta: 350.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/OXFORD FABRICS.jpg',
    },
    {
      name: 'Poplin',
      description: 'Smooth, tight plain weave with fine horizontal ribs. Crisp finish with minimal texture — the quintessential executive formal choice.',
      category: 'SHIRT',
      priceDelta: 200.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/poplin FABRIC.jpg',
    },
    {
      name: 'Twill',
      description: 'Distinctive diagonal rib weave offering rich sheen, exceptional wrinkle resistance, and elegant drape.',
      category: 'SHIRT',
      priceDelta: 400.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/TWILL FABRICS.jpg',
    },
    {
      name: 'Denim',
      description: 'Sturdy warp-faced twill textile with indigo dyed warp and white weft. Iconic rugged character that softens beautifully over time.',
      category: 'SHIRT',
      priceDelta: 450.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/DENIM FABRIC.jpg',
    },
    {
      name: 'Chambray',
      description: 'Lightweight plain weave made with dyed warp and white weft. Looks similar to denim but lighter, softer, and more breathable.',
      category: 'SHIRT',
      priceDelta: 300.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Chambray FABRIC.jpg',
    },
    {
      name: 'Flannel',
      description: 'Brushed surface providing insulating softness and warm tactile comfort. Ideal for autumn, winter, and layered overshirts.',
      category: 'SHIRT',
      priceDelta: 600.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/flannel-fabrics.jpg',
    },
    {
      name: 'Corduroy',
      description: 'Textured fabric featuring parallel vertical cords (wales) with rich velvety hand and vintage British tailoring heritage.',
      category: 'SHIRT',
      priceDelta: 700.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Corduroy FABRIC.jpg',
    },
    {
      name: 'Rayon',
      description: 'Silky cellulose fabric with flowing drape, soft moisture-wicking touch, and vibrant color brilliance.',
      category: 'SHIRT',
      priceDelta: 300.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Rayon FABRIC.jpg',
    },
    {
      name: 'Viscose',
      description: 'Semi-synthetic fiber offering fluid silk-like luster, cooling breathability, and luxurious movement across the body.',
      category: 'SHIRT',
      priceDelta: 350.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Viscose FABRIC.jpg',
    },
    {
      name: 'Polyester',
      description: 'High-performance micro-poly fabric designed for crease recovery, easy-care resilience, and color longevity.',
      category: 'SHIRT',
      priceDelta: -100.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Polyester FABRIC.jpg',
    },
    {
      name: 'Silk',
      description: 'Natural mulberry protein filament. Unmatched natural shimmer, fluid drape, and ceremonial high luxury.',
      category: 'SHIRT',
      priceDelta: 2400.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/SILK FABRIC.jpg',
    },
    {
      name: 'Satin',
      description: 'Glossy, highly lustrous surface with dull reverse side. Classic black-tie tuxedo lapels, trims, and evening shirts.',
      category: 'SHIRT',
      priceDelta: 1800.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/SATIN.jpg',
    },
    {
      name: 'Velvet',
      description: 'Dense cut-pile fabric with deep nap and light-absorbing richness. Luxurious evening jackets and smoking blazers.',
      category: 'SHIRT',
      priceDelta: 2200.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Velvet.jpg',
    },
    {
      name: 'Wool',
      description: 'Fine worsted natural wool with temperature-regulating crimp, natural stretch, and crisp drape.',
      category: 'SHIRT',
      priceDelta: 1600.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/WOOL.jpg',
    },
    {
      name: 'Seersucker',
      description: 'Iconic puckered fabric woven with slack-tension yarn. Keeps the fabric away from the skin for optimal air circulation.',
      category: 'SHIRT',
      priceDelta: 550.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Seersucker.jpg',
    },
    {
      name: 'Voile',
      description: 'Semi-sheer lightweight fabric woven from high-twist yarn. Crisp yet whisper-soft, perfect for tropical climates.',
      category: 'SHIRT',
      priceDelta: 400.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Voile.jpg',
    },
    {
      name: 'Dobby',
      description: 'Distinctive geometric micro-motifs woven directly into the ground cloth using specialized dobby looms. Subtle richness.',
      category: 'SHIRT',
      priceDelta: 650.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Dobby.png',
    },
    {
      name: 'Jacquard',
      description: 'Complex figured patterns woven directly into the textile with dimensional relief. Exceptional artistic distinction.',
      category: 'SHIRT',
      priceDelta: 1200.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Jacquard.jpg',
    },
    {
      name: 'Herringbone',
      description: 'Sophisticated broken-twill chevron pattern. Offers visual structure, wrinkle recovery, and tailored prestige.',
      category: 'SHIRT',
      priceDelta: 500.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Herringbone.jpg',
    },
    {
      name: 'Terry',
      description: 'Plush looped-pile cotton fabric with high tactile comfort and moisture absorbency. Modern resort & polo styling.',
      category: 'SHIRT',
      priceDelta: 300.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Terry.jpg',
    },
    {
      name: 'Jersey',
      description: 'Single-knit stretchy fabric offering supple flexibility and casual drape. Unmatched casual everyday comfort.',
      category: 'SHIRT',
      priceDelta: 200.0,
      colors: 'Pure White,Sky Blue,Midnight Navy,Charcoal Grey,Jet Black,Forest Green,Warm Camel,Royal Burgundy,Soft Ivory,Dusty Rose',
      swatchUrl: '/image/Jersey.jpg',
    },

    // Pants Fabrics
    {
      name: 'Fine Cotton Chino',
      description: 'Midweight, versatile twill. Combines structure and comfort. Machine-washable.',
      category: 'PANT',
      priceDelta: 0.0,
      colors: 'Khaki,Stone,Charcoal,Black,Navy Blue',
      swatchUrl: '/image/wash.jpg',
    },
    {
      name: 'Tropical Wool',
      description: 'Breathable, lightweight worsted wool weave suitable for warmer climates.',
      category: 'PANT',
      priceDelta: 1200.0,
      colors: 'Midnight Blue,Slate Grey,Charcoal,Black',
      swatchUrl: '/image/sun.jpg',
    },
    {
      name: 'Premium Corduroy',
      description: 'Thick, ribbed vintage-style fabric offering excellent warmth and a smart-casual texture.',
      category: 'PANT',
      priceDelta: 900.0,
      colors: 'Mocha,Taupe,Forest Green,Wheat',
      swatchUrl: '/image/oil.jpg',
    },

    // Blazers Fabrics
    {
      name: '100% Worsted Wool (Super 120s)',
      description: 'Premium, drape-perfect wool. Soft hand feel, wrinkle resistant, and fits beautifully.',
      category: 'BLAZER',
      priceDelta: 0.0,
      colors: 'Navy Blue,Charcoal,Black,Steel Grey',
      swatchUrl: '/image/BLAZER.jpg',
    },
    {
      name: 'Luxury Velvet Blend',
      description: 'Rich, deep pile velvet with a high-luster finish. Exquisite look for dinner jackets and tuxedos.',
      category: 'BLAZER',
      priceDelta: 3500.0,
      colors: 'Burgundy,Emerald Green,Deep Purple,Black',
      swatchUrl: '/image/balm.jpg',
    },
    {
      name: 'Hopsack Wool-Silk-Linen',
      description: 'Textured open weave blazer fabric. Excellent for relaxed deconstructed smart-casual jackets.',
      category: 'BLAZER',
      priceDelta: 2200.0,
      colors: 'Steel Grey,Dusty Blue,Sand,Champagne',
      swatchUrl: '/image/frag.png',
    },
  ];

  for (const fabric of fabrics) {
    await prisma.fabric.create({ data: fabric });
  }
  console.log('Fabrics seeded.');

  // 4. Seed PreDesignedGarments (18 Featured Shirt Models + Pants + Blazers)
  await prisma.preDesignedGarment.deleteMany({});

  const preDesigned = [
    // 18 Featured Shirt Models based on master tailoring reference
    {
      name: 'Formal Shirt',
      description: 'Collar: Spread | Cuff: French | Sleeve: Full | Pocket: None. Pristine formal dress shirt designed for black-tie elegance and sharp boardroom tailoring.',
      category: 'SHIRT',
      basePrice: 2799.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Egyptian Poplin Cotton',
      color: 'Pure White',
      fit: 'Slim Fit',
    },
    {
      name: 'Casual Shirt',
      description: 'Collar: Button-Down | Cuff: Barrel | Sleeve: Full | Pocket: Chest. Relaxed everyday button-down shirt with durable barrel cuffs and utility chest pocket.',
      category: 'SHIRT',
      basePrice: 2299.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Cotton Twill',
      color: 'Heather Grey',
      fit: 'Regular Fit',
    },
    {
      name: 'Oxford Shirt',
      description: 'Collar: Button-Down | Cuff: Rounded | Sleeve: Full | Pocket: Chest. Heritage basket-weave Oxford shirt with roll collar, rounded barrel cuffs, and single chest pocket.',
      category: 'SHIRT',
      basePrice: 2699.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Royal Oxford Cotton',
      color: 'Sky Blue',
      fit: 'Slim Fit',
    },
    {
      name: 'Overshirt',
      description: 'Collar: Camp | Cuff: Adjustable | Sleeve: Full | Pocket: Patch. Contemporary layering piece featuring relaxed camp collar, dual-setting adjustable cuffs, and deep patch pocket.',
      category: 'SHIRT',
      basePrice: 3499.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Heavy Cotton Twill',
      color: 'Olive Green',
      fit: 'Relaxed Fit',
    },
    {
      name: 'Denim Shirt',
      description: 'Collar: Western | Cuff: Snap | Sleeve: Full | Pocket: Flap. Authentic washed denim cut with western yoke, pearlized snap button cuffs, and secure flap pocket.',
      category: 'SHIRT',
      basePrice: 2999.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Washed Indigo Denim',
      color: 'Indigo Blue',
      fit: 'Regular Fit',
    },
    {
      name: 'Linen Shirt',
      description: 'Collar: Cuban | Cuff: Folded | Sleeve: Short | Pocket: Side. Ultra-breathable summer linen shirt featuring breezy Cuban collar, folded short cuffs, and clean side slit pockets.',
      category: 'SHIRT',
      basePrice: 2899.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Premium Linen Blend',
      color: 'Natural Beige',
      fit: 'Relaxed Fit',
    },
    {
      name: 'Flannel Shirt',
      description: 'Collar: Spread | Cuff: Barrel | Sleeve: Full | Pocket: Flap. Cozy brushed cotton-wool flannel with structured spread collar, sturdy barrel cuffs, and buttoned flap pocket.',
      category: 'SHIRT',
      basePrice: 3199.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Brushed Wool-Cotton Flannel',
      color: 'Burgundy Plaid',
      fit: 'Regular Fit',
    },
    {
      name: 'Hawaiian Shirt',
      description: 'Collar: Camp | Cuff: Straight | Sleeve: Short | Pocket: None. Resort-ready tropical silhouette with wide notch camp collar, straight short sleeves, and seamless pocketless flow.',
      category: 'SHIRT',
      basePrice: 2499.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Lightweight Viscose',
      color: 'Floral Ocean',
      fit: 'Relaxed Fit',
    },
    {
      name: 'Cuban Collar Shirt',
      description: 'Collar: Cuban | Cuff: Straight | Sleeve: Short | Pocket: Patch. Retro Riviera statement shirt with open Cuban collar, straight cuffs, and a tailored chest patch pocket.',
      category: 'SHIRT',
      basePrice: 2599.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Textured Dobby Cotton',
      color: 'Terra Cotta',
      fit: 'Relaxed Fit',
    },
    {
      name: 'Mandarin Shirt',
      description: 'Collar: Mandarin | Cuff: Button | Sleeve: Full | Pocket: None. Sleek minimalist standing mandarin collar with clean button cuffs and a pocketless chest for contemporary eastern elegance.',
      category: 'SHIRT',
      basePrice: 2699.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Fil-à-fil Cotton',
      color: 'Off-White',
      fit: 'Slim Fit',
    },
    {
      name: 'Western Shirt',
      description: 'Collar: Western | Cuff: Snap | Sleeve: Full | Pocket: Double. Frontier heritage design with pointed western collar, pearlescent snap cuffs, and dual front chest pockets.',
      category: 'SHIRT',
      basePrice: 3299.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Structured Chambray',
      color: 'Raw Blue',
      fit: 'Regular Fit',
    },
    {
      name: 'Utility Shirt',
      description: 'Collar: Utility | Cuff: Adjustable | Sleeve: Full | Pocket: Multiple. Tactical field aesthetic featuring durable utility collar, adjustable tabs, and multiple cargo pockets.',
      category: 'SHIRT',
      basePrice: 3599.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Ripstop Cotton',
      color: 'Charcoal Grey',
      fit: 'Relaxed Fit',
    },
    {
      name: 'Bowling Shirt',
      description: 'Collar: Camp | Cuff: Straight | Sleeve: Short | Pocket: Chest. Vintage mid-century classic with two-tone camp collar, straight cut cuffs, and single chest pocket.',
      category: 'SHIRT',
      basePrice: 2799.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Silk-Cotton Blend',
      color: 'Black & Cream',
      fit: 'Relaxed Fit',
    },
    {
      name: 'Dress Shirt',
      description: 'Collar: Wing | Cuff: French | Sleeve: Full | Pocket: None. Ceremonial white-tie gala dress shirt with wing tip collar for bowties, French double cuffs, and pocketless front.',
      category: 'SHIRT',
      basePrice: 3899.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Egyptian Poplin Cotton',
      color: 'Pure White',
      fit: 'Slim Fit',
    },
    {
      name: 'Henley Shirt',
      description: 'Collar: Band | Cuff: Button | Sleeve: Short | Pocket: None. Modern collarless band neckline with buttoned front placket, short sleeves, and clean pocketless finish.',
      category: 'SHIRT',
      basePrice: 1999.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Mercerized Waffle Cotton',
      color: 'Navy Blue',
      fit: 'Slim Fit',
    },
    {
      name: 'Corduroy Shirt',
      description: 'Collar: Point | Cuff: Barrel | Sleeve: Full | Pocket: Patch. Richly textured fine-wale micro corduroy with sharp point collar, barrel cuffs, and reinforced chest patch pocket.',
      category: 'SHIRT',
      basePrice: 3399.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Fine Wale Corduroy',
      color: 'Caramel Brown',
      fit: 'Regular Fit',
    },
    {
      name: 'Shirt Jacket',
      description: 'Collar: Spread | Cuff: Adjustable | Sleeve: Full | Pocket: Patch. Heavyweight overshirt hybrid featuring structured spread collar, dual-setting adjustable cuffs, and oversized dual patch pockets.',
      category: 'SHIRT',
      basePrice: 4299.0,
      imageUrl: '/image/shirt.jpg',
      fabricName: 'Wool-Cotton Blend',
      color: 'Charcoal',
      fit: 'Relaxed Fit',
    },
    {
      name: 'Tunic Shirt',
      description: 'Collar: Mandarin | Cuff: Button | Sleeve: Full | Pocket: Side. Artisan longline tunic shirt featuring regal mandarin collar, full buttoned sleeves, and functional hidden side pockets.',
      category: 'SHIRT',
      basePrice: 2999.0,
      imageUrl: '/image/shirt we.jpg',
      fabricName: 'Raw Textured Cotton',
      color: 'Ivory',
      fit: 'Regular Fit',
    },

    // Pants
    {
      name: 'Savile Row Charcoal Suit Pants',
      description: 'Premium Tropical Wool dress pants in dark Charcoal. Single pleat front, extended waistband, cigarette leg profile.',
      category: 'PANT',
      basePrice: 4299.0,
      imageUrl: '/image/pant.jpg',
      fabricName: 'Tropical Wool',
      color: 'Charcoal',
      fit: 'Slim Fit',
    },
    {
      name: 'Urban Explorer Khaki Chinos',
      description: 'Flat front, active stretch cotton chinos in Khaki. Classic rise, comfortable waist, ideal for day-long meetings.',
      category: 'PANT',
      basePrice: 2999.0,
      imageUrl: '/image/pant we.jpg',
      fabricName: 'Fine Cotton Chino',
      color: 'Khaki',
      fit: 'Regular Fit',
    },

    // Blazers
    {
      name: 'The Admiral Navy Blazer',
      description: 'Super 120s Worsted Wool navy blazer. Single-breasted, notch lapel, double button closure, patch pockets, and dual vents.',
      category: 'BLAZER',
      basePrice: 9999.0,
      imageUrl: '/image/BLAZER.jpg',
      fabricName: '100% Worsted Wool (Super 120s)',
      color: 'Navy Blue',
      fit: 'Regular Fit',
    },
    {
      name: 'Nocturnal Black Tuxedo',
      description: 'Stunning black velvet blend tuxedo jacket. Double-breasted, shawl lapel with satin overlay, jetted pockets, and no vents.',
      category: 'BLAZER',
      basePrice: 13999.0,
      imageUrl: '/image/bw blaz.jpg',
      fabricName: 'Luxury Velvet Blend',
      color: 'Black',
      fit: 'Slim Fit',
    },
  ];

  for (const item of preDesigned) {
    await prisma.preDesignedGarment.create({ data: item });
  }
  console.log(`Pre-designed garments seeded (${preDesigned.length} items).`);

  // 5. Seed StyleOption table for Collars, Cuffs, Sleeves, Pockets in Admin Catalog
  await prisma.styleOption.deleteMany({});

  const styleOptions = [
    // Collars
    { name: 'Spread Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 0, description: 'Versatile formal collar suitable for all standard and wide tie knots.' },
    { name: 'Button-Down Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 0, description: 'Classic collar with small button attachments for casual and Oxford shirts.' },
    { name: 'Camp Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 0, description: 'One-piece unbanded open collar ideal for Cuban, Hawaiian and overshirts.' },
    { name: 'Western Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 150, description: 'Pointed heritage collar designed for frontier and denim silhouettes.' },
    { name: 'Cuban Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 0, description: 'Retro notched open flat collar for breezy linen and summer shirts.' },
    { name: 'Mandarin Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 100, description: 'Regal short upright band collar for clean eastern and tunic styles.' },
    { name: 'Utility Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 200, description: 'Reinforced structured collar built for tactical and utility overshirts.' },
    { name: 'Wing Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 300, description: 'Formal folded wingtips reserved strictly for black-tie gala dress shirts.' },
    { name: 'Band Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 0, description: 'Modern collarless neckline perfect for casual Henley shirts.' },
    { name: 'Point Collar', type: 'COLLAR', category: 'SHIRT', priceDelta: 0, description: 'Narrow traditional collar points matching cords and formal shirts.' },

    // Cuffs
    { name: 'French Double Cuff', type: 'CUFF', category: 'SHIRT', priceDelta: 250, description: 'Folded back cuff fastened with cufflinks for maximum formality.' },
    { name: 'Barrel Cuff', type: 'CUFF', category: 'SHIRT', priceDelta: 0, description: 'Standard single-layer buttoned cuff for business and casual wear.' },
    { name: 'Rounded Cuff', type: 'CUFF', category: 'SHIRT', priceDelta: 50, description: 'Soft curved edge cuff for traditional Oxford shirts.' },
    { name: 'Adjustable Cuff', type: 'CUFF', category: 'SHIRT', priceDelta: 100, description: 'Dual-button adjustable sizing cuff for overshirts and utility jackets.' },
    { name: 'Snap Cuff', type: 'CUFF', category: 'SHIRT', priceDelta: 150, description: 'Pearlized heavy-duty snap fasteners for western and denim shirts.' },
    { name: 'Folded Cuff', type: 'CUFF', category: 'SHIRT', priceDelta: 50, description: 'Permanently folded short sleeve hem for linen and resort shirts.' },
    { name: 'Straight Cuff', type: 'CUFF', category: 'SHIRT', priceDelta: 0, description: 'Clean straight short sleeve cuff for bowling and Hawaiian shirts.' },
    { name: 'Button Cuff', type: 'CUFF', category: 'SHIRT', priceDelta: 0, description: 'Single button cuff closure for mandarin and tunic shirts.' },

    // Sleeves
    { name: 'Full Sleeve', type: 'SLEEVE', category: 'SHIRT', priceDelta: 0, description: 'Full length tailored sleeve ending at wrist.' },
    { name: 'Short Sleeve', type: 'SLEEVE', category: 'SHIRT', priceDelta: 0, description: 'Relaxed warm weather sleeve ending mid-bicep.' },

    // Pockets
    { name: 'No Pocket', type: 'POCKET', category: 'SHIRT', priceDelta: 0, description: 'Clean, minimalist seamless front for formal wear.' },
    { name: 'Single Chest Pocket', type: 'POCKET', category: 'SHIRT', priceDelta: 0, description: 'Standard tailored left chest pocket.' },
    { name: 'Patch Pocket', type: 'POCKET', category: 'SHIRT', priceDelta: 100, description: 'Topstitched patch pocket for overshirts and corduroy.' },
    { name: 'Flap Pocket', type: 'POCKET', category: 'SHIRT', priceDelta: 150, description: 'Buttoned protective flap pocket for denim and flannel.' },
    { name: 'Side Seam Pockets', type: 'POCKET', category: 'SHIRT', priceDelta: 200, description: 'Discreet functional side seam pockets for linen and tunics.' },
    { name: 'Double Chest Pockets', type: 'POCKET', category: 'SHIRT', priceDelta: 250, description: 'Symmetrical twin chest pockets with snaps for western shirts.' },
    { name: 'Multiple Utility Pockets', type: 'POCKET', category: 'SHIRT', priceDelta: 350, description: 'Multi-compartment cargo utility pockets for tactical overshirts.' },
  ];

  for (const opt of styleOptions) {
    await prisma.styleOption.create({ data: opt });
  }
  console.log(`Style options seeded (${styleOptions.length} items).`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
