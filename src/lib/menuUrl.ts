/**
 * Helper function to generate menu public URL based on slug
 * Uses subdomain format: slug.localhost:3000 (dev) or slug.domain.com (prod)
 */

export function getMenuPublicUrl(slug: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${slug}.${baseDomain}`;
  }

  // Client-side: detect from current hostname
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;

  if (hostname.includes('localhost')) {
    // Development: slug.localhost:3000
    return `${protocol}//${slug}.localhost${port}`;
  } else {
    // Production: slug.domain.com
    // Extract base domain (e.g., 'ensmenu.com' from 'dashboard.ensmenu.com')
    const hostParts = hostname.split('.');
    if (hostParts.length >= 2) {
      const baseDomain = hostParts.slice(-2).join('.'); // Get last 2 parts (domain.com)
      return `${protocol}//${slug}.${baseDomain}${port}`;
    }
    // Fallback
    return `${protocol}//${slug}.${hostname}${port}`;
  }
}

