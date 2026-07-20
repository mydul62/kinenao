import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError } from "../../app/errors/AppError";
import { IProductCreateInput, IProductUpdateInput, IProductQuery } from "./product.interface";

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

async function getCategoryChildrenIds(categoryId: string): Promise<string[]> {
  const ids: string[] = [categoryId];
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
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
    seoTitle,
    seoDescription,
    isActive,
    images,
    thumbnail,
  } = input;

  let slug = generateSlug(name);
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

  return prisma.product.create({
    data: {
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
      thumbnail: thumbnail || null,
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
    sortBy,
    page = "1",
    limit = "10",
  } = query;

  const queryFilters: any[] = [{ isActive: true }];

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
          AND: [
            { discountPrice: null },
            { price: { gte: min, lte: max } }
          ]
        },
        {
          AND: [
            { discountPrice: { not: null } },
            { discountPrice: { gte: min, lte: max } }
          ]
        }
      ]
    });
  }

  if (availability === "in-stock") {
    queryFilters.push({
      stockQty: { gt: prisma.product.fields.reservedStockQty },
    });
  } else if (availability === "out-of-stock") {
    queryFilters.push({
      stockQty: { lte: prisma.product.fields.reservedStockQty },
    });
  }

  if (discounted === "true") {
    queryFilters.push({ discountPrice: { not: null } });
  }
  if (isFeatured === "true") {
    queryFilters.push({ isFeatured: true });
  }
  if (isBestSeller === "true") {
    queryFilters.push({ isBestSeller: true });
  }
  if (isFlashSale === "true") {
    queryFilters.push({ isFlashSale: true });
  }

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sortBy === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sortBy === "name_asc") {
    orderBy = { name: "asc" };
  } else if (sortBy === "name_desc") {
    orderBy = { name: "desc" };
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  const where = { AND: queryFilters };

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
      orderBy,
      skip: skipNum,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
  };
};

export const dbGetAdminProducts = async (query: { search?: string; categoryId?: string; page?: string; limit?: string }) => {
  const { search, categoryId, page = "1", limit = "10" } = query;

  const queryFilters: any[] = [];
  if (search) {
    queryFilters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (categoryId) {
    queryFilters.push({ categoryId });
  }

  const where = queryFilters.length > 0 ? { AND: queryFilters } : {};

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: skipNum,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
  };
};

export const dbGetProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      reviews: {
        where: { isApproved: true },
        include: {
          customer: {
            select: {
              id: true,
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
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      reviews: {
        where: { isApproved: true },
        include: {
          customer: {
            select: {
              id: true,
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

export const dbUpdateProduct = async (id: string, input: IProductUpdateInput) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
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
    seoTitle,
    seoDescription,
    isActive,
    images,
    thumbnail,
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

  if (sku) {
    const existingSku = await prisma.product.findFirst({
      where: { sku, id: { not: id } },
    });
    if (existingSku) {
      throw new BadRequestError(`Product with SKU "${sku}" already exists`);
    }
    data.sku = sku;
  }

  if (categoryId) {
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
    }
    data.brandId = brandId || null;
  }

  if (barcode !== undefined) data.barcode = barcode;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = price;
  if (discountPrice !== undefined) data.discountPrice = discountPrice;
  if (weight !== undefined) data.weight = weight;
  if (unit !== undefined) data.unit = unit;
  if (stockQty !== undefined) data.stockQty = stockQty;
  if (tags !== undefined) data.tags = tags;
  if (isFeatured !== undefined) data.isFeatured = isFeatured;
  if (isBestSeller !== undefined) data.isBestSeller = isBestSeller;
  if (isFlashSale !== undefined) data.isFlashSale = isFlashSale;
  if (seoTitle !== undefined) data.seoTitle = seoTitle;
  if (seoDescription !== undefined) data.seoDescription = seoDescription;
  if (isActive !== undefined) data.isActive = isActive;
  if (images !== undefined) data.images = images;
  if (thumbnail !== undefined) data.thumbnail = thumbnail;

  return prisma.product.update({
    where: { id },
    data,
  });
};

export const dbDeleteProduct = async (id: string) => {
  const hasOrders = await prisma.orderItem.findFirst({ where: { productId: id } });
  if (hasOrders) {
    throw new BadRequestError("Cannot delete product since it is referenced in orders");
  }

  return prisma.product.delete({ where: { id } });
};

export const dbGetInventoryStats = async (page: string, limit: string) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stockQty: true,
        reservedStockQty: true,
        soldQty: true,
        isActive: true,
      },
      orderBy: { stockQty: "asc" },
      skip: skipNum,
      take: limitNum,
    }),
    prisma.product.count(),
  ]);

  const items = products.map((prod) => {
    const available = prod.stockQty - prod.reservedStockQty;
    return {
      ...prod,
      availableStock: available >= 0 ? available : 0,
      isLowStock: prod.stockQty <= 10,
      isOutOfStock: prod.stockQty === 0,
    };
  });

  return {
    inventory: items,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
  };
};
