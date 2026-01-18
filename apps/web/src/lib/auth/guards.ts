import { redirect } from 'next/navigation';
import { resolveServerAuth } from '@/lib/server/auth0-server';
import { AppRole, ADMIN_ROLES } from './roles';

export function isAdminRole(  
  role: AppRole | null
): role is AppRole.ADMIN | AppRole.SUPERADMIN {
  return !!role && ADMIN_ROLES.includes(role);
}

export async function requireAdmin() {
  const ctx = await resolveServerAuth();

  if (!ctx.user) redirect('/api/auth/login');
  if (!isAdminRole(ctx.role)) redirect('/dashboard');

  return ctx;
}

export async function requireUser() {
  const ctx = await resolveServerAuth();

  if (!ctx.user) redirect('/api/auth/login');
  if (isAdminRole(ctx.role)) redirect('/admin/dashboard');

  return ctx;
}


