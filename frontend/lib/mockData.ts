export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentCategory?: { name: string } | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  weight?: number;
  unit?: string;
  stockQty: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
  thumbnail: string;
  images: string[];
  description: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  brandId?: string;
  brand?: { id: string; name: string; slug: string };
  rating?: number;
  reviewsCount?: number;
}

export const mockCategories: Category[] = [
  { id: "cat-skincare", name: "Skincare", slug: "skincare" },
  { id: "cat-makeup", name: "Makeup", slug: "makeup" },
  { id: "cat-lipsticks", name: "Lipsticks", slug: "lipsticks", parentId: "cat-makeup" },
  { id: "cat-foundations", name: "Foundations", slug: "foundations", parentId: "cat-makeup" },
  { id: "cat-concealers", name: "Concealers", slug: "concealers", parentId: "cat-makeup" },
  { id: "cat-eyeliners", name: "Eyeliners", slug: "eyeliners", parentId: "cat-makeup" },
  { id: "cat-mascaras", name: "Mascaras", slug: "mascaras", parentId: "cat-makeup" },
  { id: "cat-blush", name: "Blush", slug: "blush", parentId: "cat-makeup" },
  { id: "cat-perfumes", name: "Perfumes", slug: "perfumes" },
  { id: "cat-haircare", name: "Hair Care", slug: "hair-care" },
  { id: "cat-beautytools", name: "Beauty Tools", slug: "beauty-tools" },
  { id: "cat-nailcare", name: "Nail Care", slug: "nail-care" }
];

export const mockBrands: Brand[] = [
  { id: "brand-chanel", name: "Chanel", slug: "chanel", logoUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=200&auto=format&fit=crop", isActive: true },
  { id: "brand-dior", name: "Dior", slug: "dior", logoUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=200&auto=format&fit=crop", isActive: true },
  { id: "brand-mac", name: "MAC Cosmetics", slug: "mac", logoUrl: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?q=80&w=200&auto=format&fit=crop", isActive: true },
  { id: "brand-fenty", name: "Fenty Beauty", slug: "fenty", logoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200&auto=format&fit=crop", isActive: true },
  { id: "brand-estee", name: "Estée Lauder", slug: "estee-lauder", logoUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=200&auto=format&fit=crop", isActive: true },
  { id: "brand-loreal", name: "L'Oréal", slug: "loreal", logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&auto=format&fit=crop", isActive: true }
];

export const mockProducts: Product[] = [
  // Lipsticks
  {
    id: "prod-mac-matte",
    name: "MAC Matte Retro Lipstick - Ruby Woo",
    slug: "mac-matte-retro-ruby-woo",
    sku: "MAC-LIP-RWOO",
    price: 2450,
    discountPrice: 2200,
    weight: 3,
    unit: "g",
    stockQty: 85,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isFlashSale: false,
    isNewArrival: false,
    isTrending: true,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?q=80&w=600&auto=format&fit=crop"
    ],
    description: "Ruby Woo is a very matte vivid blue-red lipstick that features an intense color payoff. It is one of the most famous and iconic shades of red in the world, loved by celebrities and makeup artists alike for its universally flattering undertones.",
    categoryId: "cat-lipsticks",
    category: { id: "cat-lipsticks", name: "Lipsticks", slug: "lipsticks" },
    brandId: "brand-mac",
    brand: { id: "brand-mac", name: "MAC Cosmetics", slug: "mac" },
    rating: 4.9,
    reviewsCount: 142
  },
  {
    id: "prod-dior-addict",
    name: "Dior Addict Lip Glow - Pink Cherry",
    slug: "dior-addict-lip-glow-pink",
    sku: "DIOR-LIP-GLOW",
    price: 4800,
    discountPrice: 4500,
    weight: 3.2,
    unit: "g",
    stockQty: 40,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isFlashSale: true,
    isNewArrival: true,
    isTrending: true,
    isRecommended: false,
    thumbnail: "https://images.unsplash.com/photo-1631730359575-38e4755d772b?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1631730359575-38e4755d772b?q=80&w=600&auto=format&fit=crop"],
    description: "The iconic Dior lip balm formulated with 97% natural-origin ingredients that subtly revives the natural color of lips with a custom glow for 6h and hydrates lips for 24h.",
    categoryId: "cat-lipsticks",
    category: { id: "cat-lipsticks", name: "Lipsticks", slug: "lipsticks" },
    brandId: "brand-dior",
    brand: { id: "brand-dior", name: "Dior", slug: "dior" },
    rating: 4.8,
    reviewsCount: 64
  },
  // Foundations & Concealers
  {
    id: "prod-fenty-foundation",
    name: "Fenty Beauty Pro Filt'r Soft Matte Foundation",
    slug: "fenty-pro-filtr-soft-matte-foundation",
    sku: "FENTY-FND-MATTE",
    price: 4200,
    discountPrice: 3900,
    weight: 32,
    unit: "ml",
    stockQty: 50,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isFlashSale: false,
    isNewArrival: false,
    isTrending: false,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop"],
    description: "A soft matte, longwear foundation with buildable, medium-to-full coverage, in a boundary-breaking range of 50 shades. Oil-free, sweat-resistant, and won't clog pores.",
    categoryId: "cat-foundations",
    category: { id: "cat-foundations", name: "Foundations", slug: "foundations" },
    brandId: "brand-fenty",
    brand: { id: "brand-fenty", name: "Fenty Beauty", slug: "fenty" },
    rating: 4.7,
    reviewsCount: 98
  },
  // Skincare
  {
    id: "prod-estee-anr",
    name: "Estée Lauder Advanced Night Repair Serum",
    slug: "estee-lauder-advanced-night-repair-serum",
    sku: "ESTEE-SRM-ANR",
    price: 8500,
    discountPrice: 7900,
    weight: 50,
    unit: "ml",
    stockQty: 30,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isFlashSale: false,
    isNewArrival: false,
    isTrending: true,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"],
    description: "Our #1 serum to help reduce the look of multiple signs of aging. Experience the next generation of our revolutionary formula. Fast penetrating, this serum reduces the look of multiple signs of aging caused by environmental assaults.",
    categoryId: "cat-skincare",
    category: { id: "cat-skincare", name: "Skincare", slug: "skincare" },
    brandId: "brand-estee",
    brand: { id: "brand-estee", name: "Estée Lauder", slug: "estee-lauder" },
    rating: 4.9,
    reviewsCount: 154
  },
  // Mascaras & Eyeliners
  {
    id: "prod-mac-mascara",
    name: "MAC In Extreme Dimension 3D Black Lash Mascara",
    slug: "mac-in-extreme-dimension-3d-mascara",
    sku: "MAC-MSC-3DBLK",
    price: 2800,
    discountPrice: null,
    weight: 12,
    unit: "ml",
    stockQty: 120,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isFlashSale: false,
    isNewArrival: true,
    isTrending: false,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1631214503851-a7e68291056a?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1631214503851-a7e68291056a?q=80&w=600&auto=format&fit=crop"],
    description: "A carbon black mascara with a large molded brush that creates extreme volume, length, and curl. Smudge-proof, clump-resistant, and flakes-free.",
    categoryId: "cat-mascaras",
    category: { id: "cat-mascaras", name: "Mascaras", slug: "mascaras" },
    brandId: "brand-mac",
    brand: { id: "brand-mac", name: "MAC Cosmetics", slug: "mac" },
    rating: 4.6,
    reviewsCount: 45
  },
  // Perfumes
  {
    id: "prod-chanel-no5",
    name: "Chanel No. 5 Eau de Parfum Spray",
    slug: "chanel-no-5-eau-de-parfum",
    sku: "CHANEL-PERF-NO5",
    price: 16500,
    discountPrice: 15000,
    weight: 100,
    unit: "ml",
    stockQty: 15,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: true,
    isFlashSale: false,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop"],
    description: "Since its creation in 1921, N°5 has expressed the very essence of femininity: an abstract, mysterious scent, alive with countless subtle facets, radiating an extravagant floral richness.",
    categoryId: "cat-perfumes",
    category: { id: "cat-perfumes", name: "Perfumes", slug: "perfumes" },
    brandId: "brand-chanel",
    brand: { id: "brand-chanel", name: "Chanel", slug: "chanel" },
    rating: 4.9,
    reviewsCount: 88
  },
  // Blush
  {
    id: "prod-dior-blush",
    name: "Dior Backstage Rosy Glow Blush",
    slug: "dior-backstage-rosy-glow-blush",
    sku: "DIOR-BLS-RG1",
    price: 5200,
    discountPrice: 4900,
    weight: 4.6,
    unit: "g",
    stockQty: 25,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isFlashSale: true,
    isNewArrival: true,
    isTrending: true,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1631214499557-4148560f6120?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1631214499557-4148560f6120?q=80&w=600&auto=format&fit=crop"],
    description: "Rosy Glow blush is the Dior makeup artists' secret weapon for creating the appearance of naturally rosy cheeks for a fresh, glowy effect. Formulated with color reviver technology.",
    categoryId: "cat-blush",
    category: { id: "cat-blush", name: "Blush", slug: "blush" },
    brandId: "brand-dior",
    brand: { id: "brand-dior", name: "Dior", slug: "dior" },
    rating: 4.8,
    reviewsCount: 39
  },
  // Hair Care
  {
    id: "prod-loreal-elvive",
    name: "L'Oréal Elvive Extraordinary Oil Serum",
    slug: "loreal-elvive-extraordinary-oil-serum",
    sku: "LOREAL-HAR-OIL",
    price: 1800,
    discountPrice: null,
    weight: 100,
    unit: "ml",
    stockQty: 75,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isFlashSale: false,
    isNewArrival: true,
    isTrending: false,
    isRecommended: false,
    thumbnail: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop"],
    description: "Extraordinary Oil is a hair care serum designed for dry to very dry hair. Enriched with 6 precious flower oils, it deeply nourishes and softens hair, leaving it silky, smooth and shiny.",
    categoryId: "cat-haircare",
    category: { id: "cat-haircare", name: "Hair Care", slug: "hair-care" },
    brandId: "brand-loreal",
    brand: { id: "brand-loreal", name: "L'Oréal", slug: "loreal" },
    rating: 4.5,
    reviewsCount: 29
  }
];

export const mockBanners = [
  {
    id: "banner-1",
    title: "Luxury Cosmetics & Premium Beauty",
    subtitle: "Discover high-end fragrances, skincare, and makeup collections.",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop",
    linkUrl: "/shop?category=makeup"
  },
  {
    id: "banner-2",
    title: "Revitalize Your Skincare Routine",
    subtitle: "Get up to 25% off on award-winning skincare solutions.",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
    linkUrl: "/shop?category=skincare"
  },
  {
    id: "banner-3",
    title: "Exclusive Designer Perfumes",
    subtitle: "Timeless scents from Dior, Chanel, and more luxury brands.",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop",
    linkUrl: "/shop?category=perfumes"
  }
];

export const mockFaqs = [
  {
    id: "1",
    question: "Are your beauty & cosmetics products 100% authentic?",
    answer: "Yes, absolutely! We source all our cosmetics directly from authorized brand distributors or directly from the official brand stores in Paris, New York, and Seoul. We guarantee 100% authenticity on every single item."
  },
  {
    id: "2",
    question: "Do you offer shade matching advice?",
    answer: "Yes, we do! You can reach out to our online beauty consultants via our chat support or email. We can guide you in picking the perfect foundation shade, concealer tone, or lipstick color based on your undertone."
  },
  {
    id: "3",
    question: "What is your return policy for cosmetics?",
    answer: "Due to hygiene reasons, we only accept returns on cosmetics if the seal is completely intact and the product is unopened, or if the item was damaged during transit. Please verify your items upon delivery."
  }
];

export const mockTestimonials = [
  {
    name: "Farhana Ahmed",
    comment: "I am absolutely in love with this cosmetics store! Sourcing authentic Dior and Chanel in Dhaka has never been easier. The delivery is extremely fast.",
    role: "Professional Makeup Artist"
  },
  {
    name: "Nabila Tabassum",
    comment: "Their advanced night repair serum was 100% authentic and the batch code verified perfectly. Outstanding premium service and fast response.",
    role: "Beauty Blogger"
  },
  {
    name: "Anika Rahman",
    comment: "Best packaging ever! Fragrances are packed in multiple layers of bubble wrap to prevent spills. Love their reward points too.",
    role: "Regular Customer"
  }
];
