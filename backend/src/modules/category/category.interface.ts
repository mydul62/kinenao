export interface ICategoryCreateInput {
  name: string;
  parentId?: string | null;
}

export interface ICategoryUpdateInput {
  name?: string;
  parentId?: string | null;
}
