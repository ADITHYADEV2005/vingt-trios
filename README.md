# Vingt Trios 🧵✨

> **Next-Generation AI Bespoke Tailoring & Luxury Deadstock Platform**  
> Custom high-end garments tailored with sub-millimeter precision using Computer Vision & AI 3D Body Scanning.

---

## 🌟 Overview

**Vingt Trios** bridges high-fashion bespoke craftsmanship with cutting-edge artificial intelligence and eco-luxury principles. The platform eliminates traditional sizing errors by leveraging AI-powered computer vision body scanning, while connecting discerning customers directly with master tailors and independent fashion designers.

### Core Pillars
- 📐 **AI 3D Body Measurement**: Real-time pose landmark extraction via Google MediaPipe for contactless, high-precision body sizing (chest, waist, hips, inseam, sleeve, and shoulder width).
- 🌿 **Eco-Luxury & Deadstock Sourcing**: Premium deadstock fabrics salvaged from top European & Indian textile mills, preventing luxury fabric waste.
- 🎨 **3D Interactive Garment Customizer**: Real-time customization of collars, cuffs, lapels, buttons, linings, and fabrics.
- 👔 **Tailor Partner Ecosystem**: Dedicated partner portal for master artisans to claim orders, manage stitching milestones, track payouts, and communicate.
- 💎 **Designer Monetization**: Open designer collective allowing independent fashion artists to publish styles and earn perpetual royalties.
- 🛡️ **Enterprise Admin Suite**: Comprehensive management suite with audit logs, financial tracking, KPIs, marketing campaigns, and dispute resolution.

---

## 🏗️ Architecture & Monorepo Structure

Vingt Trios is architected as a high-performance monorepo supporting multiple specialized micro-frontends and a centralized NestJS backend.

```
VINGT TRIOS/
├── backend/                  # NestJS + Prisma ORM + PostgreSQL API
│   ├── prisma/               # Database schema & database seeding scripts
│   └── src/
│       ├── admin/            # Platform administration & analytics
│       ├── audit/            # System-wide immutable audit logging
│       ├── auth/             # JWT auth, guards, role strategies
│       ├── catalog/          # Fabrics, custom styles, pricing engines
│       ├── designer-portal/  # Designer workspace & royalty management
│       ├── designers/        # Designer profiles & directory
│       ├── finance/          # Payment tracking, payouts, revenue records
│       ├── marketing/        # Campaigns, promotional banners
│       ├── orders/           # Lifecycle state machine & tracking
│       ├── products/         # Garment catalog & inventory
│       ├── support/          # Help desk ticketing & messaging
│       ├── tailor-portal/    # Tailor job queue & milestone updates
│       └── tailors/          # Artisan profiles, ratings, capacities
│
├── customer-web/             # Dedicated Customer Experience Portal (Next.js)
│   ├── src/app/              # Customizer, AIScan, Cart, Orders, Profile
│   ├── src/components/       # UI components, 3D AIScan landmarker
│   └── src/lib/measurement/  # Fit engine, confidence engine, quality checker
│
├── admin-web/                # Dedicated Platform Administration Portal (Next.js)
│   ├── src/app/admin/        # Dashboards, Finance, Orders, Tailors, Designers
│   └── src/components/admin/ # Data tables, KPI cards, timeline, status badges
│
├── partner-web/              # Dedicated Artisan & Designer Partner Portal (Next.js)
│   ├── src/app/tailor/       # Tailor order dashboard, milestones, earnings
│   └── src/app/designer/     # Designer studio, new designs, royalties
│
├── frontend/                 # Unified All-in-One Client Application
├── sync-watch.ps1            # Real-time multi-frontend code synchronization daemon
└── README.md
```

---

## ⚡ Key Technologies

| Layer | Stack |
|---|---|
| **Backend Framework** | [NestJS](https://nestjs.com/) (TypeScript) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | Passport.js, JWT, Role-Based Access Control (RBAC) |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Styling & Design System** | Vanilla CSS Design Tokens, Glassmorphism, Luxury Dark/Light Themes |
| **Computer Vision / AI** | [@mediapipe/tasks-vision](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) (Pose Landmarker) |
| **Payments** | Razorpay Integration |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0+ or v20.0+
- **PostgreSQL**: Running locally on port `5432` or via Docker
- **npm**: v9.0+

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run start:dev
```
Backend API will be accessible at: `http://localhost:5000`

### 3. Frontend Applications

#### Customer Web:
```bash
cd customer-web
npm install
npm run dev
```
Accessible at: `http://localhost:3000`

#### Admin Web:
```bash
cd admin-web
npm install
npm run dev -- -p 3001
```
Accessible at: `http://localhost:3001`

#### Partner Web:
```bash
cd partner-web
npm install
npm run dev -- -p 3002
```
Accessible at: `http://localhost:3002`

---

## 📐 AI 3D Body Measurement Pipeline

The proprietary measurement pipeline operates entirely on-device for maximum privacy:

1. **Quality Checker**: Validates lighting, distance, and full-body visibility.
2. **Pose Landmarker**: Detects 33 anatomical keypoints using MediaPipe Lite.
3. **Measurement Engine**: Computes Euclidean proportions calibrated against reference heights.
4. **Fit Engine**: Determines ease factors according to fit preference (Slim, Regular, Relaxed).
5. **Confidence Engine**: Assigns confidence scores to each measurement metric prior to saving.

---

## 📜 License & Acknowledgments

© 2026 Vingt Trios. All rights reserved. Crafted for excellence in sustainable bespoke fashion.
