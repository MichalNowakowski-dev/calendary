import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/employee"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth routes that should redirect authenticated users
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(pathname);

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth routes, redirect to appropriate dashboard
  if (user && isAuthRoute) {
    const userRole = user.user_metadata?.role;
    const url = request.nextUrl.clone();

    if (userRole === "company_owner") {
      url.pathname = "/dashboard";
    } else if (userRole === "employee") {
      url.pathname = "/employee";
    } else {
      url.pathname = "/";
    }

    return NextResponse.redirect(url);
  }

  // For dashboard routes, ensure user has the right role
  if (user && pathname.startsWith("/dashboard")) {
    const userRole = user.user_metadata?.role;

    // Only allow company owners to access dashboard
    if (userRole !== "company_owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // For employee routes, ensure user has the right role
  if (user && pathname.startsWith("/employee")) {
    const userRole = user.user_metadata?.role;

    // Only allow employees to access employee routes
    if (userRole !== "employee") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
