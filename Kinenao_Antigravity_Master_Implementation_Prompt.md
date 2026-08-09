# ANTIGRAVITY MASTER IMPLEMENTATION PROMPT --- KINENAO CATEGORY + VIDEO SHOPPING + ONE-PAGE ORDERING

You are working INSIDE my existing Kinenao e-commerce repository.

IMPORTANT: - Do NOT create a new project. - Do NOT replace the existing
architecture. - Do NOT rebuild the frontend/backend from scratch. -
First inspect the entire existing repository and understand the current
implementation. - Then modify the existing code professionally and
incrementally. - Reuse existing components, services, API clients,
authentication, RBAC, Prisma models, Cloudinary upload system,
checkout/order system, UI components, and styling wherever possible. -
Preserve all currently working features unless a change is required for
this new feature. - Do not create duplicate category/product/order
systems. - Do not use fake/mock data for functionality when a real
backend implementation exists. - Existing mock fallback may remain as a
development/demo fallback, but all new production functionality must
work through the real API and database.

================================================== 1. EXISTING PROJECT
BASELINE ==================================================

Project name: Kinenao

Architecture: - Frontend: Next.js 15 App Router, React 19, TypeScript -
UI: Tailwind CSS, Shadcn UI, Framer Motion - Backend: Node.js,
Express.js 5, TypeScript - ORM: Prisma - Database: PostgreSQL -
Authentication: JWT access/refresh tokens - RBAC: ADMIN, MANAGER,
CUSTOMER - Validation: Zod - Storage: Multer + Cloudinary - HTTP/API:
existing Axios/Fetch API layer - Existing customer storefront - Existing
customer dashboard - Existing admin/manager dashboard - Existing
product/category/order/checkout/payment/inventory/review/wishlist
modules - Existing manual payment workflow - Existing guest checkout
capability - Existing address/delivery-zone system - Existing order
timeline system - Existing rich text product description/editor -
Existing responsive UI

Existing backend architecture: Route -\> Controller -\> Service -\>
Prisma -\> PostgreSQL

Existing major backend modules include: - auth - address - banner -
brand - category - checkout - coupon - dashboard - deliveryZone - faq -
fileUpload - inventory - newsletter - notification - order -
paymentMethod - product - productReview - testimonial - websiteSetting -
wishlist

Existing important models include: - User - Profile - Address -
Category - Brand - Product - PaymentMethod - Order - OrderItem -
TimelineEvent - Coupon - Review - DeliveryZone - WishlistItem -
Notification - WebsiteSetting - Banner - Faq - Testimonial -
NewsletterSubscriber

Existing order lifecycle must remain compatible: PENDING_PAYMENT
PENDING_PAYMENT_VERIFICATION CONFIRMED PACKED SHIPPED OUT_FOR_DELIVERY
DELIVERED CANCELLED

Existing payment methods include manual bKash, Nagad, Rocket and Bank
Transfer.

================================================== 2. BUSINESS
REQUIREMENT ==================================================

I want to extend Kinenao with a new fashion/general-category shopping
experience.

The visual screenshots I provided are ONLY inspiration/reference. Do not
copy them pixel-for-pixel or copy any branding. Build a professional
Kinenao design.

The new experience should support category hierarchy such as:

Main Categories: - Saree - Three Piece - Kids - Bags & Purses -
Jewellery - Watches - and other categories that administrators can
create dynamically

The exact category list must NOT be hardcoded into the architecture.

The category system must remain fully dynamic and use the existing
hierarchical Category model.

Desired customer journey:

MAIN CATEGORY ↓ SUBCATEGORY ↓ PRODUCTS ↓ PRODUCT ↓ PRODUCT VIDEO ↓
PRODUCT DETAILS ↓ SELECT COLOR / VARIANT ↓ QUANTITY ↓ DELIVERY
INFORMATION ↓ PAYMENT ↓ CASH ON DELIVERY OR EXISTING PAYMENT METHOD ↓
PLACE ORDER

The main goal is a very simple and mobile-friendly shopping experience
where a customer can select a product and complete an order from
essentially one product page without being forced through many
unnecessary pages.

================================================== 3. FIRST TASK ---
INSPECT BEFORE CHANGING
==================================================

Before editing anything:

1.  Inspect the complete repository tree.
2.  Identify frontend and backend roots.
3.  Inspect:
    -   frontend package.json
    -   backend package.json
    -   Prisma schema
    -   seed files
    -   category module
    -   product module
    -   checkout module
    -   order module
    -   file upload module
    -   payment method module
    -   inventory module
    -   admin product pages
    -   admin category pages
    -   storefront shop pages
    -   existing product details page
    -   existing cart/checkout components
    -   existing API client
    -   existing types/interfaces
    -   existing mock fallback
4.  Search for existing:
    -   ProductVariant
    -   ProductImage
    -   color
    -   size
    -   SKU
    -   category hierarchy
    -   product video
    -   Cloudinary upload
    -   guest checkout
    -   buy now
    -   COD
5.  Understand the real current schema before making changes.

DO NOT assume that the documented architecture exactly matches the
current code. The actual repository is the source of truth.

After inspection, make a concise internal implementation plan and then
execute it.

================================================== 4. CATEGORY
EXPERIENCE --- STOREFRONT
==================================================

Create/improve a professional category discovery section.

Design goals: - Premium - Clean - Modern - Fast - Mobile-first -
Responsive - Touch-friendly - Consistent with existing Kinenao design
system - No unnecessary visual clutter

Main category section: - Category cards - Image - Name - Optional
product/subcategory count - Hover animation on desktop - Touch-friendly
interaction on mobile - Horizontal scroll/carousel where appropriate -
Do not make the whole page overflow horizontally

Category navigation must support unlimited parent -\> child
relationships.

Example:

Saree -\> Cotton Saree -\> Silk Saree -\> Jamdani -\> Tangail -\> Katan

Three Piece -\> Embroidered -\> Printed -\> Party Wear -\> Casual

Kids -\> Toys -\> Kids Dress -\> Educational Toys

Bags & Purses -\> Hand Bag -\> School Bag -\> Wallet -\> Purse

Jewellery -\> Necklace -\> Earrings -\> Bracelet -\> Ring

These are examples only. Admin must be able to create/edit/delete
categories dynamically.

================================================== 5. CATEGORY PAGE
==================================================

Build/update the category page so that:

/category/\[slug\]

or the repository's existing category route convention is used.

Requirements: - Show category title - Show category image/banner if
available - Show child/subcategories - Show product count - Show
products belonging to the category - Support recursive hierarchy -
Support breadcrumbs - Support filters - Support sorting - Support
pagination/infinite loading according to the existing architecture -
Support mobile layout - Support desktop layout

Clicking a parent category should show its children.

Clicking a subcategory should show its products.

Do not create separate hardcoded pages for Saree, Three Piece, Kids,
etc.

================================================== 6. PRODUCT DATA MODEL
--- VARIANTS / COLORS ==================================================

This is critical.

A product may have multiple colors/variants.

Example:

Premium Cotton Saree - Red - Blue - Green - Black - Pink

Do NOT create five unrelated products just because there are five
colors.

Inspect the current Prisma schema.

If an existing variant system exists: - extend/reuse it.

If no suitable variant system exists: - add a proper ProductVariant
model or equivalent.

The final schema should support, where appropriate:

Product - id - name - slug - description - price - discountPrice - sku -
barcode - stock - images - video - category - brand - status - SEO
fields - existing fields already used by the project

ProductVariant - id - productId - name/label - colorName - colorCode -
image/imageUrl - sku if needed - price override if needed - stock -
optional size - active/status - sort order - createdAt - updatedAt

Do not blindly add every field if the existing schema already models the
same concept differently.

Normalize the schema properly.

The selected color/variant must be persisted with the order.

================================================== 7. PRODUCT VIDEO
==================================================

Add professional product video support.

Admin should be able to upload a product video.

Use the existing Cloudinary/Multer infrastructure where appropriate.

Do NOT store raw video files inside the database.

Database should store: - video URL - public ID/resource identifier if
required - optional thumbnail/poster URL - optional duration/metadata
only if useful

Support: - MP4/WebM where supported by the current upload pipeline -
reasonable file size validation - MIME validation - secure upload -
deletion/replacement of old video - optional poster image

If the existing Cloudinary upload module is image-only: - extend it
carefully to support video resources - keep existing image upload
functionality working

Add proper backend validation.

Never expose Cloudinary secrets to the frontend.

================================================== 8. PRODUCT DETAIL
PAGE --- MAJOR UX CHANGE
==================================================

Improve the existing product detail page.

Do not destroy existing useful features.

Create a premium, mobile-first product experience.

Desired structure:

1.  Header/navigation
2.  Breadcrumb
3.  Product video
4.  Product image gallery
5.  Product title
6.  Rating/review summary
7.  Price
8.  Discount/offer if available
9.  Stock status
10. Variant/color selection
11. Quantity selector
12. Product details
13. Rich text description
14. Specifications
15. Delivery information
16. Address/order form
17. Payment selection
18. Order summary
19. Place Order
20. Reviews
21. Related products

The primary ordering section must be easy to reach.

On mobile: - single-column layout - large tap targets - sticky bottom
action bar - sticky "Order Now" / "Buy Now" CTA - no cramped forms - no
horizontal page overflow - optimized video size - optimized images

On desktop: - elegant two-column product presentation where
appropriate - video/gallery on the left - product purchase panel on the
right - purchase panel can become sticky while scrolling - details can
continue below

================================================== 9. PRODUCT VIDEO
EXPERIENCE ==================================================

The product video should be prominent.

Requirements: - Responsive 16:9 or product-appropriate aspect ratio -
Poster image when available - Play/pause - Native controls - Muted
autoplay only if browser policy allows and only where UX makes sense -
Lazy-load where appropriate - Do not autoplay with sound - Do not
destroy mobile performance - Do not block LCP unnecessarily

If no video exists: - show the normal product image gallery cleanly - do
not show an empty video box

================================================== 10. COLOR / VARIANT
SELECTOR ==================================================

Build a professional color selector.

Example:

Available Colors

\[ Red \] \[ Blue \] \[ Green \] \[ Black \]

Prefer visual swatches when colorCode exists.

Each variant can have: - color name - color code - optional image

When customer selects a variant: - selected state must be obvious -
product image may update - price may update if variant price differs -
stock must update - SKU may update - order submission must contain the
selected variant

Prevent ordering an out-of-stock variant.

If there are no variants: - do not show an empty variant section.

================================================== 11. ONE-PAGE / QUICK
ORDER ==================================================

This is the core requirement.

Add a "Buy Now" / "Order Now" experience.

Customer should be able to:

1.  Select product
2.  Select color/variant
3.  Select quantity
4.  Enter/select address
5.  Select payment
6.  Place order

without unnecessary navigation.

Existing cart checkout must continue working.

The new direct-order flow should reuse the existing checkout/order
business logic instead of duplicating it.

Possible implementation: - extend existing checkout service to accept a
direct purchase payload - or create a clean buy-now endpoint/service
that internally uses the same calculation/order logic

Do NOT create a second independent order engine.

================================================== 12. GUEST CHECKOUT
==================================================

Guest users must be able to order.

Login must NOT be mandatory.

For guests, collect: - Full name - Phone number - Address -
Area/city/district as supported by existing Address/DeliveryZone
system - Optional note

If the customer is authenticated: - load saved addresses - allow
selecting an existing address - allow creating a new address - use
profile phone/name when available

Do not force account creation.

If guest checkout already exists, extend it instead of replacing it.

================================================== 13. CASH ON DELIVERY
==================================================

Add/ensure Cash on Delivery is properly supported.

COD should be a first-class payment option.

Customer can select:

-   Cash on Delivery
-   bKash
-   Nagad
-   Rocket
-   Bank Transfer

depending on the currently active payment methods and business
configuration.

COD must NOT require: - transaction ID - payment screenshot - sender
phone for payment verification

COD order should enter the correct existing order lifecycle.

Do not break manual payment verification for digital payments.

================================================== 14. PAYMENT LOGIC
==================================================

Preserve existing manual payment workflow.

For bKash/Nagad/Rocket/Bank Transfer: - payment instructions - account
number - transaction ID - sender number - paid amount - optional
screenshot - verification - admin/manager approval

For COD: - no transaction proof required - payment status should clearly
indicate COD/unpaid until delivery/payment completion according to
existing business rules

Keep the existing payment and order status architecture compatible.

================================================== 15. ORDER ITEM
SNAPSHOT ==================================================

When an order is created, preserve the selected product/variant
information as an immutable snapshot.

At minimum, order item data should retain: - product ID - product name
snapshot - SKU snapshot if applicable - selected variant ID if
applicable - selected color name - selected color code if applicable -
selected image if useful - quantity - unit price - discount - subtotal

Why: If admin changes the product later, old orders must still show what
the customer actually purchased.

================================================== 16. BACKEND API
==================================================

Inspect existing APIs before creating new ones.

Reuse existing endpoints whenever possible.

Likely areas to update:

CATEGORY: - GET categories - GET category tree - GET category by slug -
GET child categories - CRUD admin category endpoints

PRODUCT: - GET product - GET products by category - CRUD product -
product variants - product video - filters - sorting

UPLOAD: - image upload - video upload - video replacement/deletion

CHECKOUT: - calculate direct purchase - validate product/variant stock -
calculate delivery - calculate discounts - validate coupon if
supported - create order

ORDER: - preserve order lifecycle - preserve timeline events - preserve
admin verification - preserve customer tracking

Do not duplicate existing endpoints unnecessarily.

Use: Route -\> Controller -\> Service -\> Prisma.

Use Zod validation.

Use proper authentication/RBAC.

================================================== 17. ADMIN PRODUCT
CREATE / EDIT ==================================================

This is extremely important.

Update the Admin/Manager product creation and edit UI.

Product form should support:

BASIC INFORMATION - Product name - Slug - Category - Subcategory through
existing hierarchy - Brand - SKU - Barcode - Unit - Weight - Price -
Discount price - Stock - Reorder level - Tags - Status

MEDIA - Multiple product images - Reorder images - Delete images -
Product video upload - Video preview - Replace video - Remove video -
Optional video poster

VARIANTS - Enable variants - Add color - Color name - Color code -
Variant image - Variant SKU - Variant stock - Variant price override -
Enable/disable variant - Reorder variants - Delete variant

DESCRIPTION - Existing rich text editor - Bold - Italic - Bullet list -
Ordered list - Headings - Links - Clean formatting

SEO - Meta title - Meta description - Slug - Existing SEO fields

The admin UI should be organized into logical sections/tabs/cards.

Do not make a giant unusable form.

Use clear validation errors.

Show upload progress.

Show image/video previews.

Prevent accidental data loss.

================================================== 18. ADMIN CATEGORY
MANAGEMENT ==================================================

Improve existing category management.

Admin/Manager should be able to:

-   create parent category
-   create child category
-   create nested child if supported
-   edit category
-   upload category image
-   set slug
-   set description
-   set active/inactive
-   set display order
-   optionally configure featured category
-   safely delete categories

Use a tree/table UI.

Show hierarchy visually.

Example:

Saree ├─ Cotton ├─ Silk ├─ Jamdani

Three Piece ├─ Party Wear ├─ Casual

Do not hardcode these.

Prevent unsafe deletion when products/children exist unless the existing
system has a safe reassignment strategy.

================================================== 19. ADMIN PRODUCT
LIST ==================================================

Improve product management list/grid.

Show: - product image - name - category - variant count - video
indicator - price - stock - status - updated date - actions

Filters: - category - subcategory - brand - stock - status - has video -
has variants

Actions: - edit - duplicate if existing - activate/deactivate - delete
according to existing safe rules

================================================== 20. CUSTOMER PRODUCT
CARD ==================================================

Update product cards where appropriate.

Show: - image - optional video indicator - product name - price -
discount - rating - stock - wishlist button - quick view/buy now if
appropriate

Do not overload cards with too much information.

Use Next.js Image optimization.

================================================== 21. MOBILE-FIRST
REQUIREMENTS ==================================================

The new feature MUST be mobile-friendly.

Test at minimum: - 320px - 360px - 390px - 430px - tablet - desktop -
large desktop

Must avoid: - horizontal scrolling - tiny buttons - unreadable text -
broken cards - fixed elements covering inputs - keyboard overlap
problems - oversized video - huge empty spaces

Mobile order form should feel like a modern shopping app.

Sticky bottom CTA example:

\[ Buy Now / Order Now \]

When clicked: - scroll/focus to the order section OR - open the
quick-order panel/sheet

Use the existing design system.

================================================== 22. PERFORMANCE
==================================================

Preserve/improve Core Web Vitals.

Use: - next/image - lazy loading - responsive image sizes - dynamic
imports for heavy editor components - lazy-load product video where
appropriate - avoid unnecessary client components - avoid excessive API
requests - use memoization only where beneficial - pagination/infinite
loading - proper caching/revalidation according to current architecture

Do not make the entire product page a client component unless necessary.

================================================== 23. SECURITY
==================================================

Do not weaken existing security.

Maintain: - JWT auth - RBAC - Zod validation - Helmet - rate limiting -
secure file upload - MIME validation - file size limits - Cloudinary
server-side credentials - authorization checks

Never trust: - client price - client stock - client discount - client
delivery fee - client variant availability

The backend must recalculate everything.

================================================== 24. INVENTORY / STOCK
SAFETY ==================================================

Variant stock must be respected.

For products without variants: - use existing product stock.

For products with variants: - use variant stock where applicable.

During order placement: - verify stock transactionally -
reserve/decrement stock using existing inventory strategy - prevent race
conditions - do not allow negative stock - preserve existing inventory
audit behavior

If the existing project uses Prisma transactions, use them.

================================================== 25. DATABASE
MIGRATION ==================================================

After deciding the exact schema changes:

1.  Update Prisma schema.
2.  Generate Prisma client.
3.  Create a proper migration.
4.  Do NOT delete production data.
5.  Make migrations backward-conscious.
6.  Update seed data.
7.  Add sample categories/subcategories only if the existing seed
    strategy uses demo data.
8.  Add sample variants/video metadata only if appropriate.
9.  Run Prisma validation.
10. Run type checks.

Do not use destructive reset commands on an existing database.

NEVER use: prisma migrate reset unless I explicitly request a database
reset.

================================================== 26. SEED / DEMO DATA
==================================================

Update seed data to demonstrate the feature professionally.

Create examples such as:

Saree - Cotton Saree - Silk Saree - Jamdani

Three Piece - Embroidered - Party Wear

Kids - Toys - Kids Dress

Bags & Purses - Hand Bag - School Bag

Jewellery - Necklace - Earrings

But keep the data structure dynamic.

If external image/video URLs are needed for development, use safe
placeholder/demo assets only and clearly mark them as seed/demo data.

================================================== 27. FRONTEND ROUTING
==================================================

Inspect existing route structure first.

Use the current route conventions.

Likely routes may include: - /shop - /category/\[slug\] -
/product/\[slug\] - /dashboard - /admin/products - /admin/categories

Do not create duplicate routes if equivalent routes already exist.

The final architecture must have one reusable product detail experience.

================================================== 28. API TYPES / STATE
/ HOOKS ==================================================

Update: - TypeScript interfaces/types - API service methods - React
hooks - query keys if using React Query/TanStack Query - Context if
required - form schemas - validation schemas - mock fallback types/data
if maintained

Make sure frontend and backend types remain consistent.

No `any` unless truly unavoidable.

================================================== 29. ERROR / LOADING /
EMPTY STATES ==================================================

Every new page/component must have:

Loading: - skeleton UI

Error: - clear user-friendly message - retry action where useful

Empty: - proper empty state

Product: - out-of-stock state - no-video state - no-variant state -
unavailable variant state

Order: - validation error - failed order - success confirmation

Never leave a blank screen.

================================================== 30. ORDER SUCCESS
==================================================

After successful one-page order:

Show: - success confirmation - order number - product - selected
color/variant - quantity - total - payment method - delivery information
summary - expected next step - continue shopping - view order/tracking
if customer is logged in - guest order reference if supported by
existing architecture

Do not expose sensitive payment information.

================================================== 31. CUSTOMER
DASHBOARD ==================================================

Update customer order details so that selected variants/colors are
visible.

Example:

Premium Cotton Saree Color: Red Quantity: 2

Order history must show the same snapshot even if the product is later
edited.

Order timeline must continue to work.

================================================== 32. ADMIN ORDER
DETAILS ==================================================

Admin/Manager order detail should show:

Product Variant Color SKU Quantity Price Subtotal

and preserve: - payment verification - customer info - delivery
address - order timeline - notes - status controls - invoice

================================================== 33. SEO
==================================================

For category and product pages: - dynamic metadata - product title -
description - canonical URL if current architecture supports it - Open
Graph data if existing site uses it

Use product/category SEO fields from the database.

================================================== 34. ACCESSIBILITY
==================================================

Use: - semantic HTML - labels - keyboard navigation - visible focus -
accessible dialogs - accessible buttons - aria labels where necessary -
sufficient contrast - meaningful alt text - accessible video controls

Color selection must not rely only on color; always display the color
name.

================================================== 35. DESIGN DIRECTION
==================================================

Design should feel like a professional Bangladeshi modern e-commerce
platform.

Reference characteristics: - clean white/light background - rounded
cards - subtle borders - soft shadows - strong typography - clear price
hierarchy - premium category cards - tasteful accent color - smooth
hover/transition - mobile-friendly spacing - large product media - clear
CTA - professional forms

Do NOT blindly copy the screenshots.

Do NOT introduce random colors.

Use existing Kinenao brand colors/design tokens if already present.

================================================== 36. DO NOT BREAK
EXISTING FEATURES ==================================================

Before finishing, verify:

-   login
-   registration
-   JWT refresh
-   RBAC
-   customer dashboard
-   admin dashboard
-   manager permissions
-   category CRUD
-   product CRUD
-   image upload
-   rich text editor
-   cart
-   wishlist
-   coupons
-   delivery zones
-   manual payment
-   COD
-   order creation
-   order status updates
-   payment verification
-   order timeline
-   reviews
-   inventory
-   notifications
-   banners
-   settings
-   existing homepage
-   existing shop/search/filtering

The new functionality must integrate with these systems.

================================================== 37. TESTING /
VALIDATION ==================================================

After implementation run:

BACKEND: - npm install if needed - Prisma generate - Prisma validate -
migration - seed if appropriate - TypeScript build/typecheck - lint -
tests if available

FRONTEND: - TypeScript check - lint - production build - existing
tests - verify routes

Test at least these flows:

FLOW A: Saree -\> Cotton -\> Product -\> select Red -\> quantity 1 -\>
guest -\> COD -\> order

FLOW B: Saree -\> Silk -\> Product -\> select Blue -\> logged-in
customer -\> saved address -\> COD -\> order

FLOW C: Product with no variants -\> order

FLOW D: Product with variants -\> out-of-stock variant cannot order

FLOW E: Product with video -\> video displays

FLOW F: Product without video -\> page remains clean

FLOW G: Admin creates product with image + video + colors -\> customer
sees it

FLOW H: Admin edits product variant stock -\> customer sees updated
availability

FLOW I: Digital payment -\> existing payment verification flow still
works

FLOW J: Old product without new fields -\> existing product page still
works

================================================== 38. IMPORTANT
IMPLEMENTATION RULE ==================================================

Do NOT stop after creating UI.

This task is FULL STACK.

You must implement:

FRONTEND + BACKEND + PRISMA SCHEMA + MIGRATION + SEED + UPLOAD + ADMIN
PRODUCT FORM + ADMIN CATEGORY MANAGEMENT + PRODUCT DETAIL PAGE +
VARIANTS/COLORS + PRODUCT VIDEO + GUEST ORDER + COD + ORDER SNAPSHOT +
INVENTORY + CUSTOMER DASHBOARD + ADMIN ORDER DETAILS + TYPES/API +
VALIDATION + RESPONSIVE DESIGN + TESTING

Everything must work together.

================================================== 39. FILE CHANGE
DISCIPLINE ==================================================

Before modifying: - identify exact existing files.

When modifying: - preserve existing conventions - preserve imports -
preserve reusable components - avoid duplicate components - avoid
duplicate services - avoid dead code

When creating new files: - place them in the existing architecture - use
the existing naming conventions

After changes: - search for unused imports - search for old incompatible
types - search for duplicate API calls - search for old product
schemas - search for broken references

================================================== 40. MIGRATION SAFETY
==================================================

This is an existing project.

Do NOT: - delete the database - reset the database - drop existing
tables - remove existing production fields - remove existing orders -
remove existing products - rewrite Prisma schema from scratch

Use additive/compatible schema changes where possible.

If a breaking migration is genuinely unavoidable: - stop and clearly
explain the migration risk before executing it.

================================================== 41. FINAL ACCEPTANCE
CRITERIA ==================================================

The implementation is complete only when all of the following are true:

\[ \] Main categories are dynamic \[ \] Parent/child categories work \[
\] Subcategories work \[ \] Product filtering by category works \[ \]
Product variants/colors work \[ \] Variant stock works \[ \] Product
video upload works \[ \] Product video storage works \[ \] Product video
displays correctly \[ \] Admin can upload/edit/remove video \[ \] Admin
can manage colors/variants \[ \] Admin can manage category hierarchy \[
\] Admin product editor is updated \[ \] Product detail page is
redesigned \[ \] Product detail page is mobile friendly \[ \]
One-page/direct ordering works \[ \] Guest ordering works \[ \]
Logged-in ordering works \[ \] Saved address works \[ \] COD works \[ \]
Existing digital payment works \[ \] Existing cart checkout still works
\[ \] Order stores selected variant/color snapshot \[ \] Inventory
remains correct \[ \] Order timeline remains correct \[ \] Customer
dashboard shows selected variant/color \[ \] Admin order page shows
selected variant/color \[ \] Existing authentication still works \[ \]
Existing RBAC still works \[ \] Existing homepage still works \[ \]
Existing shop still works \[ \] Existing wishlist/review/coupon systems
still work \[ \] TypeScript passes \[ \] Prisma validates \[ \] Backend
builds \[ \] Frontend builds \[ \] No obvious console/runtime errors \[
\] No horizontal overflow on mobile \[ \] No destructive database reset
was used

================================================== 42. EXECUTION MODE
==================================================

Work in phases.

PHASE 1 --- DISCOVERY - inspect repository - inspect schema - inspect
existing UI/API architecture - identify reusable components - identify
exact files to modify

PHASE 2 --- DATABASE - design minimal schema extension - update Prisma -
migrate safely - update seed

PHASE 3 --- BACKEND - product variant logic - video upload - category
APIs - product APIs - checkout/buy-now logic - COD - order snapshot -
inventory validation - Zod schemas - tests

PHASE 4 --- ADMIN - category tree management - product create/edit -
image/video upload - variants/colors - stock - previews

PHASE 5 --- STOREFRONT - category section - category page - subcategory
navigation - product cards - product detail - video - variant/color
selection - direct order

PHASE 6 --- CUSTOMER ORDER - guest form - logged-in address - payment
selection - COD - order confirmation

PHASE 7 --- DASHBOARDS - customer order snapshot - admin order
snapshot - inventory - timeline

PHASE 8 --- RESPONSIVE/POLISH - mobile - tablet - desktop -
accessibility - animations - loading/error/empty states

PHASE 9 --- VALIDATION - build - typecheck - lint - migration
validation - end-to-end critical flows - fix all errors

================================================== 43. VERY IMPORTANT
--- DO NOT ASK ME TO MANUALLY CODE EACH PART
==================================================

You are the implementation agent.

After understanding the repository, implement the feature end-to-end.

Do not merely give me: - a plan - sample code - pseudocode - schema
suggestions - UI mockups

Actually modify the existing project files.

If something already exists, improve/reuse it.

If something is missing, implement it.

If an existing implementation conflicts with this requirement, adapt it
carefully rather than creating a parallel system.

================================================== 44. FINAL REPORT
==================================================

At the end, provide a concise implementation report containing:

1.  What was changed
2.  Frontend files/modules changed
3.  Backend files/modules changed
4.  Prisma schema changes
5.  Migration name
6.  New API endpoints or modified endpoints
7.  Admin features added
8.  Customer features added
9.  Video upload implementation
10. Variant/color implementation
11. COD implementation
12. Guest ordering implementation
13. Testing performed
14. Build/typecheck/lint status
15. Any remaining issues that genuinely require manual attention

Do not claim something is completed unless it actually works.

================================================== 45. FINAL PRODUCT
EXPERIENCE ==================================================

The final customer experience should feel like:

CATEGORY → SUBCATEGORY → PRODUCT

Then on one highly polished product page:

VIDEO → PRODUCT DETAILS → COLOR / VARIANT → QUANTITY → ADDRESS → PAYMENT
→ ORDER NOW

It should be fast, simple, professional, and especially optimized for
mobile users.

Build this as a real production feature inside the existing Kinenao
codebase, not as a demo or separate prototype.
