<<<<<<< HEAD
# FOINE-HAIR
=======
# FOINE HAIR — Luxury Wig Configurator

A production-ready, full-stack e-commerce platform for bespoke custom wig building, with real-time visual rendering, Kenya-specific M-Pesa payments, and an Admin Fulfillment Dashboard.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (Black/Gold/White luxury aesthetic)
- **Zustand** (with Immer + Persist middleware)
- **Framer Motion** (crossfade layer transitions, AnimatePresence counters)
- **Prisma** (PostgreSQL / Supabase schema)
- **Safaricom Daraja API** (M-Pesa STK Push)
- **Stripe** (Card payments)
- **Africa's Talking** (SMS confirmations)
- **Cloudinary** (Layered image transformations)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Home — Hero + Feature Strip + Gallery
│   ├── configurator/
│   │   ├── page.tsx                    # Interactive Wig Builder
│   │   └── summary/[id]/page.tsx       # Shareable Wig Recipe page
│   ├── checkout/page.tsx               # Checkout with zone-based shipping
│   ├── admin/orders/page.tsx           # Admin Fulfillment Dashboard
│   └── api/
│       ├── mpesa/
│       │   ├── stk-push/route.ts       # Daraja STK Push trigger
│       │   └── callback/route.ts       # Safaricom webhook handler + SMS
│       └── save-config/route.ts        # Order CRUD (swap for Prisma in prod)
├── components/
│   ├── configurator/
│   │   ├── Stage.tsx                   # Cloudinary layered renderer (crossfade)
│   │   ├── Navigation.tsx              # Step-by-step progress nav
│   │   ├── OptionGroup.tsx             # Reusable selection card grid
│   │   ├── SummaryBar.tsx              # Animated price bar + notification toasts
│   │   ├── StepFoundation.tsx          # Cap · Lace · Melanin Tint
│   │   ├── StepDNA.tsx                 # Length · Texture · Density · Origin
│   │   ├── StepArtistry.tsx            # Knots · Hairline · Baby Hairs · Scent
│   │   └── StepFinish.tsx              # Tech · Packaging · Payment method
│   ├── gallery/
│   │   └── ProductGallery.tsx          # Inspiration model grid with "Customize" CTA
│   ├── admin/
│   │   └── AdminOrderCard.tsx          # Expandable order + spec card + status toggle
│   └── ui/
│       ├── SiteHeader.tsx
│       └── SiteFooter.tsx
├── store/
│   └── useWigStore.ts                  # Zustand store — source of truth
├── utils/
│   ├── priceCalculator.ts              # Full pricing engine
│   ├── validationRules.ts              # Density/length rules + auto-fix
│   ├── cloudinaryHelper.ts             # URL transformation builder
│   └── shippingRules.ts                # Nairobi zone-based delivery rates
└── types/
    └── wig.ts                          # Strict TypeScript interfaces
prisma/
└── schema.prisma                       # Order model with configurationJSON
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` — Supabase/PostgreSQL connection string
- `MPESA_*` — Safaricom Daraja sandbox/production credentials
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — Your Cloudinary cloud name
- `STRIPE_SECRET_KEY` — Stripe secret key

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Database setup (production)

```bash
npx prisma db push
npx prisma generate
```

## Key Business Logic

### Pricing Engine (`priceCalculator.ts`)

| Component     | Rule |
|---------------|------|
| Base          | $150 (12", 150% density, Virgin Hair) |
| Length        | +$15 per 2 inches above 12" |
| Density 180%  | +$40 |
| Density 200%  | +$70 |
| Density 250%  | +$110 |
| HD Lace       | +$55 |
| Silk Base     | +$95 |
| Bleached Knots| +$15 |
| Pre-Plucked   | +$15 |
| Custom Scent  | +$10 |
| 3D Scalp Scan | +$25 |

### Validation Rules (`validationRules.ts`)

- **10"–14":** minimum 130% density
- **16"–22":** minimum 150% density
- **24"–32":** minimum 180% density (auto-upgraded with toast notification)
- **Silk Base lace** → Auto-selects Piano Straps (cannot be overridden)

### Shipping Zones (`shippingRules.ts`)

| Zone | USD | KES | ETA |
|------|-----|-----|-----|
| Nairobi CBD / Kilimani / Westlands | $2 | 300 | Same day |
| Karen / Rongai / Ruiru | $4 | 600 | 1–2 days |
| Upcountry (G4S) | $6 | 850 | 3–5 days |
| International | $25 | 3,375 | 7–14 days |

## Connecting Real Services

### M-Pesa (Daraja API)
Set `MPESA_ENV=production` and configure your verified Safaricom paybill credentials. The callback URL must be publicly accessible (use ngrok in development).

### Cloudinary
Upload your wig layer assets to Cloudinary following this folder structure:
```
foine/
├── base/cap-dome.png
├── textures/
│   ├── straight.png
│   ├── body-wave.png
│   └── ...
└── overlays/
    ├── color-wash.png
    └── lace-tint.png
```

### Prisma / Supabase
Replace the in-memory store in `api/save-config/route.ts` with Prisma client calls (commented examples are included in the file).

## Admin Dashboard

Visit `/admin/orders` — default password: `foine2026` (set via `NEXT_PUBLIC_ADMIN_PASSWORD`).

Features:
- Order list with filter by status
- Expandable "Wig Recipe" manufacturing spec for each order
- One-click status advancement (Paid → In Production → Shipped → Delivered)
- Status change triggers SMS to customer via Africa's Talking
>>>>>>> master
