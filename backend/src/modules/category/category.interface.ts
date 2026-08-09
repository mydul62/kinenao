export interface ICategoryCreateInput {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  parentId?: string | null;
}

export interface ICategoryUpdateInput {
  name?: string;
  slug?: string;
  imageUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  parentId?: string | null;
}
