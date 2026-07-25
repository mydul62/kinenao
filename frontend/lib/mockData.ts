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
  { id: "cat-saree", name: "শাড়ি", slug: "saree" },
  { id: "cat-three-piece", name: "থ্রি-পিস", slug: "three-piece" },
  { id: "cat-kids", name: "বাচ্চাদের খেলনা ও বই", slug: "kids-toys-books" },
  { id: "cat-makeup", name: "মেকআপ আইটেম", slug: "makeup-items" },
];

export const mockBrands: Brand[] = [
  { id: "brand-ht", name: "HT Brand", slug: "ht-brand", isActive: true },
];

export const mockBanners = [
  {
    id: "banner-1",
    title: "প্রিমিয়াম শাড়ি ও থ্রি-পিস কালেকশন",
    subtitle: "সারা দেশে ক্যাশ অন হোম ডেলিভারিতে কেনাকাটা করুন",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
    linkUrl: "/shop?category=saree",
  },
  {
    id: "banner-2",
    title: "বাচ্চাদের চমৎকার খেলনা ও আকর্ষণীয় বই",
    subtitle: "আপনার সন্তানের জন্য সেরা মানের উপহার",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop",
    linkUrl: "/shop?category=kids-toys-books",
  },
];

export const mockFaqs = [
  {
    id: "faq-1",
    question: "আপনাদের ডেলিভারি চার্জ কত?",
    answer: "ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা।",
  },
  {
    id: "faq-2",
    question: "পণ্য হাতে পাওয়ার পর পেমেন্ট করা যাবে?",
    answer: "হ্যাঁ! সারা দেশে ১০০% ক্যাশ অন হোম ডেলিভারি সুবিধা রয়েছে।",
  },
];

export const mockTestimonials = [
  {
    id: "test-1",
    name: "আনিকা সুলতানা",
    comment: "শাড়িটির কাপড় ও কারুকাজ খুবই সুন্দর ছিল। সময়মতো ডেলিভারি পেয়েছি।",
    rating: 5,
  },
  {
    id: "test-2",
    name: "মেহেদী হাসান",
    comment: "বাচ্চাদের খেলনাগুলো খুব ভালো কোয়ালিটির। ধন্যবাদ কিনতেআও-কে!",
    rating: 5,
  },
  {
    id: "test-3",
    name: "নুসরাত জাহান",
    comment: "মেকআপ কম্বো সেটটির কালার পিগমেন্টেশন দুর্দান্ত! ক্যাশ অন ডেলিভারি সার্ভিস অনেক ভালো।",
    rating: 5,
  },
];

export const mockProducts: Product[] = [
  {
    id: "coil-holder",
    name: "Coil holder (মেটাল মস্কিউটো কয়েল হোল্ডার)",
    slug: "coil-holder",
    sku: "HT-COIL-01",
    price: 550,
    discountPrice: 195,
    weight: 0.3,
    unit: "kg",
    stockQty: 120,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isFlashSale: true,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop"
    ],
    description: `<p>Metal Mosquito Coil Holder 🦟 🦟</p>
<p>"মশার উপদ্রব এখন চারিদিকেই, তাই নিরাপদে কয়েল ব্যবহার করতে আজই নিন "Mosquito Coil Holder" যাতে নেই কোথাও আগুন লাগার ভয়, ছাই ছড়াবে না ঘরের কোথাও"</p>
<p><strong>পণ্যের বিবরণ:-</strong></p>
<p>🎀 উচ্চ গ্রেড লোহা উপাদান তৈরি, যা নিরাপদ এবং ব্যবহার টেকসই।</p>
<p>🎀 অত্যাধুনিক পাখির খাঁচা নকশা যা আপনার মার্জিত অভ্যন্তরীণ প্রসাধনে একীভূত করে।</p>
<p>🎀 নিচে ঢাকনা দিয়ে, ছাই সংগ্রহ করা সহজ এবং চারপাশে কোনও অগোছালো নেই।</p>
<p>🎀 এই পণ্যটি আপনার মশার কয়েল বা বিপরীতমুখী পোর্টেবল মশার ধূপের যেকোনো আকারের জন্য উপযুক্ত।</p>
<p>🎀 সুবিধাজনক কয়েল ধারকটি বহন করা সহজ এবং আপনাকে বিরক্তিকর মশার উদ্বেগ ছাড়ে না।</p>
<p>⛳ সারা দেশে হোম ডেলিভারি এবং ঢাকায় ১০০% ক্যাশ অন হোম ডেলিভারি দেয়া হয়</p>`,
    categoryId: "cat-makeup",
    category: { id: "cat-makeup", name: "মেকআপ আইটেম", slug: "makeup-items" },
    brandId: "brand-ht",
    brand: { id: "brand-ht", name: "HT Brand", slug: "ht-brand" },
    rating: 4.9,
    reviewsCount: 128
  },
  {
    id: "saree-georgette",
    name: "জর্জেট এম্ব্রয়ডারি পার্টি শাড়ি",
    slug: "georgette-embroidery-party-saree",
    sku: "SAREE-GEO-01",
    price: 3500,
    discountPrice: 2450,
    weight: 0.8,
    unit: "kg",
    stockQty: 50,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"],
    description: `<p>এক্সক্লুসিভ জর্জেট এম্ব্রয়ডারি শাড়ি 🥻 ✨</p>
<p>"যেকোনো পার্টি বা উৎসবে আপনাকে দেবে অনন্য ও মার্জিত লুক। হাই-কোয়ালিটি জর্জেট ফেব্রিক ও গর্জিয়াস কারুকাজ।"</p>
<p><strong>পণ্যের বিবরণ:-</strong></p>
<p>🎀 প্রিমিয়াম কোয়ালিটি জর্জেট কাপড়ে নিখুঁত সুতার এম্ব্রয়ডারি কাজ।</p>
<p>🎀 সাথে থাকছে মেচিং ব্লাউজ পিস।</p>
<p>🎀 পরে অত্যন্ত আরামদায়ক এবং দীর্ঘস্থায়ী কালার গ্যারান্টি।</p>
<p>⛳ সারা দেশে হোম ডেলিভারি এবং ঢাকায় ১০০% ক্যাশ অন ডেলিভারি দেওয়া হয়।</p>`,
    categoryId: "cat-saree",
    category: { id: "cat-saree", name: "শাড়ি", slug: "saree" },
    brandId: "brand-ht",
    brand: { id: "brand-ht", name: "HT Brand", slug: "ht-brand" },
    rating: 4.8,
    reviewsCount: 64
  },
  {
    id: "3pc-cotton",
    name: "ডিজাইনার কটন ডিজিটাল প্রিন্ট থ্রি-পিস",
    slug: "designer-cotton-digital-print-three-piece",
    sku: "3PC-COT-01",
    price: 2200,
    discountPrice: 1450,
    weight: 0.7,
    unit: "kg",
    stockQty: 80,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"],
    description: `<p>ডিজাইনার কটন থ্রি-পিস ৩-পিস কালেকশন 👗</p>
<p>"নান্দনিক ডিজিটাল প্রিন্ট ও সুতার নিখুঁত এমব্রয়ডারি কাজের আকর্ষণীয় থ্রি-পিস।"</p>
<p><strong>পণ্যের বিবরণ:-</strong></p>
<p>🎀 কামিজ: প্রিমিয়াম ডিজিটাল প্রিন্টেড কটন।</p>
<p>🎀 সালোয়ার: ম্যাচিং সফট সুতি ফেব্রিক।</p>
<p>🎀 ওড়না: বড় সাইজের শিফন/কটন ফুল প্রিন্টেড ওড়না।</p>
<p>⛳ সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।</p>`,
    categoryId: "cat-three-piece",
    category: { id: "cat-three-piece", name: "থ্রি-পিস", slug: "three-piece" },
    brandId: "brand-ht",
    brand: { id: "brand-ht", name: "HT Brand", slug: "ht-brand" },
    rating: 4.7,
    reviewsCount: 42
  },
  {
    id: "kids-magic-book",
    name: "বাচ্চাদের ম্যাজিক ড্রয়িং বুক ও কালার পেন্সিল সেট",
    slug: "kids-magic-drawing-book-set",
    sku: "KIDS-BOOK-01",
    price: 850,
    discountPrice: 490,
    weight: 0.4,
    unit: "kg",
    stockQty: 150,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isRecommended: true,
    thumbnail: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop"],
    description: `<p>বাচ্চাদের ওয়াটার ম্যাজিক ড্রয়িং বুক 🎨 📖</p>
<p>"পাস ও পানি দিয়ে আঁকলে রঙ ভেসে ওঠে, শুকিয়ে গেলে আবার আঁকা যায়! বারবার ব্যবহারযোগ্য।"</p>
<p><strong>পণ্যের বিবরণ:-</strong></p>
<p>🎀 সম্পূর্ণ কেমিক্যাল মুক্ত ও বাচ্চাদের জন্য নিরাপদ।</p>
<p>🎀 বাচ্চাদের ছবি আঁকা ও হাতের লেখা শেখার সেরা শিক্ষণীয় বই।</p>
<p>🎀 সাথে পাচ্ছেন ম্যাজিক ওয়াটার পেন ও কালার পেন্সিল সেট।</p>
<p>⛳ সারা দেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।</p>`,
    categoryId: "cat-kids",
    category: { id: "cat-kids", name: "বাচ্চাদের খেলনা ও বই", slug: "kids-toys-books" },
    brandId: "brand-ht",
    brand: { id: "brand-ht", name: "HT Brand", slug: "ht-brand" },
    rating: 4.9,
    reviewsCount: 88
  }
];
