import * as bcrypt from "bcryptjs";
import { prisma } from "../../app/config/db";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
  verifyResetToken,
} from "../../app/helpers/jwt";
import { sendPasswordResetEmail } from "../../app/helpers/email";
import { BadRequestError, ConflictError, UnauthorizedError } from "../../app/errors/AppError";
import { Role } from "@prisma/client";
import { IRegisterInput, ILoginInput, ITokenUser } from "./auth.interface";

export const registerUser = async (input: IRegisterInput) => {
  const { email, password, fullName, phoneNumber } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password!, salt);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: Role.CUSTOMER,
      profile: {
        create: {
          fullName,
          phoneNumber,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const tokenPayload: ITokenUser = { userId: newUser.id, role: newUser.role, email: newUser.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      profile: newUser.profile,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (input: ILoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password!, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const tokenPayload: ITokenUser = { userId: user.id, role: user.role, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (token: string) => {
  const decoded = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    throw new UnauthorizedError("Invalid refresh token user");
  }

  const tokenPayload: ITokenUser = { userId: user.id, role: user.role, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);

  return { accessToken };
};

export const sendForgotPasswordLink = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // For security, don't throw, just return success
    return { message: "If a matching email exists, a password reset link has been sent." };
  }

  const resetToken = generateResetToken({ userId: user.id, email: user.email });
  await sendPasswordResetEmail(user.email, resetToken);

  return { message: "Password reset link sent to email" };
};

export const resetUserPassword = async (password: string, token: string) => {
  const decoded = verifyResetToken(token);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword },
  });

  return { message: "Password reset successful. You can now login." };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        include: {
          addresses: true,
        },
      },
    },
  });

  if (!user) {
    throw new BadRequestError("User not found");
  }

  return user;
};
