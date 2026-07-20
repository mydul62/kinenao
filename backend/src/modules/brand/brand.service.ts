import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError } from "../../app/errors/AppError";
import { IBrandCreateInput, IBrandUpdateInput } from "./brand.interface";

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const dbCreateBrand = async (input: IBrandCreateInput) => {
  const { name, logoUrl, isActive } = input;

  let slug = generateSlug(name);
  const existingBrand = await prisma.brand.findUnique({ where: { slug } });
  if (existingBrand) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  return prisma.brand.create({
    data: {
      name,
      slug,
      logoUrl: logoUrl || null,
      isActive: isActive !== undefined ? isActive : true,
    },
  });
};

export const dbGetBrands = async (activeOnly?: string) => {
  const filter: any = {};
  if (activeOnly === "true") {
    filter.isActive = true;
  }

  return prisma.brand.findMany({
    where: filter,
    orderBy: { name: "asc" },
  });
};

export const dbGetBrandById = async (id: string) => {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    throw new NotFoundError("Brand not found");
  }
  return brand;
};

export const dbUpdateBrand = async (id: string, input: IBrandUpdateInput) => {
  const { name, logoUrl, isActive } = input;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    throw new NotFoundError("Brand not found");
  }

  const data: any = {};
  if (name) {
    data.name = name;
    let slug = generateSlug(name);
    const existingSlug = await prisma.brand.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    data.slug = slug;
  }

  if (logoUrl !== undefined) data.logoUrl = logoUrl;
  if (isActive !== undefined) data.isActive = isActive;

  return prisma.brand.update({
    where: { id },
    data,
  });
};

export const dbDeleteBrand = async (id: string) => {
  const hasProducts = await prisma.product.findFirst({ where: { brandId: id } });
  if (hasProducts) {
    throw new BadRequestError("Cannot delete brand as it is associated with products");
  }

  return prisma.brand.delete({ where: { id } });
};
