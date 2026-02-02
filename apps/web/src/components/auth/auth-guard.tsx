import React from 'react'
import { Navigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/hooks'
import { UserRole } from '@/types'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  redirectTo?: string
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo,
}) => {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    const loginPath = location.pathname.startsWith('/admin')
      ? '/admin/login'
      : location.pathname.startsWith('/vendor')
        ? '/vendor/login'
        : '/login'
    return (
      <Navigate
        to={redirectTo || loginPath}
        // search={{
        //   redirect: location?.pathname ?? undefined,
        // }}
      />
    )
  }

  // If user is authenticated but should not be (for login/signup pages)
  if (!requireAuth && isAuthenticated) {
    const redirectPath =
      role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN ? '/admin' : '/'
    return <Navigate to={redirectTo || redirectPath} />
  }

  // Check role-based access
  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}
