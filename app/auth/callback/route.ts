import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/chat"

    console.log("Auth callback - Code:", code ? "Present" : "Missing")
    console.log("Auth callback - Origin:", origin)
    console.log("Auth callback - Next:", next)

    if (!code) {
      console.log("No code provided, redirecting to error")
      return NextResponse.redirect(`${origin}/auth/error?error=no_code`)
    }

    const supabase = await createClient()
    
    console.log("Exchanging code for session...")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("Error exchanging code:", error.message)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
    }

    if (!data?.user) {
      console.log("No user data after exchange")
      return NextResponse.redirect(`${origin}/auth/error?error=no_user`)
    }

    console.log("Successfully authenticated user:", data.user.email)

    // Визначення правильного URL для редиректу
    const forwardedHost = request.headers.get("x-forwarded-host")
    const forwardedProto = request.headers.get("x-forwarded-proto")
    const isLocalEnv = process.env.NODE_ENV === "development"
    
    let redirectUrl: string

    if (isLocalEnv) {
      // Локальна розробка
      redirectUrl = `${origin}${next}`
      console.log("Local redirect:", redirectUrl)
    } else if (forwardedHost) {
      // Продакшн з load balancer
      const protocol = forwardedProto || 'https'
      redirectUrl = `${protocol}://${forwardedHost}${next}`
      console.log("Production redirect (forwarded):", redirectUrl)
    } else {
      // Fallback - використовуємо origin або SITE_URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      if (siteUrl) {
        redirectUrl = `${siteUrl}${next}`
        console.log("Site URL redirect:", redirectUrl)
      } else {
        redirectUrl = `${origin}${next}`
        console.log("Origin fallback redirect:", redirectUrl)
      }
    }

    console.log("Final redirect URL:", redirectUrl)
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    
    // Fallback redirect на випадок будь-якої помилки
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/auth/error?error=server_error`)
  }
}
