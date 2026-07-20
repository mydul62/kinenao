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
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive?: boolean;
  images?: string[];
  thumbnail?: string | null;
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
  sortBy?: string;
  page?: string;
  limit?: string;
}
