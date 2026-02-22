import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ------------------------
// Zod Schemas
// ------------------------
const topicGroupCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const topicGroupUpdateSchema = topicGroupCreateSchema.extend({
  id: z.number(),
});

// ------------------------
// Helper: Ensure Admin
// ------------------------
async function requireAdmin(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== "ADMIN") {
    throw NextResponse.json(
      { status: 0, message: "You are not authorized!" },
      { status: 401 }
    );
  }
  return user;
}

// ------------------------
// GET: List all topic groups
// ------------------------
export async function GET(req: NextRequest) {
  try {
    const topicGroups = await prisma.topicGroup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        topics: true,
        createdBy: {
          select: {
            id: true,
            displayName: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });
    return NextResponse.json({ status: 1, data: topicGroups });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to fetch topic groups" },
      { status: 500 }
    );
  }
}

// ------------------------
// POST: Create topic group
// ------------------------
export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json();
    const parsed = topicGroupCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: 0,
          message: "Validation failed",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;

    const topicGroup = await prisma.topicGroup.create({
      data: {
        name,
        description,
        createdById: Number(user.defaultProfileId),
      },
    });

    return NextResponse.json({ status: 1, data: topicGroup }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error; // authorization handled
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to create topic group" },
      { status: 500 }
    );
  }
}

// ------------------------
// PUT: Update topic group
// ------------------------
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json();
    const parsed = topicGroupUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: 0,
          message: "Validation failed",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { id, name, description } = parsed.data;

    const updated = await prisma.topicGroup.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json({ status: 1, data: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { status: 0, message: "Topic group not found" },
        { status: 422 }
      );
    }
    if (error instanceof NextResponse) return error;
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to update topic group" },
      { status: 500 }
    );
  }
}

// ------------------------
// DELETE: Delete topic group
// ------------------------
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { status: 0, message: "ID is required" },
        { status: 400 }
      );
    }

    await prisma.topicGroup.delete({ where: { id } });

    return NextResponse.json({ status: 1, message: "Deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { status: 0, message: "Topic group not found" },
        { status: 422 }
      );
    }
    if (error instanceof NextResponse) return error;
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to delete topic group" },
      { status: 500 }
    );
  }
}
