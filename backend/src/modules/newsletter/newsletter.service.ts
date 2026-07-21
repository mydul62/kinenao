import { prisma } from "../../app/config/db";
import { ConflictError } from "../../app/errors/AppError";
import { INewsletterSubscribeInput } from "./newsletter.interface";

export const subscribeEmail = async (input: INewsletterSubscribeInput) => {
  const { email } = input;

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError("Email is already subscribed to our newsletter");
  }

  return prisma.newsletterSubscriber.create({
    data: { email },
  });
};

export const getSubscribers = async () => {
  return prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const unsubscribeEmail = async (id: string) => {
  return prisma.newsletterSubscriber.delete({
    where: { id },
  });
};
