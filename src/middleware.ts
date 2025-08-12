import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Types
type UserRole = "company_owner" | "employee" | "customer" | "admin";

interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
}

// Constants
const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  company_owner: {
    path: "/company_owner",
    allowedRoles: ["company_owner"],
  },
  employee: {
    path: "/employee",
    allowedRoles: ["employee"],
  },
  customer: {
    path: "/customer",
    allowedRoles: ["customer"],
  },
  admin: {
    path: "/admin",
    allowedRoles: ["admin"],
  },
};

const PROTECTED_ROUTES = Object.values(ROUTE_CONFIGS).map(
  (config) => config.path
);
const AUTH_ROUTES = ["/login", "/register"];

const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  company_owner: "/company_owner",
  employee: "/employee",
  customer: "/customer",
  admin: "/admin",
};

// Helper functions
const getUserRole = (user: any): UserRole | null => {
  return user?.user_metadata?.role || null;
};

const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
};

const isAuthRoute = (pathname: string): boolean => {
  return AUTH_ROUTES.includes(pathname);
};

const createRedirectResponse = (
  request: NextRequest,
  pathname: string,
  searchParams?: Record<string, string>
): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return NextResponse.redirect(url);
};

const hasRouteAccess = (
  pathname: string,
  userRole: UserRole | null
): boolean => {
  if (!userRole) return false;

  for (const config of Object.values(ROUTE_CONFIGS)) {
    if (pathname.startsWith(config.path)) {
      return config.allowedRoles.includes(userRole);
    }
  }

  return true; // Allow access to non-protected routes
};

const getRedirectPathForRole = (userRole: UserRole | null): string => {
  if (!userRole || !ROLE_REDIRECT_MAP[userRole]) {
    return "/";
  }
  return ROLE_REDIRECT_MAP[userRole];
};

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    const protectedRoute = isProtectedRoute(pathname);
    const authRoute = isAuthRoute(pathname);

    // Skip any auth work for public routes
    if (!protectedRoute && !authRoute) {
      return NextResponse.next();
    }

    const supabase = createClient();
    let user: any = null;
    try {
      const {
        data: { user: fetchedUser },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        // Swallow missing-session noise on public/auth routes
        const isMissingSession =
          (error as any)?.__isAuthError && (error as any)?.status === 400;
        if (!isMissingSession) {
          console.error("Auth error in middleware:", error);
        }
      }
      user = fetchedUser ?? null;
    } catch (err: any) {
      const isMissingSession = err?.__isAuthError && err?.status === 400;
      if (!isMissingSession) {
        console.error("Auth error in middleware:", err);
      }
    }

    const userRole = getUserRole(user);

    // Handle unauthenticated users trying to access protected routes
    if (!user && protectedRoute) {
      return createRedirectResponse(request, "/login", {
        redirectTo: pathname,
      });
    }

    // Handle authenticated users trying to access auth routes
    if (user && authRoute) {
      const redirectPath = getRedirectPathForRole(userRole);
      return createRedirectResponse(request, redirectPath);
    }

    // Handle role-based access control for protected routes
    if (user && protectedRoute) {
      if (!hasRouteAccess(pathname, userRole)) {
        return createRedirectResponse(request, "/");
      }
    }

    // Allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of error, allow the request to proceed to avoid blocking the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - _next/webpack-hmr (hot reload)
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)",
  ],
};
