import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Validate username format
    const validation = validateUsernameFormat(username)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user already has a username
    const { data: existingUsername } = await supabase
      .from("usernames")
      .select("username")
      .eq("user_id", user.id)
      .single()

    if (existingUsername) {
      return NextResponse.json({ error: "You have already claimed a username" }, { status: 409 })
    }

    // Final availability check before claiming
    const { data: conflictCheck } = await supabase
      .from("usernames")
      .select("username")
      .eq("username", username.toLowerCase())
      .single()

    if (conflictCheck) {
      return NextResponse.json({ error: "Username was just claimed by someone else" }, { status: 409 })
    }

    // Claim the username
    const { data, error: insertError } = await supabase
      .from("usernames")
      .insert({
        username: username.toLowerCase(),
        user_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting username:", insertError)
      return NextResponse.json({ error: "Failed to claim username" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      username: data.username,
      message: "Username claimed successfully!",
    })
  } catch (error) {
    console.error("Error claiming username:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
