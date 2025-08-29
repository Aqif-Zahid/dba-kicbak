import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user's username
    const { data, error } = await supabase
      .from("usernames")
      .select("username, created_at")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" which means user has no username
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({
        hasUsername: false,
        username: null,
        claimedAt: null,
      })
    }

    return NextResponse.json({
      hasUsername: true,
      username: data.username,
      claimedAt: data.created_at,
    })
  } catch (error) {
    console.error("Error fetching user username:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
