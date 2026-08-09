"use server";

import { revalidateTag } from "next/cache";

const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

/**
 * Generic Server-Side Fetch Wrapper with Caching & Error Handling
 */
async function serverFetch<T>(
  endpoint: string,
  options?: {
    tags?: string[];
    revalidate?: number | false;
    cache?: RequestCache;
  }
): Promise<T | null> {
  const url = `${BASE_API}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (options?.tags || options?.revalidate !== undefined) {
      fetchOptions.next = {
        ...(options.tags ? { tags: options.tags } : {}),
        ...(options.revalidate !== undefined ? { revalidate: options.revalidate } : { revalidate: 60 }),
      };
    } else if (options?.cache) {
      fetchOptions.cache = options.cache;
    } else {
      // Default: cache for 60s with ISR
      fetchOptions.next = { revalidate: 60 };
    }

    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      console.error(`[ServerFetch] ${url} failed with status: ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error(`[ServerFetch Error] ${url}:`, error);
    return null;
  }
}

// -------------------------------------------------------------
// 1. Categories Server API
// -------------------------------------------------------------

export async function getAllCategoriesTree() {
  const data = await serverFetch<{ categories: any[] }>("/categories?type=tree", {
    tags: ["categories"],
    revalidate: 60,
  });
  return data?.categories || [];
}

export async function getCategoryBySlug(slug: string) {
  if (!slug) return null;
  
  // Try slug endpoint first
  const data = await serverFetch<{ category: any }>(`/categories/slug/${encodeURIComponent(slug)}`, {
    tags: ["categories", `category-${slug}`],
    revalidate: 60,
  });

  if (data?.category) return data.category;

  // Fallback to id endpoint
  const dataById = await serverFetch<{ category: any }>(`/categories/${encodeURIComponent(slug)}`, {
    tags: ["categories", `category-${slug}`],
    revalidate: 60,
  });

  return dataById?.category || null;
}

// -------------------------------------------------------------
// 2. Products Server API
// -------------------------------------------------------------

export interface GetProductsParams {
  categoryId?: string;
  search?: string;
  sortBy?: string;
  page?: number | string;
  limit?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  availability?: string;
}

export async function getProducts(params?: GetProductsParams) {
  const query = new URLSearchParams();

  if (params?.search) query.append("search", params.search);
  if (params?.categoryId) query.append("categoryId", params.categoryId);
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.minPrice) query.append("minPrice", params.minPrice.toString());
  if (params?.maxPrice) query.append("maxPrice", params.maxPrice.toString());
  if (params?.availability) query.append("availability", params.availability);

  const queryString = query.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

  const tags = ["products"];
  if (params?.categoryId) tags.push(`category-products-${params.categoryId}`);

  const data = await serverFetch<{ products: any[]; pagination: any }>(endpoint, {
    tags,
    revalidate: 30, // Fresh product listings
  });

  return {
    products: data?.products || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 },
  };
}

export async function getProductBySlugOrId(idOrSlug: string) {
  if (!idOrSlug) return null;

  // Try by slug
  const data = await serverFetch<{ product: any }>(`/products/slug/${encodeURIComponent(idOrSlug)}`, {
    tags: ["products", `product-${idOrSlug}`],
    revalidate: 30,
  });

  if (data?.product) return data.product;

  // Fallback to id
  const dataById = await serverFetch<{ product: any }>(`/products/${encodeURIComponent(idOrSlug)}`, {
    tags: ["products", `product-${idOrSlug}`],
    revalidate: 30,
  });

  return dataById?.product || null;
}

// -------------------------------------------------------------
// 3. Home & Marketing Server API
// -------------------------------------------------------------

export async function getAllBanners() {
  const data = await serverFetch<{ banners: any[] }>("/banners", {
    tags: ["banners"],
    revalidate: 120,
  });
  return data?.banners || [];
}

export async function getAllFaqs() {
  const data = await serverFetch<{ faqs: any[] }>("/faqs", {
    tags: ["faqs"],
    revalidate: 120,
  });
  return data?.faqs || [];
}

export async function getAllTestimonials() {
  const data = await serverFetch<{ testimonials: any[] }>("/testimonials", {
    tags: ["testimonials"],
    revalidate: 120,
  });
  return data?.testimonials || [];
}

export async function getAllBrands() {
  const data = await serverFetch<{ brands: any[] }>("/brands", {
    tags: ["brands"],
    revalidate: 120,
  });
  return data?.brands || [];
}

export async function getWebsiteSettings() {
  const data = await serverFetch<{ settings: any }>("/settings", {
    tags: ["settings"],
    revalidate: 120,
  });
  return data?.settings || {};
}

// -------------------------------------------------------------
// 4. Cache Revalidation Server Action
// -------------------------------------------------------------

export async function revalidateTagAction(tag: string) {
  try {
    revalidateTag(tag);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
