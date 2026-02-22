import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookmarkInfo } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params; // Destructure inside
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        profileId_postId: {
          profileId: Number(loggedInUser.defaultProfileId),
          postId: Number(postId),
        },
      },
    });

    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark,
    };

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params; // Destructure inside
    const loggedInUser = await getUser(req);

    if (!loggedInUser) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await prisma.bookmark.upsert({
      where: {
        profileId_postId: {
          profileId: Number(loggedInUser.defaultProfileId),
          postId: Number(postId),
        },
      },
      create: {
        profileId: Number(loggedInUser.defaultProfileId),
        postId: Number(postId),
      },
      update: {},
    });
    return new NextResponse();
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params; // Destructure inside
    const loggedInUser = await getUser(req);
    if (!loggedInUser) {
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await prisma.bookmark.deleteMany({
      where: {
        profileId: Number(loggedInUser.defaultProfileId),
        postId: Number(postId),
      },
    });
    return new NextResponse();
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
