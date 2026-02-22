import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ------------------------
// Zod Schemas
// ------------------------
const topicCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  groupId: z.number(),
});

const topicUpdateSchema = topicCreateSchema.extend({
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
// GET: List all topic groups with their topics
// Optional filter: ?groupId=1
// ------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    const topicGroups = await prisma.topicGroup.findMany({
      where: groupId ? { id: Number(groupId) } : {},
      orderBy: { createdAt: "desc" },
      include: {
        topics: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: true },
        },
      },
    });

    return NextResponse.json({ status: 1, data: topicGroups });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

// ------------------------
// POST: Create topic
// ------------------------
export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json();
    const parsed = topicCreateSchema.safeParse(body);
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

    const { title, description, groupId } = parsed.data;

    // Validate that the group exists
    const groupExists = await prisma.topicGroup.findUnique({
      where: { id: groupId },
    });
    if (!groupExists) {
      return NextResponse.json(
        { status: 0, message: "Topic group does not exist" },
        { status: 400 }
      );
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        groupId,
        createdById: Number(user.defaultProfileId),
      },
    });

    return NextResponse.json({ status: 1, data: topic }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to create topic" },
      { status: 500 }
    );
  }
}

// ------------------------
// PUT: Update topic
// ------------------------
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json();
    const parsed = topicUpdateSchema.safeParse(body);
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

    const { id, title, description, groupId } = parsed.data;

    // Validate that the group exists
    const groupExists = await prisma.topicGroup.findUnique({
      where: { id: groupId },
    });
    if (!groupExists) {
      return NextResponse.json(
        { status: 0, message: "Topic group does not exist" },
        { status: 400 }
      );
    }

    const updated = await prisma.topic.update({
      where: { id },
      data: { title, description, groupId, updatedAt: new Date() },
    });

    return NextResponse.json({ status: 1, data: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { status: 0, message: "Topic not found" },
        { status: 422 }
      );
    }
    if (error instanceof NextResponse) return error;
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to update topic" },
      { status: 500 }
    );
  }
}

// ------------------------
// DELETE: Delete topic
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

    await prisma.topic.delete({ where: { id } });

    return NextResponse.json({ status: 1, message: "Deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { status: 0, message: "Topic not found" },
        { status: 422 }
      );
    }
    if (error instanceof NextResponse) return error;
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
