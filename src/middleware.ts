import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROUTE_CONFIGS, ROLE_REDIRECT_MAP } from "@/lib/auth/routes";
import { type UserRole } from "@/lib/types/database";

const PUBLIC_ROUTES = ["/business", "/404"];
const PAYMENT_ROUTES = ["/payment"];
const AUTH_ROUTES = ["/login", "/register"];
const ADMIN_ROUTES = ["/admin"];
interface SupabaseUser {
  user_metadata?: {
    role?: UserRole;
  };
}

function getUserRole(user: SupabaseUser | null): UserRole | null {
  return user?.user_metadata?.role || null;
}

function getRouteType(
  pathname: string
): "public" | "auth" | "protected" | "payments" | "admin" | "other" {
  // check if any route is included in the pathname
  if (pathname === "/") return "public";
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) return "auth";
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) return "admin";
  if (PAYMENT_ROUTES.some((route) => pathname.startsWith(route)))
    return "payments";
  if (Object.values(ROUTE_CONFIGS).some((cfg) => pathname.startsWith(cfg.path)))
    return "protected";
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route)))
    return "public";
  return "other";
}

function createRedirect(
  request: NextRequest,
  pathname: string,
  params?: Record<string, string>
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (params)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const routeType = getRouteType(pathname);
    console.log(routeType);
    // Skip static and API
    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
      return NextResponse.next();
    }
    if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
      return NextResponse.next();
    }

    // Public routes always allowed
    if (routeType === "public") {
      return NextResponse.next();
    }

    // if pathname is non existing page redirect to /404
    if (routeType === "other") {
      return createRedirect(request, "/404");
    }

    // Fetch user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const role = getUserRole(user);

    console.log(role);
    // Auth rules
    if (routeType === "protected" && !user) {
      return createRedirect(request, "/login", { redirectTo: pathname });
    }

    if (routeType === "auth" && user) {
      return createRedirect(request, ROLE_REDIRECT_MAP[role ?? "customer"]);
    }

    if (routeType === "admin" && !user) {
      return createRedirect(request, "/login");
    }

    if (routeType === "admin" && user && user.user_metadata?.role !== "admin") {
      return createRedirect(request, "/404");
    }

    if (
      routeType === "payments" &&
      user?.user_metadata.role !== "company_owner"
    ) {
      return createRedirect(request, "/404");
    }
    if (routeType === "protected" && user) {
      const config = Object.values(ROUTE_CONFIGS).find((cfg) =>
        pathname.startsWith(cfg.path)
      );
      if (config && !config.allowedRoles.includes(role as UserRole)) {
        return createRedirect(request, "/");
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)",
  ],
};
