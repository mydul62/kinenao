You are a Principal Software Architect, Senior Full Stack Engineer, Senior UI/UX Designer, and Product Manager.

Your task is to build a production-ready online grocery e-commerce platform inspired by GhorerBazar.com and Chaldal. This is NOT a demo or portfolio project. Build it as a real-world commercial application with scalable architecture, clean code, modern UI/UX, enterprise security, and production-ready features.

=========================
PROJECT GOAL
=========================

Create a complete grocery shopping platform where customers can browse products, place orders, pay through manual payment methods, and track their orders. Admins and Managers should have powerful dashboards to manage the entire business.

The application must be modern, fast, responsive, SEO-friendly, and optimized for desktop, tablet, and mobile devices.

=========================
TECH STACK
=========================

Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod
  nextjs server data face
- Framer Motion

Backend
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Cloudinary
- Multer

=========================
IMPORTANT RULES
=========================

- Never hardcode business data.
- Use modular architecture.
- Follow reusable component architecture.
- Use clean code and best practices.
- Create responsive pages.
- Every CRUD page must include Search, Filter, Sort, and Pagination.
- Show loading skeletons.
- Show empty states.
- Show proper error handling.
- Display toast notifications.
- Use confirmation dialogs before delete actions.
- Build reusable forms, tables, modals, and UI components.
- Follow production-level folder structure.
- Do not generate placeholder features.

=========================
USER ROLES
=========================

1. Admin
- Full system control
- Manage Managers
- Manage Customers
- Manage Products
- Manage Categories
- Manage Brands
- Manage Inventory
- Manage Orders
- Manage Manual Payments
- Manage Delivery Charges
- Manage Coupons
- Manage Offers
- Manage Homepage Content
- Manage Reviews
- Manage Employees
- Manage Website Settings
- View Reports & Analytics

2. Manager
- Manage Products
- Manage Inventory
- Process Orders
- Verify Manual Payments
- Update Delivery Status
- Manage Promotions
- Reply to Customer Reviews

3. Customer
- Register/Login
- Manage Profile
- Manage Addresses
- Browse Products
- Search & Filter Products
- Add to Wishlist
- Add to Cart
- Checkout
- Upload Payment Proof
- Track Orders
- View Order History
- Review Purchased Products

=========================
HOMEPAGE
=========================

Create a premium landing page containing:

- Hero Banner Slider
- Featured Categories
- Flash Sale
- Today's Deals
- Best Selling Products
- New Arrivals
- Fruits
- Vegetables
- Fish & Meat
- Dairy
- Grocery Essentials
- Beverages
- Snacks
- Top Brands
- Promotional Banners
- Customer Testimonials
- FAQ
- Newsletter
- Footer

Every homepage section must be manageable from the Admin Dashboard.

=========================
PRODUCT MANAGEMENT
=========================

Each product should contain:

- Name
- Slug
- SKU
- Barcode
- Images
- Thumbnail
- Description
- Category
- Brand
- Price
- Discount Price
- Weight
- Unit
- Stock Quantity
- Tags
- Featured Status
- Best Seller Status
- Flash Sale Status
- SEO Meta Title
- SEO Description
- Active/Inactive Status

Support:

- Multiple Images
- Drag & Drop Upload
- Image Preview
- Cloudinary Storage

=========================
CATEGORY MANAGEMENT
=========================

Unlimited nested categories.

Example:

Groceries
 ├── Rice
 ├── Oil
 ├── Flour
 ├── Vegetables
 ├── Fruits
 ├── Meat
 ├── Fish
 ├── Dairy
 ├── Frozen Foods
 ├── Snacks

=========================
BRAND MANAGEMENT
=========================

Admin can:

- Create Brand
- Edit Brand
- Delete Brand
- Upload Logo
- Enable/Disable Brand

=========================
PRODUCT DETAILS PAGE
=========================

Include:

- Product Gallery
- Image Zoom
- Product Description
- Specifications
- Nutrition Information
- Delivery Information
- Return Policy
- Ratings
- Customer Reviews
- Related Products
- Frequently Bought Together
- Add to Cart
- Buy Now
- Wishlist

=========================
SEARCH & FILTER
=========================

Support searching by:

- Product Name
- SKU
- Category
- Brand
- Tags

Filters:

- Category
- Brand
- Price Range
- Rating
- Availability
- Discount

Live Search Suggestions.

=========================
SHOPPING CART
=========================

Features:

- Update Quantity
- Remove Product
- Save For Later
- Coupon Code
- Delivery Charge
- Tax Calculation
- Grand Total

=========================
CHECKOUT
=========================

Flow:

Cart
↓
Address
↓
Delivery Option
↓
Manual Payment
↓
Review Order
↓
Order Confirmation

=========================
MANUAL PAYMENT SYSTEM
=========================

DO NOT integrate Stripe, SSLCommerz, PayPal, or any online payment gateway.

Use only Manual Payment Verification.

Admin creates payment methods.

Each payment method contains:

- Payment Name
- Logo
- Account Number
- Account Name
- Account Type
- Payment Instructions
- Active Status

Supported examples:

- bKash
- Nagad
- Rocket
- Bank Transfer

Display payment methods as modern clickable cards.

Never use a dropdown.

When customer selects a payment method, show:

- Logo
- Account Number
- Account Name
- Account Type
- Instructions

Customer submits:

- Sender Number
- Transaction ID
- Paid Amount
- Payment Screenshot (Optional)
- Customer Note (Optional)

Order Status Flow:

Pending Payment Verification
→ Payment Verified
→ Confirmed
→ Packed
→ Shipped
→ Out for Delivery
→ Delivered

Rejected payments return to "Payment Pending".

Maintain complete order timeline with timestamps.

=========================
ORDER MANAGEMENT
=========================

Admin and Manager can:

- View Orders
- Search Orders
- Filter Orders
- Verify Payments
- Update Order Status
- Print Invoice

=========================
INVENTORY
=========================

Track:

- Current Stock
- Reserved Stock
- Sold Quantity
- Low Stock
- Out of Stock

Generate low stock alerts.

=========================
COUPON SYSTEM
=========================

Support:

- Fixed Discount
- Percentage Discount
- Free Delivery
- Minimum Purchase
- Usage Limit
- Expiration Date

=========================
CUSTOMER DASHBOARD
=========================

Pages:

- Dashboard
- Profile
- Addresses
- Orders
- Wishlist
- Reviews
- Notifications
- Change Password

=========================
ADMIN DASHBOARD
=========================

Analytics:

- Total Revenue
- Total Orders
- Total Customers
- Pending Orders
- Pending Payments
- Inventory Alerts

Charts:

- Monthly Sales
- Revenue
- Order Status
- Top Selling Products
- Category Sales

Recent Activity:

- Orders
- Customers
- Payments

=========================
REVIEWS
=========================

Only verified buyers can review.

Support:

- Rating
- Images
- Review Text
- Helpful Votes
- Admin Moderation

=========================
DELIVERY MANAGEMENT
=========================

Manage:

- Delivery Zones
- Delivery Charges
- Estimated Delivery Time

=========================
INVOICE
=========================

Generate printable professional invoices including:

- Company Logo
- Customer Information
- Order Information
- Purchased Products
- Payment Details
- Delivery Charge
- Discount
- Grand Total

=========================
SECURITY
=========================

Implement:

- JWT Authentication
- Refresh Tokens
- Password Hashing
- Role-Based Access Control
- Helmet
- CORS
- Rate Limiting
- Zod Validation
- Secure File Upload
- SQL Injection Protection
- XSS Protection

=========================
PERFORMANCE
=========================

Optimize using:

- Server Components
- Lazy Loading
- Image Optimization
- Pagination
- Code Splitting
- React Query Cache
- Optimistic Updates

=========================
UI/UX REQUIREMENTS
=========================

Create a premium modern shopping experience.

Use:

- Beautiful animations
- Consistent spacing
- Rounded cards
- Soft shadows
- Mobile-first responsive layout
- Dark/Light Mode
- Skeleton Loaders
- Empty States
- Error Boundaries
- Toast Notifications
- Accessible Components

The final application should be clean, scalable, secure, maintainable, and fully production-ready, following enterprise-level development standards suitable for deployment as a real online grocery business.



env for backend 

DATABASE_URL="postgresql://postgres:123456@localhost:5432/eventplanner?schema=public"

NODE_ENV="development"

PORT=5000

JWT_SECRET="asdgfoasdghdioawyqweityqwetafasdfsdfsdafsdfsdfsad"

EXPIRES_IN="1d"

REFRESH_TOEKN_SECRET="adhfuoadsghfiwyiqerytq379tyrutgq3454357345fgkdfadfgasdfasdg"

REFRESH_TOEKN_EXPIRES_IN="30d"

RESET_PASS_TOKEN="dsfqgq34yterghkgbhsdfogh45ty234thlkjvjbhsdfokvghqt2437t3ou7tqnvasdfg"

RESET_PASS_TOKEN_EXPIRES_IN='5m'

RESET_PASSWORD_LINK="http://localhost:3001/reset-password"

EMAIL="mydulcse62.niter@gmail.com"

APP_PASSWORD="hwazopngoojnxvcr"

CLOUDINARY_CLOUD_NAME="z80cuap2"
CLOUDINARY_API_KEY="717959968257737"
CLOUDINARY_API_SECRET="uYqRqnOlJ8ZWHurfAyp3EHcrMXc"

EMAIL_USER="mydulcse62.niter@gmail.com"
EMAIL_PASS="hwazopngoojnxvcr""uYqRqnOlJ8ZWHurfAyp3EHcrMXc"