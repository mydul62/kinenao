The backend API is currently not fetching data correctly. Fix the data fetching logic and ensure proper error handling. If the backend is unavailable, automatically fall back to realistic mock data so the application remains fully functional.

## Mock Data Requirements
- Remove all old placeholder or incorrect data.
- Replace it with premium cosmetics and beauty product data.
- The website is a girls' beauty & cosmetics eCommerce store.
- Include realistic:
  - Product names
  - Prices
  - Ratings
  - Reviews
  - Descriptions
  - Categories
  - Brands
  - Product images
  - Stock status
  - Discounts

Create categories such as:
- Skincare
- Makeup
- Lipsticks
- Foundations
- Concealers
- Eyeliners
- Mascaras
- Blush
- Perfumes
- Hair Care
- Beauty Tools
- Nail Care

Also create:
- Featured Products
- Best Sellers
- New Arrivals
- Trending Products
- Flash Sale
- Recommended Products

## Design Requirements
- Analyze the existing project structure before making changes.
- Read the public/photos directory and reuse existing images whenever possible.
- If suitable assets already exist, use them instead of creating placeholders.
- Maintain the same design language across the entire website.
- Make the UI look modern, premium, elegant, and suitable for a luxury cosmetics brand.
- Ensure the design is fully responsive on mobile, tablet, and desktop.

## Performance Requirements
- The Hero Banner is the highest priority.
- It must load instantly without noticeable delay.
- Optimize Largest Contentful Paint (LCP).
- Preload the hero banner image.
- Compress and optimize images.
- Lazy-load images below the fold.
- Prevent layout shifts (CLS).
- Improve Core Web Vitals and Lighthouse performance scores.

## UI/UX Requirements
- Improve spacing, typography, and visual hierarchy.
- Use smooth animations without affecting performance.
- Add hover effects, loading skeletons, and graceful loading states.
- Ensure all buttons, cards, and sections have consistent styling.
- Maintain accessibility best practices.

## Code Requirements
- Remove unused code, components, and dummy data.
- Refactor repetitive code into reusable components.
- Keep the code clean, modular, and maintainable.
- Fix console errors and warnings.
- Ensure there are no broken imports or runtime errors.

## Expected Result
Deliver a production-ready cosmetics eCommerce homepage that:
- Works even if the backend API is unavailable.
- Uses realistic cosmetics mock data.
- Has a premium, modern appearance.
- Loads the hero banner immediately.
- Is optimized for performance, SEO, and responsive design.
- Matches the existing project's design style and assets.
