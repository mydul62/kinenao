export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Skincare" | "Makeup" | "Hair Care" | "Trends" | "Beauty Tools";
  readTime: string;
  date: string;
  author: {
    name: string;
    avatarUrl: string;
    role: string;
  };
  imageUrl: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "glowing-skincare-routine",
    title: "The Ultimate Skincare Routine for Radiant, Glowing Skin",
    excerpt: "Unlock the secrets to a naturally luminous complexion with our expert-approved 5-step daily routine.",
    category: "Skincare",
    readTime: "5 min read",
    date: "July 20, 2026",
    author: {
      name: "Sophia Bennett",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      role: "Dermatologist & Skin Coach"
    },
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
    content: `
      Achieving a radiant, glowing complexion isn't about luck—it's about consistency, protection, and using the right ingredients. Whether you have dry, oily, or combination skin, this expert-backed 5-step skincare routine will help restore your natural luminosity.

      ### Step 1: Gentle Cleansing
      The foundation of glowing skin is a clean canvas. Start your morning and end your night with a gentle, non-stripping cleanser. Look for formulas containing hydrating ingredients like glycerin or aloe vera. Cleansing removes dirt, excess oil, and impurities without compromising your skin's moisture barrier.

      ### Step 2: Hydrating Toner or Essence
      Dull skin is often dehydrated skin. Apply a hydrating toner or essence immediately after cleansing while your skin is still damp. Patting in layers of hydration plumps up skin cells, preparing them to absorb active ingredients more efficiently.

      ### Step 3: Vitamin C Serum (Morning) / Retinol (Night)
      Serums are the heavy lifters of your skincare routine.
      *   **Morning:** Apply a Vitamin C serum. It's a powerful antioxidant that neutralizes free radicals, brightens hyperpigmentation, and boosts collagen production.
      *   **Night:** Introduce a gentle Retinol or Bakuchiol serum. Retinoids accelerate cell turnover, bringing fresh, healthy skin cells to the surface and refining texture.

      ### Step 4: Lock It in With Moisturizer
      A great moisturizer acts as a seal, trapping hydration and reinforcing your skin barrier. Opt for gel-creams containing ceramides and hyaluronic acid for oily/combination skin, or rich creams containing squalane and shea butter for drier skin types.

      ### Step 5: Broad-Spectrum Protection (SPF)
      The absolute most critical step. UV radiation is the primary cause of premature aging, dark spots, and dullness. Never skip sunscreen—apply a broad-spectrum SPF 30 or higher every single morning, even on cloudy days or when staying indoors.
    `
  },
  {
    id: "mastering-red-lip",
    title: "Mastering the Classic Red Lip: Pro Tips and Tricks",
    excerpt: "Find your perfect shade of scarlet and learn the professional lining techniques for a flawless, smudge-proof finish.",
    category: "Makeup",
    readTime: "4 min read",
    date: "July 18, 2026",
    author: {
      name: "Olivia Vane",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      role: "Lead Makeup Artist"
    },
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800",
    content: `
      Nothing commands attention or elevates a look quite like a classic red lip. However, applying bold red lipstick can be intimidating. From feathering to finding the right undertone, here is your definitive guide to achieving a crisp, transfer-resistant red lip.

      ### 1. Prep is Everything
      Red lipstick highlights every dry patch or flake. Start by gently exfoliating your lips with a sugar scrub, then apply a hydrating lip balm. Allow the balm to sink in for a few minutes, then blot away any excess product so your lipstick has a clean surface to adhere to.

      ### 2. Know Your Undertone
      *   **Cool Undertones (Blue-Based Reds):** If your veins look blue/purple, cool reds like cherry or ruby will make your teeth look brighter and complement your complexion beautifully.
      *   **Warm Undertones (Orange-Based Reds):** If your veins look greenish, warm brick, tomato, or coral-reds will bring out the golden glow in your skin.
      *   **Neutral Undertones (True Reds):** You can wear almost any shade! Try a rich crimson.

      ### 3. Use Lip Liner First
      A liner prevents the color from bleeding (feathering) into fine lines around the mouth. Outline your lips starting from the Cupid's bow, then fill in the outer edges of the lips. This creates a base boundary and adds depth.

      ### 4. Apply in Thin Layers
      Apply your lipstick starting from the center of your mouth and blending outwards. For a long-lasting finish, blot your lips with a tissue, dust a tiny amount of translucent setting powder through the tissue onto your lips, and apply a final light layer of lipstick.
    `
  },
  {
    id: "summer-makeup-trends",
    title: "Summer Beauty Trends: Soft Glam and Pastel Accents",
    excerpt: "Explore the minimalist, dewy makeup trends sweeping the beauty industry this season.",
    category: "Trends",
    readTime: "3 min read",
    date: "July 15, 2026",
    author: {
      name: "Emma Watson",
      avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200",
      role: "Fashion & Beauty Editor"
    },
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    content: `
      This summer is all about effortless elegance. As temperatures rise, heavy foundations are taking a backseat to breathable, dewy skin, soft-focus blush, and playful pastel highlights. Here are the top trends to watch.

      ### 1. Skin-First Base (The Skin Tint)
      Heavy matte finishes are out. The new trend is a skin tint or lightweight serum foundation that lets your natural freckles show through. Conceal only where necessary, and embrace a glass-like shine on the high points of your face.

      ### 2. Sunset Blush
      Blush placement has moved higher. Instead of the apples of the cheeks, blend cream blush along your cheekbones up towards the temples. Mixing coral and pink shades simulates the warm glow of a summer sunset.

      ### 3. Pastel Eyeliners
      A quick pop of lilac, mint green, or baby blue liquid liner along the upper lash line or in the inner corner adds an instant playful vibe to an otherwise neutral face. Keep the rest of the makeup minimal to let the eyes shine.
    `
  },
  {
    id: "brush-cleaning-guide",
    title: "How to Clean and Maintain Your Makeup Brushes",
    excerpt: "Protect your skin from breakout-causing bacteria and prolong the life of your premium beauty tools.",
    category: "Beauty Tools",
    readTime: "4 min read",
    date: "July 12, 2026",
    author: {
      name: "Sophia Bennett",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      role: "Dermatologist & Skin Coach"
    },
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
    content: `
      Dirty makeup brushes are a breeding ground for bacteria, dust, and dead skin cells. Using dirty brushes not only compromises your makeup application but also clogs pores and leads to acne breakouts. Here is a simple guide to keeping your tools clean and hygienic.

      ### How Often Should You Wash Them?
      *   **Foundation & Concealer Brushes:** Once a week (liquid products build up quickly).
      *   **Powder & Eye Brushes:** Every two weeks.
      *   **Beauty Sponges:** After every single use (sponges hold onto moisture, leading to mold).

      ### The Step-by-Step Washing Method
      1.  **Wet the Bristles:** Hold the brush facing downwards under lukewarm running water. Avoid getting water into the ferrule (the metal part holding the glue), as this can loosen the bristles over time.
      2.  **Lather:** Pour a small amount of gentle baby shampoo or specialized brush cleanser into the palm of your hand or onto a textured silicone cleaning pad. Swirl the brush gently in circular motions.
      3.  **Rinse:** Rinse the soapy suds under running water until the water runs completely clear.
      4.  **Dry:** Squeeze out excess water with a clean towel. Reshape the brush head and lay the brushes flat off the edge of a counter to dry. Never dry them upright in a cup, as water will seep down and dissolve the glue.
    `
  }
];
