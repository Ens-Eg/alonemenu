import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Extract subdomain
  // Format: subdomain.ensmenu.com or subdomain.localhost:3000
  let subdomain: string | null = null;
  
  // Remove port if present (e.g., localhost:3000 -> localhost)
  const hostWithoutPort = hostname.split(':')[0];
  const hostParts = hostWithoutPort.split('.');
  
  // Check if we have a subdomain
  if (hostWithoutPort.includes('localhost')) {
    // Development: subdomain.localhost:3000
    // hostParts = ['subdomain', 'localhost']
    if (hostParts.length >= 2 && hostParts[0] !== 'localhost' && hostParts[0] !== 'www') {
      subdomain = hostParts[0];
    }
  } else {
    // Production: subdomain.ensmenu.com
    // hostParts = ['subdomain', 'ensmenu', 'com']
    if (hostParts.length >= 3 && hostParts[0] !== 'www' && hostParts[0] !== 'dashboard') {
      subdomain = hostParts[0];
    }
  }

  // Block direct access to /menu/[slug] path - must use subdomain
  if (url.pathname.match(/^\/[a-z]{2}\/menu\/[^/]+/)) {
    // Extract slug from path
    const pathMatch = url.pathname.match(/\/menu\/([^/]+)/);
    if (pathMatch) {
      const slug = pathMatch[1];
      // Redirect to subdomain
      const protocol = url.protocol;
      const port = hostname.includes(':') ? ':' + hostname.split(':')[1] : '';
      const baseHost = hostWithoutPort.includes('localhost') ? 'localhost' : hostWithoutPort.split('.').slice(-2).join('.');
      return NextResponse.redirect(`${protocol}//${slug}.${baseHost}${port}`);
    }
  }

  // If we have a subdomain, rewrite to the public menu page
  if (subdomain) {
    // Determine locale from path or default to 'ar'
    let locale = 'ar';
    if (url.pathname.startsWith('/en')) {
      locale = 'en';
    } else if (url.pathname.startsWith('/ar')) {
      locale = 'ar';
    }
    
    // Rewrite subdomain.domain.com to domain.com/locale/menu/subdomain
    // If path is just '/' or '/locale', rewrite to menu page
    // Otherwise, preserve the pathname (for API calls, etc.)
    let pathname = url.pathname;
    
    if (pathname === '/' || pathname === `/${locale}` || pathname === '/ar' || pathname === '/en') {
      pathname = `/${locale}/menu/${subdomain}`;
    }
    
    // Don't rewrite API calls or static files
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/images')) {
      return NextResponse.next();
    }
    
    return NextResponse.rewrite(
      new URL(pathname, request.url)
    );
  }

  // Continue with normal routing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)',
  ],
};

