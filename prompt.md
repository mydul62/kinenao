# Online Grocery E-Commerce Platform - Step-by-Step Execution Plan

This document outlines the detailed, step-by-step roadmap to build the enterprise-ready online grocery e-commerce platform. It features structured milestones, detailed checklists, and clear criteria for success.

---

## 📅 Roadmap Overview & Progress Tracker

| Milestone | Title | Focus Area | Status |
|---|---|---|---|
| **Milestone 1** | [Development Env & Database Setup](#milestone-1-development-env--database-setup) | Node/Express + Prisma ORM + Postgres Schema | ⬜ Pending |
| **Milestone 2** | [Core Auth, Middleware & File Uploads](#milestone-2-core-auth-middleware--file-uploads) | Security, JWT/Refresh, Email Reset, Cloudinary | ⬜ Pending |
| **Milestone 3** | [Admin & Manager CRUD APIs](#milestone-3-admin--manager-crud-apis) | Categories, Brands, Products, Search/Filter | ⬜ Pending |
| **Milestone 4** | [Order Lifecycle & Payment APIs](#milestone-4-order-lifecycle--payment-apis) | Checkout backend, manual payment validation, timeline | ⬜ Pending |
| **Milestone 5** | [Frontend Base & Component Library](#milestone-5-frontend-base--component-library) | Next.js 15, Tailwind, Shadcn, Dark/Light Mode | ⬜ Pending |
| **Milestone 6** | [Customer Storefront & Checkout Flow](#milestone-6-customer-storefront--checkout-flow) | Homepage, Search, Cart, Checkout Wizard, Proof Upload | ⬜ Pending |
| **Milestone 7** | [Admin & Manager Dashboard Panels](#milestone-7-admin--manager-dashboard-panels) | Analytical dashboards, order verification, homepage manager | ⬜ Pending |
| **Milestone 8** | [Security, SEO, Performance & Printing](#milestone-8-security-seo-performance--printing) | Invoices, security headers, metadata, query caching | ⬜ Pending |

---

## Milestone 1: Development Env & Database Setup
**Objective**: Establish a clean backend Express skeleton with Prisma ORM connected to PostgreSQL and seed initial structures.

### Tasks
- [ ] Initialize standard Express application under `backend/` using TypeScript.
- [ ] Set up compiler configurations (`tsconfig.json`, `package.json` scripts).
- [ ] Create `backend/.env` file containing:
  ```env
  DATABASE_URL="postgresql://postgres:123456@localhost:5432/eventplanner?schema=public"
  NODE_ENV="development"
  PORT=5000
  JWT_SECRET="asdgfoasdghdioawyqweityqwetafasdfsdfsdafsdfsdfsad"
  EXPIRES_IN="1d"
  REFRESH_TOEKN_SECRET="adhfuoadsghfiwyiqerytq379tyrutgq3454357345fgkdfadfgasdfasdg"
  REFRESH_TOEKN_EXPIRES_IN="30d"
  RESET_PASS_TOKEN="dsfqgq34yterghkgbhsdfogh45ty234thlkjvjbhsdfokvghqt2437t3ou7tqnvasdfg"
  RESET_PASS_TOKEN_EXPIRES_IN="5m"
  RESET_PASSWORD_LINK="http://localhost:3001/reset-password"
  EMAIL="mydulcse62.niter@gmail.com"
  APP_PASSWORD="hwazopngoojnxvcr"
  CLOUDINARY_CLOUD_NAME="z80cuap2"
  CLOUDINARY_API_KEY="717959968257737"
  CLOUDINARY_API_SECRET="uYqRqnOlJ8ZWHurfAyp3EHcrMXc"
  EMAIL_USER="mydulcse62.niter@gmail.com"
  EMAIL_PASS="hwazopngoojnxvcr"
  ```
- [ ] Initialize Prisma ORM: `npx prisma init`.
- [ ] Define the Prisma Schema (`backend/prisma/schema.prisma`):
  * **User & Profile Models**: Auth details, Roles (`ADMIN`, `MANAGER`, `CUSTOMER`), Profile details, and nested User Addresses.
  * **Categories & Brands Models**: Standard properties, support for recursively nested categories.
  * **Product Model**: Name, slug, SKU, price, discount price, weight, stock tracking status (`isFeatured`, `isBestSeller`, `isFlashSale`), tags, images arrays, active status, and SEO metadata.
  * **Manual Payment Method Model**: Name, account number, account type, logo, and active/inactive toggle.
  * **Order Model**: Customer details, overall order/payment status, sender info, transaction ID, payment proof url, timeline logs, and references to coupons or delivery fees.
  * **OrderItem & TimelineEvent Models**: Order composition and full status change timeline.
  * **Coupon Model**: Code, discount type (percentage, flat, free shipping), min order limit, expire time, usage trackers.
  * **Review Model**: Rating, text, attachments, visibility approval status, and helpful votes tracker.
  * **DeliveryZone Model**: Standardized flat-rates and estimated times.
  * **HomepageContent Model**: Structured settings to dynamic-render homepage slider components, deals, and promotional campaigns.
- [ ] Generate Prisma Client and apply migrations to build the database.
- [ ] Write a seeding script (`backend/prisma/seed.ts`) to pre-populate:
  * Admin accounts and Manager accounts.
  * Initial nested categories (Groceries -> Rice, Oil, Flour; Fruits; Vegetables; etc.).
  * Standard Delivery Zones and Manual Payment Methods (bKash, Nagad, Bank Transfer).
- [ ] Validate DB connection by starting Express backend and connecting Prisma client.

---

## Milestone 2: Core Auth, Middleware & File Uploads
**Objective**: Build a highly secure base layer for authentication, permissions, file uploads, and request validation.

### Tasks
- [ ] Set up **BCrypt hashing** for user password storage.
- [ ] Create **JWT helpers** for access token and refresh token creation and verification.
- [ ] Implement global request parsing middlewares and security configurations (CORS, Helmet headers, Rate Limiting).
- [ ] Design general middlewares:
  * `authMiddleware`: Extracts Bearer JWT, validates, and sets `req.user`.
  * `roleMiddleware`: Verifies roles (`ADMIN`, `MANAGER`, `CUSTOMER`) on private endpoints.
  * `validate`: Custom middleware leveraging Zod schemas to validate `req.body`/`req.query` payloads.
  * `errorHandler`: Global catch-all middleware for processing database, auth, and general validation errors cleanly.
- [ ] Implement Core Authentication Routes:
  * `/api/auth/register` (Customer registration, creating default profile)
  * `/api/auth/login` (Standard credentials login, returns JWT and refresh token)
  * `/api/auth/refresh` (Validates refresh token to issue new access token)
  * `/api/auth/forgot-password` (Generates JWT password reset token, sends email with NodeMailer via the credentials provided)
  * `/api/auth/reset-password` (Verifies reset token and updates password)
- [ ] Integrate **Multer + Cloudinary Storage** helper for secure image uploads.
  * Endpoint `/api/upload` accepting single/multiple uploads (used for products, brand logos, payment screenshots, profile avatars).

---

## Milestone 3: Admin & Manager CRUD APIs
**Objective**: Implement core business endpoints for catalog, product, category, and coupon controls. All resource management views must support Search, Filter, Sort, and Pagination.

### Tasks
- [ ] **Category Management APIs**:
  * Create, Update, Delete (with checks to prevent deleting nested children or categories containing products).
  * Get category list (both linear list and hierarchical tree structures).
- [ ] **Brand Management APIs**:
  * Create, Update, Toggle Active/Inactive, and Delete Brands.
- [ ] **Product Management APIs**:
  * Create product (with validation on unique SKU/barcodes and dynamic slug generation).
  * Update product details, inventory thresholds, and active status toggles.
  * Delete product (soft-delete or secure delete if no orders exist).
  * Public products endpoint with advanced Prisma query building: Search (by name, SKU, tag), Filter (by categories, brands, price range, stock availability), Sorting (low-to-high, high-to-low, newest), and Pagination (limit, page).
- [ ] **Inventory Control APIs**:
  * View current stock levels, reserved quantities, and low stock statuses.
  * Endpoint triggers warnings when items fall below custom thresholds.
- [ ] **Coupon Management APIs**:
  * Create new codes with Zod schema validations.
  * Delete or deactivate coupons.
  * Public validation endpoint `/api/coupons/validate` checking limits, min purchase, and expiration dates.

---

## Milestone 4: Order Lifecycle & Payment APIs
**Objective**: Handle the entire transactional database lifecycle from cart submission through order updates and reviews.

### Tasks
- [ ] **Manual Payment Methods Configuration**:
  * CRUD APIs to configure available cards (bKash, Nagad, Rocket, Bank Transfer) with instructions.
- [ ] **Customer Checkout & Order Creation**:
  * Checkout post handler validating cart contents, applying delivery charges based on zones, checking coupon validity, updating stock reserved fields, and saving order as `PENDING_PAYMENT`.
  * Return order details and selected payment method requirements.
- [ ] **Payment Proof Submission**:
  * Endpoint `/api/orders/:id/submit-payment` enabling customer to write transaction logs (Sender Number, Transaction ID, Paid Amount, optional screenshot image, notes).
  * Updates Order status to `PENDING_PAYMENT_VERIFICATION`.
- [ ] **Admin & Manager Order Controls**:
  * Retrieve lists of orders with status filters (Pending Verification, Shipped, etc.) and search capabilities.
  * Payment verification API `/api/orders/:id/verify-payment`: Approves details, flags order as `CONFIRMED`. Rejection reverts it to `PENDING_PAYMENT` with an audit note.
  * Order Status progression API (Confirmed -> Packed -> Shipped -> Out for Delivery -> Delivered).
  * Automatically append events to order timeline history detailing action, responsible user role, and timestamp.
- [ ] **Product Review APIs**:
  * Create review post API: validates if user has a `DELIVERED` order containing the specific product.
  * Admin API for approving/rejecting customer reviews.
  * Public review voting endpoint (Mark review as helpful).

---

## Milestone 5: Frontend Base & Component Library
**Objective**: Scaffold the Next.js 15 client workspace and build reusable UI blocks following the premium design requirements.

### Tasks
- [ ] Initialize standard Next.js 15 app inside `frontend/` using TypeScript, Tailwind CSS, and standard directory structuring.
- [ ] Configure `next.config.ts` (or `next.config.js`) to support external image loading from Cloudinary paths.
- [ ] Run Shadcn UI setup (`npx shadcn@latest init`) configuring themes, CSS variables, and initial layout configurations.
- [ ] Install dependencies: Framer Motion, React Query, Lucide React, Axios, React Hook Form, and Zod.
- [ ] Configure the styling foundation (`frontend/app/globals.css`):
  * Premium color scales (sleek dark colors, rich accents, clean borders).
  * Light and Dark mode variables.
  * Animations, subtle glassmorphism utilities, and focus states.
- [ ] Add foundational Shadcn UI components: Button, Input, Card, Dialog, Toast, Sheet, Badge, Table, Dropdown, Accordion.
- [ ] Code base layout utilities:
  * Responsive global Navigation Header (with user status, slide-out mobile drawer, category browser, live search input).
  * Premium Footer with company info, contact cards, and site navigation.
  * General layout containers with loading skeletons and custom error boundary fallbacks.

---

## Milestone 6: Customer Storefront & Checkout Flow
**Objective**: Build customer interface pages containing rich banners, product catalog filters, search, and checkout.

### Tasks
- [ ] **Dynamic Homepage Layout**:
  * Hero banner slider with smooth animations (Framer Motion).
  * Responsive grids for Featured Categories, Best Selling Products, Today's Deals, and Flash Sales.
  * Thematic sections: Fruits, Vegetables, Fish & Meat, Beverages, Dairy, Snacks.
  * Customer review slider, FAQ accordion panel, and Newsletter sign-up field.
- [ ] **Search Results / Category Catalog Page**:
  * Sidebar filters: nested category tree, brand checkbox list, range input for price bounds, and rating thresholds.
  * Product grid listing: handles pagination, loading skeletons, and empty state results.
  * Live search input showing instant popover suggestions.
- [ ] **Product Detail Page**:
  * Visual gallery showing item images with hover zoom.
  * Detailed lists for specifications, delivery terms, returns, and ratings summaries.
  * Section presenting related products and "Frequently Bought Together" recommendations.
- [ ] **Shopping Cart Engine**:
  * Context provider (React state or persist state) to manage cart items.
  * Drawer component showing items, price calculations, taxes, discount bounds, and checkout button.
- [ ] **Checkout Wizard**:
  * Step 1: Address form validating shipping inputs.
  * Step 2: Selecting delivery options/zones.
  * Step 3: Modern payment methods cards UI (click selection showing instructions, fields for sender number, transaction ID, paid amount, and image upload helper).
  * Step 4: Order confirmation page with success alerts.
- [ ] **Customer Dashboard Panels**:
  * Profiler section (updating names/phones, passwords, multiple delivery addresses).
  * Order history table: displays statuses, invoice download, and details link.
  * Interactive tracking component displaying the delivery timeline.
  * Modal forms allowing customers to write reviews on purchased items.

---

## Milestone 7: Admin & Manager Dashboard Panels
**Objective**: Implement dashboards enabling admins and managers to run day-to-day operations and configure storefront parameters.

### Tasks
- [ ] **Dashboard Home & Analytics**:
  * Metric summary cards: Total Revenue, Orders count, Customer registrations, Low-stock warnings.
  * Dynamic charts (Recharts / ChartJS): Monthly sales, Order statuses, top selling categories.
  * List showing recent order submissions and inventory alerts.
- [ ] **Product & Catalog Management Panels**:
  * Product inventory tables supporting fast pagination, multi-column sorting, and multi-field keyword filtering.
  * Forms for adding/updating products featuring multi-file dropzone uploaders.
  * Dialog forms to manage nested categories and brand lists.
- [ ] **Order Control & Payment Verification Console**:
  * Order listing dashboard with distinct status buckets.
  * Detail panel showing proof of payment (screenshot overlay, sender detail card, manual transaction verification buttons).
  * Form configurations to progress shipment logs.
- [ ] **Discount & Campaign Control Engine**:
  * Management dashboard for active discount codes, minimum spends, and coupon limits.
  * Dynamic Homepage customizable options (updating slider lists, changing banner images, toggling deal statuses).

---

## Milestone 8: Security, SEO, Performance & Printing
**Objective**: Polish performance, build invoices, review security criteria, and audit SEO capabilities.

### Tasks
- [ ] **Invoicing Module**:
  * Setup a print-ready component rendering standard company invoices (logo, items, pricing summary, payment info).
  * Test compatibility with local browser standard print configurations.
- [ ] **SEO Configurations**:
  * Define page metadata, dynamic title tags, meta descriptions, and image definitions for product detail pages using Next.js Metadata API.
- [ ] **Security Auditing**:
  * Verify rate limiting on critical auth and payment submission endpoints.
  * Verify role restrictions on backend controllers.
  * Review headers output and CORS settings.
- [ ] **Performance Optimization**:
  * Validate next/image integration for file sizing.
  * Verify caching and optimistic updates via React Query.
  * Implement code-splitting and dynamic imports for heavy chart tools.

---

## 🔑 Verification & Testing Plan

### Automated Endpoint Checks
- Run Prisma migrations to construct db on testing environment.
- Test main auth, checkout, and verification flows.

### Manual Verification Flow
- **Flow A (Customer journey)**: Browse -> Register -> Cart -> Check Coupon -> Place Order -> Upload Payment Proof -> Check Order timeline tracking.
- **Flow B (Admin/Manager control)**: Update Homepage -> Add Product -> Alert on Low Stock -> View Order -> Compare Payment screenshot & transaction code -> Verify Payment -> Progress Order Timeline.
- **Flow C (Invoice print)**: Verify that clicking "Print Invoice" loads a clean, styled layout optimized for PDF generation.
