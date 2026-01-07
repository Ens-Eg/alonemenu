import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const url = request.nextUrl.clone();

  const hostWithoutPort = hostname.split(':')[0];
  const hostParts = hostWithoutPort.split('.');

  // Detect subdomain
  let subdomain: string | null = null;
  if (hostWithoutPort.includes('localhost')) {
    if (hostParts.length >= 2 && hostParts[0] !== 'localhost' && hostParts[0] !== 'www') {
      subdomain = hostParts[0];
    }
  } else {
    if (hostParts.length >= 3 && hostParts[0] !== 'www' && hostParts[0] !== 'dashboard') {
      subdomain = hostParts[0];
    }
  }

  // Redirect /menu/[slug] only if not already on correct subdomain
  const menuMatch = url.pathname.match(/^\/(ar|en)?\/?menu\/([^/]+)/);
  if (menuMatch) {
    const slug = menuMatch[2];
    if (subdomain !== slug) {
      // redirect to subdomain
      const baseHost = hostWithoutPort.includes('localhost')
        ? 'localhost'
        : hostWithoutPort.split('.').slice(-2).join('.');
      const port = hostname.includes(':') ? ':' + hostname.split(':')[1] : '';
      return NextResponse.redirect(`${forwardedProto}://${slug}.${baseHost}${port}`);
    }
  }

  // Rewrite root path for subdomains ONLY
  if (subdomain) {
    const locale = url.pathname.startsWith('/en') ? 'en' : 'ar';
    let pathname = url.pathname;

    // Only rewrite if path is / or /locale, not /menu/[subdomain]
    if (pathname === '/' || pathname === '/ar' || pathname === '/en') {
      pathname = `/${locale}/menu/${subdomain}`;
      url.pathname = pathname;
      return NextResponse.rewrite(url);
    }

    // Skip rewriting if already on /menu/[subdomain]
    if (pathname.startsWith(`/${locale}/menu/${subdomain}`)) {
      return NextResponse.next();
    }

    // Skip API, _next, images, uploads
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname.startsWith('/uploads')) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)'],
};
