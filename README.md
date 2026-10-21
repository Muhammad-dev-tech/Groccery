# FreshGrocer: Multi-Vendor Online Grocery Marketplace

> **Academic Project Title**: *Design and Implementation of a Multi-Vendor Online Grocery Marketplace with Location-Aware Product Discovery and Price Comparison*

FreshGrocer is an enterprise-grade, modern multi-vendor online grocery marketplace built with Next.js 16 (App Router with Turbopack), React 19, TypeScript (strict mode), Tailwind CSS v4, and Supabase (PostgreSQL with Row Level Security).

---

## 🌟 Core Architectural Innovations

1. **Dimension-Safe Unit Price Normalization**:
   - Compares grocery products across disparate packaging sizes (e.g., 500 g vs 1 kg vs 5 kg, or 500 mL vs 1 L vs 2 L).
   - Strictly enforces dimension safety: **mass is never compared against volume** (rejects comparing kg vs liters with explicit transparency).

2. **Smart Shopping List Cost Analyzer**:
   - Analyzes an entire customer shopping list against all approved vendor stores.
   - **Academic Integrity Guarantee**: Stores missing items are **never** falsely presented as cheaper by discounting missing items as $0.00. Unfulfilled items are explicitly flagged and isolated.
   - Computes both the **Single Best Store** (lowest cost for maximum fulfillment) and the **Optimal Multi-Vendor Split** (buying each item from its lowest-priced vendor for maximal financial savings).

3. **Multi-Vendor Order Partitioning**:
   - Customers can add items from multiple independent local vendors to a single unified basket.
   - Upon checkout, the order is partitioned into 1 master `customer_orders` record and $N$ independent `vendor_orders` sub-orders, enabling each vendor to fulfill, pack, and deliver their portion independently.
   - Uses integer minor-unit (cents) arithmetic to completely eliminate IEEE 754 floating-point drift.

4. **Location-Aware Product Discovery & Geographic Service Zones**:
   - Approved vendors register the municipal districts, neighborhoods, and postal/ZIP codes they physically deliver to.
   - Customers filter products by their delivery location, ensuring they only browse items eligible for direct delivery.
   - Out-of-zone fallback handling provides helpful notices and active zone recommendations.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16.4.2 (App Router) | Turbopack compilation, React Server Components, Server Actions |
| **Frontend** | React 19.1.0 & TypeScript 5.9 | Strict type safety, clean modular component hierarchy |
| **Styling** | Tailwind CSS v4 | Modern PostCSS integration (`@tailwindcss/postcss`), custom design tokens |
| **Database** | PostgreSQL via Supabase | 13 relational tables, custom ENUMs, triggers, and Row Level Security |
| **Authentication** | Supabase Auth & `@supabase/ssr` | Cookie-based session validation, role-based access control |
| **Validation** | Zod 3.24 | Runtime schema validation on all inputs, forms, and URL queries |
| **Testing** | Vitest 3.0 & Testing Library | 72 unit tests across domain, arithmetic, auth, search, cart, and orders |

---

## 🗄️ Database Schema & Architecture

The database architecture is documented in `supabase/migrations/`:

- `20261020000001_initial_schema.sql`: Core schema (13 tables, custom ENUMs, initial RLS policies, automated profile creation trigger).
- `20261020000002_security_hardening.sql`: Immutable role triggers, store status governance, search_path pinning.
- `20261020000003_categories_and_storage.sql`: Standardized grocery categories seed, `product-images` storage bucket and RLS policies.
- `20261020000004_location_and_service_zones.sql`: Unique constraints, indexes, and vendor isolation RLS for `vendor_service_areas`.
- `supabase/seed.sql`: Realistic seed data with 3 approved stores, cross-vendor equivalent products with disparate package sizes, and delivery zones.

### Core Tables

1. `profiles`: User accounts with role assignments (`customer`, `vendor`, `admin`).
2. `vendor_stores`: Independent grocery stores with approval lifecycle (`pending`, `approved`, `rejected`, `suspended`).
3. `vendor_service_areas`: Geographic delivery zones and postal codes served by vendors.
4. `categories`: Standardized grocery aisles (Rice & Grains, Cooking Oil, Dairy & Eggs, Beverages, etc.).
5. `products`: Grocery items with pricing, package quantities, units of measure, and stock tracking.
6. `product_images`: Primary and secondary product photos stored in Supabase Storage.
7. `customer_orders`: Parent order record tracking customer, total amount, and delivery address.
8. `vendor_orders`: Partitioned sub-orders assigned to individual vendors with fulfillment lifecycle.
9. `order_items`: Historical price and package snapshot at the time of purchase.
10. `order_status_history`: Complete audit timeline of fulfillment transitions.
11. `shopping_lists`: User-created recurring grocery lists.
12. `shopping_list_items`: Items within shopping lists with target quantities and measurement units.
13. `admin_audit_logs`: Append-only audit trail for administrative actions.

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js v20+ (tested with v24.21.0)
- npm v10+ (tested with v11.19.0)
- A Supabase Project (PostgreSQL instance with Auth and Storage)

### 1. Installation

```bash
git clone <repository-url>
cd Groccery
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and set your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Migration & Seeding

Apply migrations located in `supabase/migrations/` sequentially using the Supabase CLI or the Supabase SQL Editor.

Then apply `supabase/seed.sql` to populate sample categories, approved vendor stores, cross-vendor equivalent products, and delivery zones.

### 4. Running Locally

```bash
# Start Next.js development server with Turbopack
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Testing

FreshGrocer includes a comprehensive test suite of **72 automated tests**:

```bash
# Run all unit tests with Vitest
npm run test

# Run TypeScript type safety verification
npx tsc --noEmit

# Run ESLint audit
npm run lint

# Compile production build
npm run build
```

---

## 📖 Key User Journeys

- **Customer Product Discovery**: Browse the marketplace at `/marketplace`, filter by grocery category, price range, stock availability, or location (e.g. Springfield ZIP `62701` or Chicago `60601`).
- **Normalized Price Comparison**: Click "Compare Across Vendors" on any product or visit `/marketplace/compare?productId=...` to see how identical staples compare across stores on a normalized `$/kg` or `$/L` basis.
- **Smart Shopping List Analysis**: Visit `/lists`, create a list, and see which local store can fulfill it for the lowest cost, or examine the Optimal Multi-Vendor Split.
- **Multi-Vendor Cart & Checkout**: Add products from different stores to your cart at `/cart`, inspect the per-vendor partitions, and checkout at `/checkout`.
- **Order Tracking**: Track sub-order fulfillment progress in `/orders/[id]`.
- **Vendor Store Hub**: Manage products at `/vendor/products`, delivery zones at `/vendor/service-areas`, and live fulfillment at `/vendor/orders`.
- **Admin Moderation**: Review vendor store applications and suspend/reinstate stores at `/admin`.

---

## 📄 License & Academic Integrity

This project was designed and developed for academic and evaluation purposes. All architectural decisions, mathematical proofs, and security policies are documented in [PROJECT_REPORT.md](file:///c:/Users/MUHAMMAD/Desktop/Groccery/PROJECT_REPORT.md).
