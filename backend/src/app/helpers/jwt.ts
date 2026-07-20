import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "access_secret";
const EXPIRES_IN = process.env.EXPIRES_IN || "1d";

const REFRESH_SECRET = process.env.REFRESH_TOEKN_SECRET || "refresh_secret";
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOEKN_EXPIRES_IN || "30d";

const RESET_SECRET = process.env.RESET_PASS_TOKEN || "reset_secret";
const RESET_EXPIRES_IN = process.env.RESET_PASS_TOKEN_EXPIRES_IN || "5m";

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN as any });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as any });
};

export const generateResetToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(payload, RESET_SECRET, { expiresIn: RESET_EXPIRES_IN as any });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};

export const verifyResetToken = (token: string): { userId: string; email: string } => {
  return jwt.verify(token, RESET_SECRET) as { userId: string; email: string };
};
