import { SetMetadata } from '@nestjs/common';
import { AppRoles } from 'src/type/role';

export const Roles = (...roles: AppRoles[]) => SetMetadata('roles', roles);