import { SetMetadata } from '@nestjs/common';
import { AppRole } from 'src/type';

export const ROLES_KEY = 'app:roles';

export const Roles = (...roles: AppRole[]) =>
  SetMetadata(ROLES_KEY, roles);
