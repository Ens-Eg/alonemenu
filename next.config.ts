import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },

  productionBrowserSourceMaps: false,

  experimental: {
    // serverActions: true,
  },

  // Serve SPA fallback for non-API routes
  // Removed aggressive rewrites that conflict with Next.js routing and middleware
  // Next.js handles routing automatically, and middleware handles subdomain logic
  // If you need specific rewrites, add them here with proper exclusions

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

// Wrap with NextIntl plugin
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
