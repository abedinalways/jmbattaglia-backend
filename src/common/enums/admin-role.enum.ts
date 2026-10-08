export const AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
} as const;

export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];
