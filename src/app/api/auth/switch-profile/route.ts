// /api/auth/switch-profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Assuming this path

// This API route signals NextAuth to switch the active profile
// by setting a specific cookie or session parameter, forcing the 
// session to refresh and update the active profile ID.

// Note: The client-side (Sidebar.tsx) will call this route 
// then call signIn('refresh', { redirect: false }) to update the session.

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { newProfileId } = body;

    if (!newProfileId) {
      return NextResponse.json(
        { status: 0, message: "Missing newProfileId" },
        { status: 400 }
      );
    }

    // Ensure the newProfileId belongs to the current user
    const userProfiles = (session as any).allProfiles || [];
    const isValidProfile = userProfiles.some(
      (p: { profileId: string }) => p.profileId === newProfileId
    );

    if (!isValidProfile) {
      return NextResponse.json(
        { status: 0, message: "Profile not owned by user" },
        { status: 403 }
      );
    }

    // Set the new profile ID in a response header or body to be consumed 
    // by the client-side refresh trigger.
    // In this specific implementation, we will use a JSON response to pass 
    // the ID back, and the client-side code will use it to trigger the
    // NextAuth refresh mechanism (e.g., using a custom query parameter).

    return NextResponse.json(
      { 
        status: 1, 
        message: "Profile switch initiated",
        activeProfileId: newProfileId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile Switch API Error:", error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}