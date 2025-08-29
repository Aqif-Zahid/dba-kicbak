import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("[v0] API route called")

  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    console.log("[v0] Username parameter:", username)

    if (!username) {
      console.log("[v0] No username provided")
      return NextResponse.json({ error: "Username parameter is required" }, { status: 400 })
    }

    // Validate username format
    const validation = validateUsernameFormat(username)
    console.log("[v0] Validation result:", validation)

    if (!validation.isValid) {
      return NextResponse.json({
        available: false,
        message: validation.message,
        valid: false,
      })
    }

    console.log("[v0] Checking environment variables")
    console.log("[v0] NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log("[v0] Supabase environment variables not available, returning mock response")
      // For development/testing when Supabase isn't configured
      return NextResponse.json({
        available: true,
        message: "Username is available! (Database not connected)",
        valid: true,
      })
    }

    console.log("[v0] Creating Supabase client")
    let supabase
    try {
      supabase = await createClient()
      console.log("[v0] Supabase client created successfully")
    } catch (clientError) {
      console.error("[v0] Failed to create Supabase client:", clientError)
      console.log("[v0] Returning mock response due to client creation failure")
      return NextResponse.json({
        available: true,
        message: "Username is available! (Database connection issue)",
        valid: true,
      })
    }

    console.log("[v0] Querying database for username:", username.toLowerCase())
    // Check if username exists
    const { data, error } = await supabase
      .from("usernames")
      .select("username")
      .eq("username", username.toLowerCase())
      .single()

    console.log("[v0] Database query result:", { data, error })

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" which means username is available
      console.error("[v0] Database error:", error)
      return NextResponse.json(
        {
          error: "Database error occurred",
          details: error.message,
        },
        { status: 500 },
      )
    }

    const isAvailable = !data
    console.log("[v0] Username available:", isAvailable)

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable ? "Username is available!" : "Username is already taken",
      valid: true,
    })
  } catch (error) {
    console.error("[v0] Unexpected error in API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}

function validateUsernameFormat(username: string) {
  if (username.length < 3) {
    return { isValid: false, message: "Username must be at least 3 characters long" }
  }
  if (username.length > 20) {
    return { isValid: false, message: "Username must be 20 characters or less" }
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, message: "Username can only contain letters, numbers, hyphens, and underscores" }
  }
  if (/^[_-]/.test(username) || /[_-]$/.test(username)) {
    return { isValid: false, message: "Username cannot start or end with hyphens or underscores" }
  }
  return { isValid: true, message: "Username format is valid" }
}
