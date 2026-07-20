import { Role } from "@prisma/client";

export interface IRegisterInput {
  email: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface ILoginInput {
  email: string;
  password?: string;
}

export interface ITokenUser {
  userId: string;
  role: Role;
  email: string;
}
