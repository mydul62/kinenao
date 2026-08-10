/**
 * Multilingual & Banglish Search Synonym Dictionary & Helper
 * Supports Bangla, English, and Banglish (Phonetic / Transliterated) search terms.
 */

const SYNONYM_MAP: Record<string, string[]> = {
  // Saree / Shari / শাড়ি
  saree: ["saree", "sari", "shari", "শাড়ি", "শাড়ি"],
  sari: ["saree", "sari", "shari", "শাড়ি", "শাড়ি"],
  shari: ["saree", "sari", "shari", "শাড়ি", "শাড়ি"],
  "শাড়ি": ["saree", "sari", "shari", "শাড়ি", "শাড়ি"],
  "শাড়ি": ["saree", "sari", "shari", "শাড়ি", "শাড়ি"],

  // Three Piece / 3 Piece / থ্রি পিস
  threepiece: ["three piece", "3 piece", "three-piece", "থ্রি পিস", "থ্রিপিস", "থ্রি-পিস", "salwar", "kameez"],
  "three piece": ["three piece", "3 piece", "three-piece", "থ্রি পিস", "থ্রিপিস", "থ্রি-পিস"],
  "3piece": ["three piece", "3 piece", "three-piece", "থ্রি পিস", "থ্রিপিস", "থ্রি-পিস"],
  "3 piece": ["three piece", "3 piece", "three-piece", "থ্রি পিস", "থ্রিপিস", "থ্রি-পিস"],
  "থ্রি পিস": ["three piece", "3 piece", "three-piece", "থ্রি পিস", "থ্রিপিস", "থ্রি-পিস"],
  "থ্রি-পিস": ["three piece", "3 piece", "three-piece", "থ্রি পিস", "থ্রিপিস", "থ্রি-পিস"],

  // Watch / Ghori / ঘড়ি
  watch: ["watch", "ghori", "gori", "ঘড়ি", "ঘরি"],
  ghori: ["watch", "ghori", "gori", "ঘড়ি", "ঘরি"],
  gori: ["watch", "ghori", "gori", "ঘড়ি", "ঘরি"],
  "ঘড়ি": ["watch", "ghori", "gori", "ঘড়ি", "ঘরি"],
  "ঘরি": ["watch", "ghori", "gori", "ঘড়ি", "ঘরি"],

  // Cosmetics / Makeup / কসমেটিকস / মেকআপ
  cosmetics: ["cosmetics", "cosmetic", "makeup", "beauty", "কসমেটিকস", "মেকআপ"],
  cosmetic: ["cosmetics", "cosmetic", "makeup", "beauty", "কসমেটিকস", "মেকআপ"],
  makeup: ["cosmetics", "cosmetic", "makeup", "beauty", "কসমেটিকস", "মেকআপ"],
  beauty: ["cosmetics", "cosmetic", "makeup", "beauty", "কসমেটিকস", "মেকআপ"],
  "কসমেটিকস": ["cosmetics", "cosmetic", "makeup", "beauty", "কসমেটিকস", "মেকআপ"],
  "মেকআপ": ["cosmetics", "cosmetic", "makeup", "beauty", "কসমেটিকস", "মেকআপ"],

  // Lipstick / Lipbalm / লিপস্টিক
  lipstick: ["lipstick", "lip balm", "lipbalm", "লিপস্টিক"],
  "লিপস্টিক": ["lipstick", "lip balm", "lipbalm", "লিপস্টিক"],

  // Bag / Purse / Wallet / ব্যাগ / ওয়ালেট
  bag: ["bag", "handbag", "purse", "wallet", "ব্যাগ", "ওয়ালেট"],
  handbag: ["bag", "handbag", "purse", "wallet", "ব্যাগ", "ওয়ালেট"],
  purse: ["bag", "handbag", "purse", "wallet", "ব্যাগ", "ওয়ালেট"],
  wallet: ["bag", "handbag", "purse", "wallet", "ব্যাগ", "ওয়ালেট"],
  "ব্যাগ": ["bag", "handbag", "purse", "wallet", "ব্যাগ", "ওয়ালেট"],
  "ওয়ালেট": ["bag", "handbag", "purse", "wallet", "ব্যাগ", "ওয়ালেট"],

  // Panjabi / Punjabi /  পাঞ্জাবি
  panjabi: ["panjabi", "punjabi", "পাঞ্জাবি", "পাঞ্জাবী"],
  punjabi: ["panjabi", "punjabi", "পাঞ্জাবি", "পাঞ্জাবী"],
  "পাঞ্জাবি": ["panjabi", "punjabi", "পাঞ্জাবি", "পাঞ্জাবী"],
  "পাঞ্জাবী": ["panjabi", "punjabi", "পাঞ্জাবি", "পাঞ্জাবী"],

  // Dress / Kapor / Jama / ড্রেস / জামা / পোশাক
  dress: ["dress", "jama", "kapor", "ড্রেস", "জামা", "পোশাক"],
  jama: ["dress", "jama", "kapor", "ড্রেস", "জামা", "পোশাক"],
  kapor: ["dress", "jama", "kapor", "ড্রেস", "জামা", "পোশাক"],
  "ড্রেস": ["dress", "jama", "kapor", "ড্রেস", "জামা", "পোশাক"],
  "জামা": ["dress", "jama", "kapor", "ড্রেস", "জামা", "পোশাক"],
  "পোশাক": ["dress", "jama", "kapor", "ড্রেস", "জামা", "পোশাক"],

  // Perfume / Attar / পারফিউম / আতর
  perfume: ["perfume", "attar", "fragrance", "পারফিউম", "আতর"],
  attar: ["perfume", "attar", "fragrance", "পারফিউম", "আতর"],
  fragrance: ["perfume", "attar", "fragrance", "পারফিউম", "আতর"],
  "পারফিউম": ["perfume", "attar", "fragrance", "পারফিউম", "আতর"],
  "আতর": ["perfume", "attar", "fragrance", "পারফিউম", "আতর"],

  // Cream / Lotion / Skincare / ক্রিম / লোশন
  cream: ["cream", "lotion", "skincare", "ক্রিম", "লোশন"],
  lotion: ["cream", "lotion", "skincare", "ক্রিম", "লোশন"],
  skincare: ["cream", "lotion", "skincare", "ক্রিম", "লোশন"],
  "ক্রিম": ["cream", "lotion", "skincare", "ক্রিম", "লোশন"],
  "লোশন": ["cream", "lotion", "skincare", "ক্রিম", "লোশন"],

  // Shoe / Juta / জুতা
  shoe: ["shoe", "shoes", "juta", "জুতা", "জুতো"],
  shoes: ["shoe", "shoes", "juta", "জুতা", "জুতো"],
  juta: ["shoe", "shoes", "juta", "জুতা", "জুতো"],
  "জুতা": ["shoe", "shoes", "juta", "জুতা", "জুতো"],

  // Hijab / Abaya / হিজাব / আবায়া
  hijab: ["hijab", "borka", "burqa", "abaya", "হিজাব", "বোরকা"],
  borka: ["hijab", "borka", "burqa", "abaya", "হিজাব", "বোরকা"],
  "হিজাব": ["hijab", "borka", "burqa", "abaya", "হিজাব", "বোরকা"],
  "বোরকা": ["hijab", "borka", "burqa", "abaya", "হিজাব", "বোরকা"],
};

/**
 * Given a raw search input string (e.g. "shari", "ghori", "3piece", "ঘড়ি"),
 * returns an array of unique expanded search terms in Bangla, English, and Banglish.
 */
export function getExpandedSearchTerms(query: string): string[] {
  if (!query || !query.trim()) return [];

  const raw = query.toLowerCase().trim();
  const cleanKey = raw.replace(/[-_]/g, "");

  const terms = new Set<string>();
  terms.add(raw);

  // Check exact key match
  if (SYNONYM_MAP[raw]) {
    SYNONYM_MAP[raw].forEach((t) => terms.add(t));
  }
  if (SYNONYM_MAP[cleanKey]) {
    SYNONYM_MAP[cleanKey].forEach((t) => terms.add(t));
  }

  // Check partial key matches
  Object.keys(SYNONYM_MAP).forEach((key) => {
    if (raw.includes(key) || key.includes(raw)) {
      SYNONYM_MAP[key].forEach((t) => terms.add(t));
    }
  });

  return Array.from(terms);
}

/**
 * Checks if a product matches the query in Bangla, English, or Banglish.
 */
export function matchesMultilingualQuery(product: any, query: string): boolean {
  if (!query || !query.trim()) return true;

  const searchTerms = getExpandedSearchTerms(query);
  const targetText = [
    product.name || "",
    product.description || "",
    product.tags || "",
    product.category?.name || "",
    product.category?.slug || "",
    product.brand?.name || "",
    product.sku || "",
  ]
    .join(" ")
    .toLowerCase();

  return searchTerms.some((term) => targetText.includes(term.toLowerCase()));
}
