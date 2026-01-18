import { auth0 } from './auth0';
import { decodeJwt } from 'jose';
import { AppRole } from '@/lib/auth/roles';
import { createAdminFromAuth0, createUserFromAuth0 } from './createUserFromAuth0';

const audiwnceUrl = process.env.AUTH0_AUDIENCE;
const ROLE_NAMESPACE = `${audiwnceUrl}/roles`;

export interface ServerAuthContext {
  user: any | null;
  role: AppRole | null;
}

export async function resolveServerAuth(): Promise<ServerAuthContext> {
  const session = await auth0.getSession();

  if (!session?.user || !session.tokenSet?.idToken) {
    return { user: null, role: null };
  }

  const claims = decodeJwt(session.tokenSet.idToken);
  const roles = claims[ROLE_NAMESPACE];

  let role: AppRole | null = null;

  if (Array.isArray(roles)) {
    if (roles.includes(AppRole.SUPERADMIN)) role = AppRole.SUPERADMIN;
    else if (roles.includes(AppRole.ADMIN)) role = AppRole.ADMIN;
    else role = AppRole.USER;
  }

  const user =
    role === AppRole.ADMIN || role === AppRole.SUPERADMIN
      ? await createAdminFromAuth0(session.user, role)
      : await createUserFromAuth0(session.user);

  return { user, role };
}


