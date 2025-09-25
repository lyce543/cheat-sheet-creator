import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/chat"

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host") // original origin before load balancer
      const forwardedProto = request.headers.get("x-forwarded-proto")
      const isLocalEnv = process.env.NODE_ENV === "development"
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // Use the forwarded protocol if available, otherwise default to https
        const protocol = forwardedProto || 'https'
        return NextResponse.redirect(`${protocol}://${forwardedHost}${next}`)
      } else {
        // Fallback to the site URL from environment or origin
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
        return NextResponse.redirect(`${siteUrl}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
