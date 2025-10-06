// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir archivos estáticos, API routes y páginas públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // archivos estáticos como .css, .js, .ico
  ) {
    return NextResponse.next()
  }

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/forgot-password', '/']

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // TEMPORAL: Desactivar validación del middleware
  // El sistema actual usa localStorage + Redux, no cookies
  // La protección real se hace con AuthGuard en cada página

  // TODO: Implementar validación de cookies cuando se migre el token storage
  // const token = request.cookies.get('auth_token')?.value ||
  //               request.cookies.get('accessToken')?.value ||
  //               request.headers.get('authorization')?.replace('Bearer ', '')

  // if (!token) {
  //   const loginUrl = new URL('/login', request.url)
  //   loginUrl.searchParams.set('redirect', pathname)
  //   return NextResponse.redirect(loginUrl)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
