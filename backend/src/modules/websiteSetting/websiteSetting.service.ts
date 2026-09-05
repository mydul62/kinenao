import { prisma } from "../../app/config/db";

export const getSectionContent = async (sectionKey: string) => {
  const content = await prisma.homepageContent.findUnique({
    where: { sectionKey },
  });
  if (content) return content.value;

  const setting = await prisma.websiteSetting.findUnique({
    where: { key: sectionKey },
  });
  return setting ? setting.value : null;
};

export const updateSectionContent = async (sectionKey: string, value: any) => {
  const [hContent] = await Promise.all([
    prisma.homepageContent.upsert({
      where: { sectionKey },
      update: { value },
      create: { sectionKey, value },
    }),
    prisma.websiteSetting.upsert({
      where: { key: sectionKey },
      update: { value },
      create: { key: sectionKey, value },
    }),
  ]);
  return hContent;
};

export const getAllSettings = async () => {
  const [contents, dbSettings] = await Promise.all([
    prisma.homepageContent.findMany(),
    prisma.websiteSetting.findMany(),
  ]);

  const settings: Record<string, any> = {};
  contents.forEach((item) => {
    settings[item.sectionKey] = item.value;
  });
  dbSettings.forEach((item) => {
    settings[item.key] = item.value;
  });

  return settings;
};
