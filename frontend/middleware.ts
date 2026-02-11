import { NextResponse, type NextRequest } from 'next/server'
import { TOKEN_COOKIE } from '@/lib/backend-api'

export async function middleware(request: NextRequest) {
  const backendToken = request.cookies.get(TOKEN_COOKIE)?.value
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard && !backendToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
