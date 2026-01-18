import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Configure Auth0 client-side routes to match our custom /api/auth/* routes
    NEXT_PUBLIC_PROFILE_ROUTE: '/api/auth/me',
    NEXT_PUBLIC_LOGIN_ROUTE: '/api/auth/login',
    NEXT_PUBLIC_ACCESS_TOKEN_ROUTE: '/api/auth/access-token',
  },
};

export default nextConfig;
