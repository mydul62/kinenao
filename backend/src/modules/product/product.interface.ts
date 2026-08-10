export interface IVariantInput {
  id?: string;
  name: string;
  combination?: Record<string, string> | any;
  colorName?: string | null;
  colorCode?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  stockQty?: number;
  size?: string | null;
  weight?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface IProductCreateInput {
  name: string;
  sku: string;
  barcode?: string | null;
  description: string;
  categoryId: string;
  brandId?: string | null;
  price: number;
  discountPrice?: number | null;
  weight?: number | null;
  unit?: string | null;
  stockQty?: number;
  tags?: string | null;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
  customBadge?: string | null;
  promotionalBadges?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive?: boolean;
  images?: string[];
  thumbnail?: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  attributes?: any;
  variants?: IVariantInput[];
}

export interface IProductUpdateInput extends Partial<IProductCreateInput> {}

export interface IProductQuery {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string;
  discounted?: string;
  isFeatured?: string;
  isBestSeller?: string;
  isFlashSale?: string;
  hasVideo?: string;
  hasVariants?: string;
  stock?: string;
  status?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}
