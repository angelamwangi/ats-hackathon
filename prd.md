# Product Requirements Document (PRD): Retail Nexus Ecosystem

## 1. Project Vision

**Retail Nexus** is an all-in-one Retail Operating System (OS). It bridges the gap between informal traders and global e-commerce through an offline-first POS, a multi-tenant marketplace, and a progressive "Save-to-Buy" (BNPL) financial model.

---

## 2. Technical Stack

| Layer | Technology | Implementation Detail |
| --- | --- | --- |
| **Framework** | **Next.js 15 (App Router)** | Core application architecture. |
| **Animations** | **GSAP + Lenis** | Smooth inertial scrolling and complex UI sequencing. |
| **Authentication** | **Clerk** | Multi-tenant roles: `admin`, `vendor`, `customer`. |
| **Primary Database** | **Convex** | Real-time cloud sync, serverless functions, and crons. |
| **Local Database** | **SQLite (wa-sqlite)** | Browser-based persistence for Offline-First POS. |
| **Styling** | **Tailwind CSS + Base UI** | Clean, accessible, and fast UI development. |
| **Communications** | **Resend + Twilio** | Automated receipts, SMS alerts, and stock notifications. |

---

## 3. Project Structure

```text
/retail-nexus
├── /app
│   ├── /(auth)           # Clerk login and onboarding flows
│   ├── /(admin)          # Platform governance & global analytics
│   ├── /(vendor)         # POS, Inventory, and Loyalty dashboards
│   ├── /(consumer)       # E-com storefront & BNPL tracking
│   └── /api              # Webhooks for payments & external triggers
├── /convex
│   ├── schema.ts         # Unified Data Schema (Multi-tenant)
│   ├── actions.ts        # External API integrations (Resend/Twilio)
│   ├── mutations.ts      # Logic for BNPL, Orders, and Sync reconciliation
│   └── queries.ts        # Analytics and data fetching
├── /hooks
│   ├── useSync.ts        # SQLite <-> Convex sync manager
│   └── useSmoothScroll.ts # Lenis & GSAP initialization
├── /lib
│   ├── /sqlite           # SQL schema migrations for local storage
│   └── /gsap-utils       # Reusable animation timelines
└── /components           # Base UI wrappers & animated components

```

---

## 4. Functional Modules & Core Logic

### 4.1. Offline-First POS & Sync

* **Local Speed:** Transactions are written to local SQLite instantly to ensure work continues during outages.
* **Sync Strategy:** The `SyncManager` monitors `navigator.onLine`. When back online, it pushes the local `outbox` to Convex and clears the local queue.
* **Automation:** Once synced, Convex triggers a background action to generate a PDF receipt and send it via email/SMS.

### 4.2. Multi-Vendor Marketplace & Comparison Engine

* **Vendor Shops:** Each vendor manages a virtual storefront that auto-syncs with their physical POS stock.
* **Price Intelligence:** Consumers receive a "Value Score" () to identify quality goods at low prices:


* **Market Trends:** Vendors receive alerts if their pricing deviates significantly from the market median.

### 4.3. Save-to-Buy (BNPL) & Micro-Lending

* **Progressive Payments:** Users deposit funds toward high-value items.
* **Auto-Fulfillment:** When `amountPaid >= totalPrice`, the system automatically creates a vendor order.
* **95/5 Refund Rule:** * If a user cancels: **95%** is refunded to their wallet; **5%** is retained as an administrative processing fee.

### 4.4. Sustainability & Circular Economy

* **Trade-ins:** A "Resell" button in order history allows users to list items back on the marketplace.
* **Waste Reduction:** AI-driven alerts for grocery vendors suggest discounts for items nearing expiry.

---

## 5. Database Schema (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("vendor"), v.literal("customer")),
    walletBalance: v.number(), 
  }).index("by_clerkId", ["clerkId"]),

  vendors: defineTable({
    ownerId: v.id("users"),
    shopName: v.string(),
    isApproved: v.boolean(),
    loyaltyConfig: v.object({ pointsPerDollar: v.number() }),
  }).index("by_ownerId", ["ownerId"]),

  products: defineTable({
    vendorId: v.id("vendors"),
    name: v.string(),
    price: v.number(),
    stock: v.number(),
    minStockThreshold: v.number(),
    category: v.string(),
    qualityRating: v.number(),
  }).index("by_vendor", ["vendorId"]).index("by_category_price", ["category", "price"]),

  orders: defineTable({
    vendorId: v.id("vendors"),
    customerId: v.optional(v.id("users")),
    items: v.array(v.object({ 
        productId: v.id("products"), 
        quantity: v.number(), 
        priceAtSale: v.number() 
    })),
    totalAmount: v.number(),
    source: v.union(v.literal("pos"), v.literal("ecommerce")),
    status: v.string(), // "pending", "completed", "dispatched"
    offlineId: v.optional(v.string()),
  }).index("by_vendor", ["vendorId"]),

  bnplOrders: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    totalPrice: v.number(),
    amountPaid: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
  }).index("by_user", ["userId"]),

  loyaltyCards: defineTable({
    vendorId: v.id("vendors"),
    userId: v.id("users"),
    points: v.number(),
  }).index("by_vendor_user", ["vendorId", "userId"]),
});

```

---

## 6. Page Architecture & UX

### 6.1. Admin Command Center

* **Metrics:** Global GMV, active BNPL escrow, and vendor health scores.
* **Controls:** Vendor approval queue and global price intelligence settings.

### 6.2. Vendor Pulse & POS

* **Dashboard:** Animated BI charts using GSAP.
* **POS UI:** High-contrast, large-touch targets; works offline with local SQLite.

### 6.3. Consumer Hub

* **Comparison Grid:** Sticky headers and smooth-scrolling comparisons via Lenis.
* **Progress Tracker:** GSAP-animated bars showing how close the user is to completing a BNPL purchase.

---

## 7. Animation Strategy

* **Smooth Navigation:** **Lenis** provides a high-end, premium feel across all dashboards.
* **Data Visualization:** **GSAP** animates counters for sales metrics and fills progress bars for credit tracking.
* **Micro-interactions:** Staggered entry animations for product lists and inventory tables to maintain a "snappy" perception.

---
