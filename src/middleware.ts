import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default function middleware(req, res) {
  // Skip Clerk authentication for the /chatbot page
  if (req.nextUrl.pathname.startsWith("/chatbot")) {
    return NextResponse.next(); // Allow this route without authentication
  }

  // Apply Clerk's authentication middleware for other routes
  return clerkMiddleware(req, res); // Pass both req and res here
}

export const config = {
  matcher: [
    // Match all routes except /chatbot (this makes the /chatbot page public)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
