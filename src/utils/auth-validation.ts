// utils/auth-validation.ts
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Server-side authentication validation
 * Use this in Server Components or Server Actions
 */
export async function validateAuthServer() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value || cookieStore.get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  // TODO: Validate token with your API
  // const isValid = await validateTokenWithAPI(token)
  // if (!isValid) {
  //   redirect('/login')
  // }

  return token
}

/**
 * Check if user has specific permission on server-side
 */
export async function checkPermissionServer(requiredPermission: string) {
  const token = await validateAuthServer()

  // TODO: Get user permissions from API or decode JWT
  // const permissions = await getUserPermissions(token)
  // return permissions.includes(requiredPermission)

  return true // Temporary - always return true
}

/**
 * Server-side permission check utility
 */
export async function requirePermission(requiredPermission: string) {
  await validateAuthServer()

  const hasPermission = await checkPermissionServer(requiredPermission)
  if (!hasPermission) {
    redirect('/dashboard?error=unauthorized')
  }

  return true
}
