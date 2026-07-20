import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError } from "../../app/errors/AppError";
import { ICategoryCreateInput, ICategoryUpdateInput } from "./category.interface";

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const dbCreateCategory = async (input: ICategoryCreateInput) => {
  const { name, parentId } = input;

  let slug = generateSlug(name);
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
      parentId: parentId || null,
    },
  });
};

export const dbGetCategories = async (type?: string) => {
  const categories = await prisma.category.findMany();

  if (type === "tree") {
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

export const dbGetCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parentCategory: true,
      childCategories: true,
    },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};

export const dbUpdateCategory = async (id: string, input: ICategoryUpdateInput) => {
  const { name, parentId } = input;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const data: any = {};
  if (name) {
    data.name = name;
    let slug = generateSlug(name);
    const existingSlug = await prisma.category.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    data.slug = slug;
  }

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
    throw new BadRequestError("Cannot delete category containing subcategories");
  }

  const hasProducts = await prisma.product.findFirst({ where: { categoryId: id } });
  if (hasProducts) {
    throw new BadRequestError("Cannot delete category containing associated products");
  }

  return prisma.category.delete({ where: { id } });
};
