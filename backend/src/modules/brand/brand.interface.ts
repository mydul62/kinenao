export interface IBrandCreateInput {
  name: string;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface IBrandUpdateInput {
  name?: string;
  logoUrl?: string | null;
  isActive?: boolean;
}
