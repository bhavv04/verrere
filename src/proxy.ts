import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/app/onboarding",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && !isPublic(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/app", req.url));
  }
});
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};