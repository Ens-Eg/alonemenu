import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const url = request.nextUrl.clone();

  // Remove port if present
  const hostWithoutPort = hostname.split(':')[0];
  const hostParts = hostWithoutPort.split('.');

  // Determine subdomain
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

  // Redirect /menu/[slug] paths to subdomains
  const menuMatch = url.pathname.match(/^\/(ar|en)?\/?menu\/([^/]+)/);
  if (menuMatch) {
    const slug = menuMatch[2];
    const baseHost = hostWithoutPort.includes('localhost')
      ? 'localhost'
      : hostWithoutPort.split('.').slice(-2).join('.');
    const port = hostname.includes(':') ? ':' + hostname.split(':')[1] : '';
    return NextResponse.redirect(`${forwardedProto}://${slug}.${baseHost}${port}`);
  }

  // Rewrite subdomain to menu page
  if (subdomain) {
    // Determine locale
    const locale = url.pathname.startsWith('/en') ? 'en' : 'ar';

    // Rewrite to menu page if path is '/' or '/locale'
    let pathname = url.pathname;
    if (pathname === '/' || pathname === `/${locale}`) {
      pathname = `/${locale}/menu/${subdomain}`;
    }

    // Skip API, static files, images, uploads
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/images') && !pathname.startsWith('/uploads')) {
      url.pathname = pathname;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)',
  ],
};
