import { prisma } from "../../app/config/db";

export const getSectionContent = async (sectionKey: string) => {
  const content = await prisma.homepageContent.findUnique({
    where: { sectionKey },
  });

  return content ? content.value : null;
};

export const updateSectionContent = async (sectionKey: string, value: any) => {
  return prisma.homepageContent.upsert({
    where: { sectionKey },
    update: { value },
    create: { sectionKey, value },
  });
};
