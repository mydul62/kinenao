export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CUSTOMER: "CUSTOMER",
} as const;

export type TUserRoles = keyof typeof USER_ROLES;
