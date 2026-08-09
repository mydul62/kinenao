# Kinenao - Full-Stack E-Commerce Platform Overview

**Kinenao** is an enterprise-ready, full-stack online e-commerce platform built for high performance, modern UI/UX, robust security, and scalable business operations. Inspired by leading platforms such as GhorerBazar and Chaldal, it is designed to support grocery, beauty, and cosmetics retail with multi-tiered catalog management, manual payment processing, automated order timelines, role-based administration, and dynamic storefront features.

---

## 1. Executive Summary

| Attribute | Details |
|---|---|
| **Project Name** | Kinenao |
| **Architecture** | Decoupled Client-Server (Next.js 15 Frontend + Express.js/Prisma Backend) |
| **Primary Domains** | Online Grocery, Beauty & Cosmetics E-Commerce |
| **Frontend Stack** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion |
| **Backend Stack** | Node.js, Express.js 5, TypeScript, Prisma ORM, PostgreSQL |
| **Authentication** | JWT (Access & Refresh Tokens), Role-Based Access Control (RBAC), BCrypt |
| **Payment System** | Manual Payment Processing (bKash, Nagad, Rocket, Bank Transfer) with Transaction Proof & Verification |
| **File Storage** | Cloudinary & Multer for images (products, brands, banners, payment proofs) |
| **Data Resilience** | Full backend API integration with automatic fallback to realistic mock data for zero-downtime client experiences |

---

## 2. System Architecture

Kinenao uses a clean modular architecture separating the Presentation Layer (Frontend), API & Business Logic Layer (Backend), and Data Persistence Layer (PostgreSQL via Prisma ORM).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js 15)                             │
│  ┌───────────────────────┬────────────────────────┬───────────────────────┐  │
│  │   Customer Storefront │   Customer Dashboard   │ Admin & Manager Panel │  │
│  │   - Home & Hero       │   - Orders & Timeline  │ - CRUD Management     │  │
│  │   - Catalog & Search  │   - Profile & Address  │ - Order Verification  │  │
│  │   - Checkout Wizard   │   - Reviews & Wishlist │ - Analytics & Reports │  │
│  └───────────────────────┴────────────────────────┴───────────────────────┘  │
│         │ Cart & Auth State (Context API)                                   │
│         │ Data Fetching (Axios / Fetch API + Mock Fallback)                 │
└─────────┼───────────────────────────────────────────────────────────────────┘
          │ RESTful APIs (JSON / Multipart Form-Data)
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Express.js 5)                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Security & Middlewares: Helmet, CORS, Rate Limit, Auth, RBAC, Zod     │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ Modular API Routes:                                                   │  │
│  │ /auth • /products • /categories • /brands • /orders • /coupons        │  │
│  │ /payment-methods • /checkout • /upload • /inventory • /settings       │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ Module Pattern: Route -> Controller -> Service -> Prisma ORM -> DB    │  │
└─────────┼───────────────────────────────────────────────────────────────────┘
          │ Database Queries (Prisma Client)
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL)                               │
│  Users • Profiles • Addresses • Products • Categories • Brands • Orders     │
│  OrderItems • TimelineEvents • PaymentMethods • Coupons • Reviews • Banners │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: [React 19](https://react.dev/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Tailwind CSS Animate
- **Component Primitives**: [Shadcn UI](https://ui.shadcn.com/) & Radix UI primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Rich Text Editing**: [TipTap Editor](https://tiptap.dev/) (Full suite: StarterKit, Tables, Links, Images, Color, Underline)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **State Management**: React Context API (`AuthContext`, `CartContext`)

### 3.2 Backend Stack
- **Runtime**: Node.js with TypeScript (`tsx`, `ts-node`)
- **Web Framework**: [Express.js 5](https://expressjs.com/)
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/) (`@prisma/client`, `@prisma/adapter-pg`)
- **Authentication & Security**:
  - `jsonwebtoken` (JWT Access & Refresh tokens)
  - `bcryptjs` (Password hashing)
  - `helmet` (HTTP security headers)
  - `cors` (Cross-Origin Resource Sharing)
  - `express-rate-limit` (API rate limiting)
- **Validation**: [Zod](https://zod.dev/) schema-based request validation
- **File Uploads**: [Multer](https://github.com/expressjs/multer) + [Cloudinary](https://cloudinary.com/) SDK
- **Mailing**: [Nodemailer](https://nodemailer.com/) (Password reset & transactional emails)

---

## 4. Key Features & Business Modules

### 4.1 Customer Storefront & Shopping Experience
- **Hero & Promotional Banners**: Preload-optimized hero slider, seasonal promotion banners, and flash deal badges.
- **Product Catalog & Filtering**:
  - Multi-attribute search (Product Name, SKU, Category, Brand, Tags).
  - Multi-faceted filters (Price range, category hierarchy, rating, availability, brand).
  - Sorting (Price Low-to-High / High-to-Low, Newest, Best Selling, Rating).
  - Grid and List views with responsive card layouts.
- **Product Details Page**:
  - Multi-image gallery with zoom and preview.
  - SKU, barcode, unit, weight, and stock tracking indicators.
  - Rich text description, specifications, nutritional/usage information.
  - Verified buyer reviews with star ratings and photos.
  - Related products and "Frequently Bought Together" recommendations.
- **Interactive Cart & Wishlist**:
  - Real-time quantity increment/decrement and instant price calculation.
  - Client-side persistence via LocalStorage and Context API.
  - Coupon code application with instant discount breakdown (Fixed, Percentage, Free Delivery).

### 4.2 Checkout & Manual Payment Workflow
To serve regional e-commerce workflows without reliance on expensive third-party merchant accounts, Kinenao implements a specialized **Manual Payment Verification Workflow**:
1. **Shipping Details**: Customer selects or enters a delivery address and chooses a delivery zone (with automated delivery charges).
2. **Payment Method Selection**: Modern interactive selection cards for **bKash**, **Nagad**, **Rocket**, or **Bank Transfer** (no dropdowns).
3. **Payment Submission**: Displays recipient account number, account type (Personal/Merchant), and step-by-step instructions. Customer inputs:
   - Sender Phone Number / Account
   - Transaction ID (TrxID)
   - Paid Amount
   - Optional Screenshot/Receipt Upload
   - Optional Order Notes
4. **Order State Lifecycle**:
   ```
   [PENDING_PAYMENT]
          │ (Proof Submitted)
          ▼
   [PENDING_PAYMENT_VERIFICATION]
          │ (Admin / Manager Approves)
          ▼
   [CONFIRMED] ──► [PACKED] ──► [SHIPPED] ──► [OUT_FOR_DELIVERY] ──► [DELIVERED]
          │
          └──► (Rejected / Invalid TrxID) ──► [PENDING_PAYMENT] / [CANCELLED]
   ```
5. **Timeline Auditing**: Every status change generates an immutable `TimelineEvent` with timestamp and notes, viewable by both customer and admin.

### 4.3 Customer Portal (`/dashboard`)
- **Overview**: Active orders, total spent, saved addresses count, and recent activity.
- **Orders History**: Detailed order view, status timeline tracker, and printable invoices.
- **Profile & Address Book**: Manage multiple shipping addresses (Street, City, Postal Code, Default toggle).
- **Wishlist & Reviews**: Manage saved items and write reviews for purchased goods.
- **Notifications & Security**: Account notification feed and password change facility.

### 4.4 Admin & Manager Control Center (`/admin`)
- **Executive Dashboard**:
  - Financial KPIs: Total Revenue, Total Orders, Active Customers, Pending Payments.
  - Visual Analytics: Monthly sales trends, revenue charts, order status distribution, top-selling items.
  - Low-stock and out-of-stock real-time alerts.
- **Product & Inventory Management**:
  - Full CRUD with multi-image Cloudinary upload, SKU/barcode generation, pricing, discount prices, tags, SEO meta fields, and stock quantity tracking.
  - Stock auditing: Current stock, reserved stock on open orders, sold quantities, and reorder levels.
- **Hierarchical Category Management**: Unlimited recursive category trees (Parent $\rightarrow$ Child subcategories) with safe deletion checks.
- **Brand Management**: Brand profiles, logo assets, and active/inactive switches.
- **Order & Payment Verification**:
  - Filter orders by payment verification status, delivery status, and dates.
  - Verify transaction ID, sender number, and screenshot.
  - Printable professional order invoices with branding.
- **Marketing & Promotions**:
  - **Coupons**: Fixed amount, percentage, free delivery, minimum order limits, usage caps, and expiration timestamps.
  - **Banners**: Manage hero slider images, promotional cards, and target URLs.
  - **Newsletter**: View and export subscriber lists.
- **Store Configuration & Content**:
  - Testimonial and FAQ management.
  - Delivery zones and localized shipping fee tables.
  - Website settings: Store contact, logo, SEO, social links, and business terms.

---

## 5. Database Schema & Data Models

The data layer is managed via Prisma ORM (`backend/prisma/schema.prisma`).

```
                    ┌─────────────────────────┐
                    │          User           │
                    │ id, email, password     │
                    │ role (ADMIN/MGR/CUST)   │
                    └───────────┬─────────────┘
                                │ 1:1
                                ▼
                    ┌─────────────────────────┐
                    │         Profile         │
                    │ fullName, phoneNumber   │
                    │ avatarUrl               │
                    └───────────┬─────────────┘
                                │ 1:N
                                ▼
                    ┌─────────────────────────┐
                    │         Address         │
                    │ street, city, isDefault │
                    └───────────┬─────────────┘
                                │
   ┌────────────────────────────┼───────────────────────────┐
   │ 1:N                        │ 1:N                       │ 1:N
   ▼                            ▼                           ▼
┌──────────────┐         ┌──────────────┐            ┌──────────────┐
│    Order     │◄────────┤  OrderItem   ├───────────►│   Product    │
│ orderNumber  │         │ qty, price   │            │ name, slug   │
│ status       │         └──────────────┘            │ price, stock │
│ grandTotal   │                                     └──────┬───────┘
│ trxId, proof │                                            │
└──────┬───────┘                                            │
       │                                       ┌────────────┴────────────┐
       │ 1:N                                   │ N:1                     │ N:1
       ▼                                       ▼                         ▼
┌──────────────┐                        ┌──────────────┐          ┌──────────────┐
│TimelineEvent │                        │   Category   │          │    Brand     │
│ status, note │                        │ (Hierarchical│          │ name, slug   │
│ timestamp    │                        │  Parent-Child│          │ logoUrl      │
└──────────────┘                        └──────────────┘          └──────────────┘
```

### Key Prisma Models & Roles:
- **`Role`**: `ADMIN`, `MANAGER`, `CUSTOMER`
- **`OrderStatus`**: `PENDING_PAYMENT`, `PENDING_PAYMENT_VERIFICATION`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`
- **`CouponType`**: `FIXED`, `PERCENTAGE`, `FREE_DELIVERY`
- **Models**:
  - `User`, `Profile`, `Address`
  - `Category`, `Brand`, `Product`
  - `PaymentMethod`, `Order`, `OrderItem`, `TimelineEvent`
  - `Coupon`, `Review`, `DeliveryZone`, `WishlistItem`, `Notification`
  - `WebsiteSetting`, `Banner`, `Faq`, `Testimonial`, `NewsletterSubscriber`

---

## 6. Directory Structure

```
kinenao/
├── backend/                             # Express.js REST API Server
│   ├── prisma/
│   │   ├── schema.prisma                # PostgreSQL Prisma Database Schema
│   │   └── seed.ts                      # Database Seeder (Roles, Categories, Settings)
│   ├── src/
│   │   ├── app/
│   │   │   ├── config/                  # Environment, DB, and Cloudinary configuration
│   │   │   ├── errors/                  # AppError, global error handler
│   │   │   ├── helpers/                 # JWT, BCrypt, pagination helpers
│   │   │   ├── interface/               # Global TypeScript interfaces
│   │   │   ├── middlewares/             # authMiddleware, roleMiddleware, validate
│   │   │   └── routes/                  # Central router registering all modules
│   │   ├── modules/                     # Modular Domain Features
│   │   │   ├── address/                 # Customer delivery addresses
│   │   │   ├── auth/                    # Register, login, refresh, reset password
│   │   │   ├── banner/                  # Hero and promotional banner endpoints
│   │   │   ├── brand/                   # Brand catalog CRUD
│   │   │   ├── category/                # Hierarchical category CRUD
│   │   │   ├── checkout/                # Checkout calculation and order placement
│   │   │   ├── coupon/                  # Coupon validation and management
│   │   │   ├── dashboard/               # Analytics, sales charts, KPI aggregations
│   │   │   ├── deliveryZone/            # Regional delivery rates
│   │   │   ├── faq/                     # FAQs CRUD
│   │   │   ├── fileUpload/              # Multer + Cloudinary upload handlers
│   │   │   ├── inventory/               # Stock levels, adjustments, alerts
│   │   │   ├── newsletter/              # Newsletter subscriber endpoints
│   │   │   ├── notification/            # System notifications
│   │   │   ├── order/                   # Order processing, status timeline, invoices
│   │   │   ├── paymentMethod/           # Manual payment methods (bKash/Nagad/etc.)
│   │   │   ├── product/                 # Product catalog CRUD, filters, search
│   │   │   ├── productReview/           # Customer reviews and moderation
│   │   │   ├── testimonial/             # Testimonials CRUD
│   │   │   ├── websiteSetting/          # Global site metadata, contacts, policies
│   │   │   └── wishlist/                # Customer wishlist
│   │   ├── app.ts                       # Express application configuration
│   │   └── server.ts                    # Server listener bootstrap
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                            # Next.js 15 App Router Frontend
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── page.tsx                 # Homepage (Hero, Deals, Categories, Banners)
│   │   │   ├── shop/                    # Catalog with search, filters, pagination
│   │   │   ├── product/[id]/            # Product detail view with gallery and reviews
│   │   │   ├── category/[slug]/         # Category-specific product listings
│   │   │   ├── checkout/                # Multi-step checkout & payment submission
│   │   │   ├── login/                   # User login page
│   │   │   ├── register/                # User registration page
│   │   │   └── blog/                    # Content and articles
│   │   ├── dashboard/                   # Customer Dashboard Portal
│   │   │   ├── addresses/               # Address book management
│   │   │   ├── change-password/         # Security & password reset
│   │   │   ├── notifications/           # Notification inbox
│   │   │   ├── orders/                  # Order history and live timeline tracker
│   │   │   ├── profile/                 # Profile editor
│   │   │   ├── reviews/                 # Submitted reviews
│   │   │   └── wishlist/                # Saved items
│   │   ├── admin/                       # Admin & Manager Control Center
│   │   │   ├── banners/                 # Banner slider manager
│   │   │   ├── brands/                  # Brand CRUD
│   │   │   ├── categories/              # Category hierarchy manager
│   │   │   ├── coupons/                 # Discount coupon manager
│   │   │   ├── customers/               # Customer list and order statistics
│   │   │   ├── dashboard/               # Analytics, sales charts, KPI cards
│   │   │   ├── delivery-zones/          # Delivery rate manager
│   │   │   ├── faqs/                    # FAQ manager
│   │   │   ├── inventory/               # Stock tracking and low-stock alerts
│   │   │   ├── newsletter/              # Newsletter subscriber list
│   │   │   ├── orders/                  # Order management and invoice printing
│   │   │   ├── payment-methods/         # Manual payment account setup
│   │   │   ├── payments/                # Payment proof verification queue
│   │   │   ├── products/                # Product CRUD & image uploads
│   │   │   ├── reviews/                 # Customer review moderation
│   │   │   ├── settings/                # Store settings and contact info
│   │   │   └── testimonials/            # Testimonial manager
│   │   ├── ems-dashboard/               # Enterprise Management Panel
│   │   ├── globals.css                  # Tailwind styles and custom design tokens
│   │   └── layout.tsx                   # Root layout, theme provider, and toaster
│   ├── components/
│   │   ├── admin/                       # Admin navigation, sidebar, modals, tables
│   │   ├── dashboard/                   # Customer portal components
│   │   ├── ui/                          # Reusable UI primitives (Buttons, Dialogs, Inputs)
│   │   ├── AddToCartButton.tsx          # Animated add-to-cart button
│   │   ├── CheckoutAuthModal.tsx        # Guest vs. Account checkout modal
│   │   ├── Footer.tsx                   # Global responsive footer
│   │   ├── Header.tsx                   # Main navigation header with live search
│   │   ├── Navbar.tsx                   # Category navigation bar
│   │   ├── ProductCard.tsx              # Product display card with badges and ratings
│   │   ├── ProductGallery.tsx           # Multi-image preview and zoom gallery
│   │   ├── RichTextEditor.tsx           # TipTap rich text editor for descriptions
│   │   └── StickyBottomBar.tsx          # Mobile navigation bar
│   ├── context/
│   │   ├── AuthContext.tsx              # User authentication, token, and profile state
│   │   └── CartContext.tsx              # Shopping cart state, pricing, and sync
│   ├── data/
│   │   └── products.ts                  # Categorized beauty & grocery products
│   ├── lib/
│   │   ├── api.ts                       # Axios client configured with JWT interceptors
│   │   ├── mockData.ts                  # Comprehensive mock dataset for fallback
│   │   └── utils.ts                     # Class merge and formatting utilities
│   ├── public/                          # Static SVG icons and image assets
│   ├── package.json
│   └── tailwind.config.ts
│
├── package.json                         # Root workspace package.json with unified scripts
├── docs.md                              # Full architectural specification document
├── prompt.md                            # Step-by-step 8-milestone implementation roadmap
├── error.md                             # Full-stack audit and bug fix checklist
├── reqire.md                            # Cosmetics/Grocery requirements & performance specs
└── instraction.md                       # Backend module blueprint
```

---

## 7. API Architecture & Endpoints

All backend routes are mounted under `/api` in `backend/src/app/routes/index.ts`.

| Module | Route Prefix | Key Methods & Actions |
|---|---|---|
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `POST /refresh`, `POST /forgot-password`, `POST /reset-password` |
| **Products** | `/api/products` | `GET /` (Filter/Search/Paginate), `GET /:id`, `POST /` (Admin), `PATCH /:id`, `DELETE /:id` |
| **Categories** | `/api/categories` | `GET /` (Tree & Flat list), `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Brands** | `/api/brands` | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Orders** | `/api/orders` | `GET /` (My Orders / All Orders), `GET /:id`, `POST /`, `PATCH /:id/status`, `POST /:id/verify-payment` |
| **Checkout** | `/api/checkout` | `POST /calculate` (Totals, coupon, shipping), `POST /place-order` |
| **Payment Methods** | `/api/payment-methods` | `GET /` (Active methods), `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Upload** | `/api/upload` | `POST /` (Single/Multiple image upload to Cloudinary) |
| **Coupons** | `/api/coupons` | `GET /`, `POST /validate`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Inventory** | `/api/inventory` | `GET /alerts`, `PATCH /:id/stock`, `GET /summary` |
| **Dashboard** | `/api/dashboard` | `GET /stats` (Revenue, counts, trends), `GET /charts` (Monthly sales, categories) |
| **Addresses** | `/api/addresses` | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`, `PATCH /:id/default` |
| **Reviews** | `/api/reviews` | `GET /product/:productId`, `POST /`, `PATCH /:id/helpful`, `PATCH /:id/status` (Admin) |
| **Wishlist** | `/api/wishlist` | `GET /`, `POST /:productId`, `DELETE /:productId` |
| **Delivery Zones** | `/api/delivery-zones` | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Banners & Content** | `/api/banners`, `/api/faqs`, `/api/testimonials` | Standard CRUD for homepage sections |
| **Settings** | `/api/settings` | `GET /`, `PATCH /` (Store info, contact, SEO metadata) |
| **Newsletter** | `/api/newsletter` | `POST /subscribe`, `GET /subscribers` (Admin) |
| **Notifications** | `/api/notifications` | `GET /`, `PATCH /:id/read`, `PATCH /read-all` |

---

## 8. Development & Operational Guide

### 8.1 Prerequisites
- **Node.js**: v18.17+ or v20+
- **PostgreSQL**: Local or hosted database instance (e.g. Supabase, Neon, AWS RDS, or local Docker)
- **Cloudinary Account**: For media asset management (API Key, Secret, Cloud Name)

### 8.2 Environment Configuration
Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kinenao?schema=public"
NODE_ENV="development"
PORT=5000

# Authentication Secrets
JWT_SECRET="your_jwt_access_secret_key"
EXPIRES_IN="1d"
REFRESH_TOEKN_SECRET="your_jwt_refresh_secret_key"
REFRESH_TOEKN_EXPIRES_IN="30d"
RESET_PASS_TOKEN="your_jwt_password_reset_secret"
RESET_PASS_TOKEN_EXPIRES_IN="15m"
RESET_PASSWORD_LINK="http://localhost:3000/reset-password"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email Configuration (Nodemailer)
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 8.3 Running the Project

From the root directory:
```bash
# Install dependencies in both workspaces
npm --prefix backend install
npm --prefix frontend install

# Run backend database migrations and seeders
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..

# Run both frontend and backend concurrently
npm run dev           # Starts Next.js frontend (http://localhost:3000)
npm run dev:backend   # Starts Express.js backend (http://localhost:5000)
```

---

## 9. Security, Reliability & Performance Practices

1. **Enterprise Security**:
   - JWT tokens stored with strict expiration policies; refresh token rotation.
   - Salted BCrypt password hashing ($12$ salt rounds).
   - Strict RBAC middleware protecting all `/admin` routes.
   - Helmet HTTP headers and Express Rate Limiting against brute force and DoS attacks.
   - Zod validation for body and query parameters to reject malicious input before controller execution.
2. **Performance & Core Web Vitals**:
   - Hero banner preloading to optimize **Largest Contentful Paint (LCP)**.
   - Image optimization with Next.js Image component and responsive sizing to minimize **Cumulative Layout Shift (CLS)**.
   - Code splitting with Next.js dynamic imports for heavy components (e.g. TipTap rich text editor and Recharts).
3. **Resilience & Zero-Downtime Fallback**:
   - Frontend API client automatically switches to structured mock data (`mockData.ts`) if the backend server is unreachable, ensuring flawless UI demonstrations, offline development, and uninterrupted browsing.
4. **Data Integrity & Consistency**:
   - Foreign key cascading and restrictions on parent-child entities in Prisma (e.g. preventing category deletion if child products exist).
   - Atomic order placement with stock reservations to avoid race conditions.

---

## 10. Summary

The **Kinenao** platform combines the agility of Next.js 15 with the robustness of Express.js and Prisma ORM to deliver a production-grade e-commerce engine. With complete support for custom catalogs, manual payment processing, automated order timelines, role-based administration, and responsive design, Kinenao provides an enterprise foundation ready for commercial deployment.
