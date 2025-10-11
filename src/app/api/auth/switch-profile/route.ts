import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { newProfileId } = body;

    if (!newProfileId) {
      return NextResponse.json(
        { status: 0, message: "Missing new Profile Id" },
        { status: 400 }
      );
    }

    // ✅ Check in DB that the profile belongs to the current user
    const profile = await prisma.profiles.findFirst({
      where: {
        id: Number(newProfileId),
        userId: Number(currentUser.id),
      },
    });

    if (!profile) {
      return NextResponse.json(
        { status: 0, message: "Profile not owned by user" },
        { status: 403 }
      );
    }
    // Switch the user’s active profile in DB
    await prisma.users.update({
      where: { id: Number(currentUser.id) },
      data: { defaultProfileId: Number(newProfileId) },
    });

    // 🔄 Invalidate caches
    revalidateTag("profiles");
    revalidatePath("/");
    // You can now proceed to update session, set active profile, etc.
    return NextResponse.json(
      {
        status: 1,
        message: "Profile switch successful",
        activeProfileId: newProfileId,
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
