import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError } from "../../app/errors/AppError";
import { ICategoryCreateInput, ICategoryUpdateInput } from "./category.interface";

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const dbCreateCategory = async (input: ICategoryCreateInput) => {
  const { name, slug: customSlug, imageUrl, description, isActive, sortOrder, isFeatured, parentId } = input;

  let slug = customSlug ? generateSlug(customSlug) : generateSlug(name);
  if (!slug) slug = `cat-${Date.now().toString().slice(-6)}`;

  const existingCategory = await prisma.category.findUnique({ where: { slug } });
  if (existingCategory) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  if (parentId) {
    const parentExists = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parentExists) {
      throw new NotFoundError("Parent category not found");
    }
  }

  return prisma.category.create({
    data: {
      name,
      slug,
      imageUrl: imageUrl || null,
      description: description || null,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder !== undefined ? sortOrder : 0,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      parentId: parentId || null,
    },
  });
};

export const dbGetCategories = async (queryType?: string, includeInactive: boolean = false) => {
  const whereClause: any = {};
  if (!includeInactive) {
    whereClause.isActive = true;
  }

  const categories = await prisma.category.findMany({
    where: whereClause,
    include: {
      parentCategory: {
        select: { id: true, name: true, slug: true },
      },
      childCategories: {
        select: { id: true, name: true, slug: true, imageUrl: true, isActive: true },
      },
      _count: {
        select: { products: true, childCategories: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  if (queryType === "tree") {
    const buildTree = (parentId: string | null = null): any[] => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };
    return buildTree(null);
  }

  return categories;
};

export const dbGetCategoryByIdOrSlug = async (identifier: string) => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      parentCategory: true,
      childCategories: {
        include: {
          _count: { select: { products: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};

export const dbUpdateCategory = async (id: string, input: ICategoryUpdateInput) => {
  const { name, slug: customSlug, imageUrl, description, isActive, sortOrder, isFeatured, parentId } = input;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const data: any = {};
  if (name) {
    data.name = name;
    let slug = customSlug ? generateSlug(customSlug) : generateSlug(name);
    const existingSlug = await prisma.category.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    data.slug = slug;
  } else if (customSlug) {
    data.slug = generateSlug(customSlug);
  }

  if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
  if (description !== undefined) data.description = description || null;
  if (isActive !== undefined) data.isActive = isActive;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (isFeatured !== undefined) data.isFeatured = isFeatured;

  if (parentId !== undefined) {
    if (parentId === id) {
      throw new BadRequestError("Category cannot be its own parent");
    }
    if (parentId) {
      const parentExists = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        throw new NotFoundError("Parent category not found");
      }
    }
    data.parentId = parentId || null;
  }

  return prisma.category.update({
    where: { id },
    data,
  });
};

export const dbDeleteCategory = async (id: string) => {
  const hasChildren = await prisma.category.findFirst({ where: { parentId: id } });
  if (hasChildren) {
    throw new BadRequestError("Cannot delete category that contains subcategories. Please reassign or delete children first.");
  }

  const hasProducts = await prisma.product.findFirst({ where: { categoryId: id } });
  if (hasProducts) {
    throw new BadRequestError("Cannot delete category containing associated products. Please reassign products first.");
  }

  return prisma.category.delete({ where: { id } });
};
