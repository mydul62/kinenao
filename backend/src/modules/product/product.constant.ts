export const PRODUCT_FILTERS = {
  SEARCH: "search",
  CATEGORY: "categoryId",
  BRAND: "brandId",
  AVAILABILITY: "availability",
  DISCOUNTED: "discounted",
  FEATURED: "isFeatured",
  BEST_SELLER: "isBestSeller",
  FLASH_SALE: "isFlashSale",
} as const;

export const PRODUCT_SORT = {
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
  NEWEST: "newest",
} as const;
