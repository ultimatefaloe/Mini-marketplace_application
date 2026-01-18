export enum AppRolesEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export type AppRoles = keyof typeof AppRolesEnum | AppRolesEnum;
