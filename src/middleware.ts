import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && !isPublic(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};