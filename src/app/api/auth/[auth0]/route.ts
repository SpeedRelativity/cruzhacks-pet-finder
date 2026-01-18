import type { NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

/**
 * Auth0 route handler for /api/auth/[auth0]
 * Routes requests to the appropriate Auth0 handler (login, logout, callback, etc.)
 * 
 * Since middleware() uses NextResponse.next() which doesn't work in route handlers,
 * we access the internal handler directly.
 */
export async function GET(request: NextRequest) {
  // Access the internal authClient handler
  // The handler routes based on pathname matching configured routes
  const auth0Any = auth0 as any;
  if (auth0Any.authClient?.handler) {
    return await auth0Any.authClient.handler(request);
  }
  
  return new Response('Auth0 handler not available', { status: 500 });
}
