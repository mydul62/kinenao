import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError } from "../../app/errors/AppError";
import { IProductCreateInput, IProductUpdateInput, IProductQuery } from "./product.interface";

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

async function getCategoryChildrenIds(categoryIdOrSlug: string): Promise<string[]> {
  if (!categoryIdOrSlug) return [];

  // Resolve to real category record (slug or id)
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: categoryIdOrSlug },
        { slug: categoryIdOrSlug },
      ],
    },
    select: { id: true },
  });

  if (!category) return [categoryIdOrSlug];

  const ids: string[] = [category.id];
  const children = await prisma.category.findMany({
    where: { parentId: category.id },
    select: { id: true },
  });

  for (const child of children) {
    const childIds = await getCategoryChildrenIds(child.id);
    ids.push(...childIds);
  }
  return ids;
}

export const dbCreateProduct = async (input: IProductCreateInput) => {
  const {
    name,
    sku,
    barcode,
    description,
    categoryId,
    brandId,
    price,
    discountPrice,
    weight,
    unit,
    stockQty,
    tags,
    isFeatured,
    isBestSeller,
    isFlashSale,
    customBadge,
    promotionalBadges,
    seoTitle,
    seoDescription,
    isActive,
    images,
    thumbnail,
    videoUrl,
    videoPosterUrl,
    variants,
  } = input;

  let slug = generateSlug(name);
  if (!slug) slug = `product-${Date.now().toString().slice(-6)}`;
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const existingSku = await prisma.product.findUnique({ where: { sku } });
  if (existingSku) {
    throw new BadRequestError(`Product with SKU "${sku}" already exists`);
  }

  const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!categoryExists) {
    throw new NotFoundError("Category not found");
  }

  if (brandId) {
    const brandExists = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brandExists) {
      throw new NotFoundError("Brand not found");
    }
  }

  const data: any = {
    name,
    slug,
    sku,
    barcode: barcode || null,
    description,
    categoryId,
    brandId: brandId || null,
    price,
    discountPrice: discountPrice || null,
    weight: weight || null,
    unit: unit || null,
    stockQty: stockQty !== undefined ? stockQty : 0,
    tags: tags || null,
    isFeatured: isFeatured !== undefined ? isFeatured : false,
    isBestSeller: isBestSeller !== undefined ? isBestSeller : false,
    isFlashSale: isFlashSale !== undefined ? isFlashSale : false,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    isActive: isActive !== undefined ? isActive : true,
    images: images || [],
    thumbnail: thumbnail || (images && images.length > 0 ? images[0] : null),
    videoUrl: videoUrl || null,
    videoPosterUrl: videoPosterUrl || null,
  };

  if (customBadge !== undefined) data.customBadge = customBadge || null;
  if (promotionalBadges !== undefined) data.promotionalBadges = promotionalBadges || [];

  if (variants && Array.isArray(variants) && variants.length > 0) {
    data.variants = {
      create: variants.map((v, idx) => ({
        name: v.name,
        colorName: v.colorName || null,
        colorCode: v.colorCode || null,
        imageUrl: v.imageUrl || null,
        sku: v.sku || `${sku}-${idx + 1}`,
        price: v.price !== undefined && v.price !== null ? v.price : null,
        discountPrice: v.discountPrice !== undefined && v.discountPrice !== null ? v.discountPrice : null,
        stockQty: v.stockQty !== undefined ? v.stockQty : 0,
        size: v.size || null,
        isActive: v.isActive !== undefined ? v.isActive : true,
        sortOrder: v.sortOrder !== undefined ? v.sortOrder : idx,
      })),
    };
  }

  return prisma.product.create({
    data,
    include: {
      category: true,
      brand: true,
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
};

export const dbGetProducts = async (query: IProductQuery) => {
  const {
    search,
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    availability,
    discounted,
    isFeatured,
    isBestSeller,
    isFlashSale,
    hasVideo,
    hasVariants,
    stock,
    status,
    sortBy,
    page = "1",
    limit = "12",
  } = query;

  const queryFilters: any[] = [];

  if (status === "active") {
    queryFilters.push({ isActive: true });
  } else if (status === "inactive") {
    queryFilters.push({ isActive: false });
  } else if (!status) {
    queryFilters.push({ isActive: true });
  }

  if (search) {
    queryFilters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (categoryId) {
    const categoryIds = await getCategoryChildrenIds(categoryId);
    queryFilters.push({ categoryId: { in: categoryIds } });
  }

  if (brandId) {
    queryFilters.push({ brandId });
  }

  if (minPrice || maxPrice) {
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;

    queryFilters.push({
      OR: [
        {
          discountPrice: { not: null, gte: min, lte: max === Infinity ? undefined : max },
        },
        {
          discountPrice: null,
          price: { gte: min, lte: max === Infinity ? undefined : max },
        },
      ],
    });
  }

  if (availability === "in-stock") {
    queryFilters.push({ stockQty: { gt: 0 } });
  } else if (availability === "out-of-stock") {
    queryFilters.push({ stockQty: { lte: 0 } });
  }

  if (stock === "low") {
    queryFilters.push({ stockQty: { gt: 0, lte: 5 } });
  } else if (stock === "out") {
    queryFilters.push({ stockQty: { lte: 0 } });
  }

  if (discounted === "true") {
    queryFilters.push({ discountPrice: { not: null } });
  }

  if (isFeatured === "true") queryFilters.push({ isFeatured: true });
  if (isBestSeller === "true") queryFilters.push({ isBestSeller: true });
  if (isFlashSale === "true") queryFilters.push({ isFlashSale: true });

  if (hasVideo === "true") {
    queryFilters.push({ videoUrl: { not: null } });
  }

  if (hasVariants === "true") {
    queryFilters.push({
      variants: {
        some: {},
      },
    });
  }

  const where = queryFilters.length > 0 ? { AND: queryFilters } : {};

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "price_asc") orderBy = { price: "asc" };
  if (sortBy === "price_desc") orderBy = { price: "desc" };
  if (sortBy === "name_asc") orderBy = { name: "asc" };
  if (sortBy === "name_desc") orderBy = { name: "desc" };
  if (sortBy === "bestseller") orderBy = [{ isBestSeller: "desc" }, { soldQty: "desc" }];
  if (sortBy === "popular") orderBy = { soldQty: "desc" };
  if (sortBy === "oldest") orderBy = { createdAt: "asc" };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, logoUrl: true },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const dbGetAdminProducts = async (query: IProductQuery) => {
  const { search, categoryId, brandId, page = "1", limit = "15" } = query;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (brandId) {
    where.brandId = brandId;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 15;
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const dbGetProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        include: {
          parentCategory: true,
        },
      },
      brand: true,
      variants: {
        orderBy: { sortOrder: "asc" },
      },
      reviews: {
        where: { isApproved: true },
        include: {
          customer: {
            select: {
              profile: {
                select: { fullName: true, avatarUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

export const dbGetProductBySlug = async (slug: string) => {
  let product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        include: {
          parentCategory: true,
        },
      },
      brand: true,
      variants: {
        orderBy: { sortOrder: "asc" },
      },
      reviews: {
        where: { isApproved: true },
        include: {
          customer: {
            select: {
              profile: {
                select: { fullName: true, avatarUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Resilient Fallback: If slug contains old timestamp suffix (e.g. party-georgette-sari-2-0182), resolve it
  if (!product) {
    const cleanSlug = slug.replace(/-[0-9]{3,6}$/, "");
    product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: cleanSlug },
          { slug: { startsWith: cleanSlug } },
          { slug: { contains: cleanSlug, mode: "insensitive" } },
        ],
      },
      include: {
        category: {
          include: {
            parentCategory: true,
          },
        },
        brand: true,
        variants: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            customer: {
              select: {
                profile: {
                  select: { fullName: true, avatarUrl: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

export const dbUpdateProduct = async (id: string, input: IProductUpdateInput) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!existingProduct) {
    throw new NotFoundError("Product not found");
  }

  const {
    name,
    sku,
    barcode,
    description,
    categoryId,
    brandId,
    price,
    discountPrice,
    weight,
    unit,
    stockQty,
    tags,
    isFeatured,
    isBestSeller,
    isFlashSale,
    customBadge,
    promotionalBadges,
    seoTitle,
    seoDescription,
    isActive,
    images,
    thumbnail,
    videoUrl,
    videoPosterUrl,
    variants,
  } = input;

  const data: any = {};

  if (name) {
    data.name = name;
    let slug = generateSlug(name);
    const existingSlug = await prisma.product.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    data.slug = slug;
  }

  if (sku && sku !== existingProduct.sku) {
    const existingSku = await prisma.product.findFirst({
      where: { sku, id: { not: id } },
    });
    if (existingSku) {
      throw new BadRequestError(`Product with SKU "${sku}" already exists`);
    }
    data.sku = sku;
  }

  if (barcode !== undefined) data.barcode = barcode || null;
  if (description !== undefined) data.description = description;

  if (categoryId && categoryId !== existingProduct.categoryId) {
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      throw new NotFoundError("Category not found");
    }
    data.categoryId = categoryId;
  }

  if (brandId !== undefined) {
    if (brandId) {
      const brandExists = await prisma.brand.findUnique({ where: { id: brandId } });
      if (!brandExists) {
        throw new NotFoundError("Brand not found");
      }
      data.brandId = brandId;
    } else {
      data.brandId = null;
    }
  }

  if (price !== undefined) data.price = price;
  if (discountPrice !== undefined) data.discountPrice = discountPrice || null;
  if (weight !== undefined) data.weight = weight || null;
  if (unit !== undefined) data.unit = unit || null;
  if (stockQty !== undefined) data.stockQty = stockQty;
  if (tags !== undefined) data.tags = tags || null;
  if (isFeatured !== undefined) data.isFeatured = isFeatured;
  if (isBestSeller !== undefined) data.isBestSeller = isBestSeller;
  if (isFlashSale !== undefined) data.isFlashSale = isFlashSale;
  if (customBadge !== undefined) data.customBadge = customBadge || null;
  if (promotionalBadges !== undefined) data.promotionalBadges = promotionalBadges || [];
  if (seoTitle !== undefined) data.seoTitle = seoTitle || null;
  if (seoDescription !== undefined) data.seoDescription = seoDescription || null;
  if (isActive !== undefined) data.isActive = isActive;
  if (images !== undefined) data.images = images || [];
  if (thumbnail !== undefined) data.thumbnail = thumbnail || null;
  if (videoUrl !== undefined) data.videoUrl = videoUrl || null;
  if (videoPosterUrl !== undefined) data.videoPosterUrl = videoPosterUrl || null;

  // Transaction for updating product + variants
  return prisma.$transaction(async (tx) => {
    if (variants && Array.isArray(variants)) {
      // Delete previous variants
      await tx.productVariant.deleteMany({ where: { productId: id } });

      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v, idx) => ({
            productId: id,
            name: v.name,
            colorName: v.colorName || null,
            colorCode: v.colorCode || null,
            imageUrl: v.imageUrl || null,
            sku: v.sku || `${existingProduct.sku}-${idx + 1}`,
            price: v.price !== undefined && v.price !== null ? v.price : null,
            discountPrice: v.discountPrice !== undefined && v.discountPrice !== null ? v.discountPrice : null,
            stockQty: v.stockQty !== undefined ? v.stockQty : 0,
            size: v.size || null,
            isActive: v.isActive !== undefined ? v.isActive : true,
            sortOrder: v.sortOrder !== undefined ? v.sortOrder : idx,
          })),
        });
      }
    }

    return tx.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        variants: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  });
};

export const dbDeleteProduct = async (id: string) => {
  const hasOrderItems = await prisma.orderItem.findFirst({ where: { productId: id } });
  if (hasOrderItems) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  return prisma.product.delete({ where: { id } });
};

export const dbGetInventoryStats = async (page: string = "1", limit: string = "10") => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [products, total, lowStockCount, outOfStockCount] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        variants: true,
      },
      orderBy: { stockQty: "asc" },
      skip,
      take: limitNum,
    }),
    prisma.product.count(),
    prisma.product.count({ where: { stockQty: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { stockQty: { lte: 0 } } }),
  ]);

  return {
    products,
    metrics: {
      totalProducts: total,
      lowStockCount,
      outOfStockCount,
    },
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};
