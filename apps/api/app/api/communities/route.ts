import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

const communityCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["PUBLIC", "RESTRICTED", "PRIVATE"]).default("PUBLIC"),
  icon: z.string().optional(),
  topicIds: z.array(z.number()).optional(),
});

const communityUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["PUBLIC", "RESTRICTED", "PRIVATE"]).optional(),
  icon: z.string().optional(),
  connectTopicIds: z.array(z.number()).optional(),
  disconnectTopicIds: z.array(z.number()).optional(),
});

async function requireOwnerOrAdmin(req: NextRequest, communityId: number) {
  const user = await getUser(req);
  if (!user) {
    throw NextResponse.json(
      { status: 0, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { ownerId: true },
  });

  if (!community) {
    throw NextResponse.json(
      { status: 0, message: "Community not found" },
      { status: 404 }
    );
  }

  const isOwner = community.ownerId === Number(user.defaultProfileId);
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw NextResponse.json(
      { status: 0, message: "You are not authorized!" },
      { status: 403 }
    );
  }

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    const communities = await prisma.community.findMany({
      where: ownerId ? { ownerId: Number(ownerId) } : {},
      orderBy: { createdAt: "desc" },
      include: {
        owner: true,
        members: true,
        favoredBy: true,
        topics: true,
      },
    });

    return NextResponse.json({ status: 1, data: communities });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user)
      return NextResponse.json(
        { status: 0, message: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();
    const parsed = communityCreateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          status: 0,
          message: "Validation failed",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );

    const { name, slug, description, type, icon, topicIds = [] } = parsed.data;

    // Check slug uniqueness
    const exists = await prisma.community.findUnique({ where: { slug } });
    if (exists)
      return NextResponse.json(
        { status: 0, message: "Slug already exists" },
        { status: 409 }
      );

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        type,
        icon,
        ownerId: Number(user.defaultProfileId),
        topics: { connect: topicIds.map((id) => ({ id })) },
      },
      include: { topics: true },
    });

    return NextResponse.json({ status: 1, data: community }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to create community" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = communityUpdateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          status: 0,
          message: "Validation failed",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );

    const {
      id,
      name,
      slug,
      description,
      type,
      icon,
      connectTopicIds = [],
      disconnectTopicIds = [],
    } = parsed.data;

    await requireOwnerOrAdmin(req, id);

    // Check slug uniqueness if slug is being updated
    if (slug) {
      const existing = await prisma.community.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing)
        return NextResponse.json(
          { status: 0, message: "Slug already in use by another community" },
          { status: 409 }
        );
    }

    const updated = await prisma.community.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(icon !== undefined && { icon }),
        topics: {
          ...(connectTopicIds.length > 0 && {
            connect: connectTopicIds.map((id) => ({ id })),
          }),
          ...(disconnectTopicIds.length > 0 && {
            disconnect: disconnectTopicIds.map((id) => ({ id })),
          }),
        },
      },
      include: { topics: true },
    });

    return NextResponse.json({ status: 1, data: updated });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to update community" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id)
      return NextResponse.json(
        { status: 0, message: "ID is required" },
        { status: 400 }
      );

    await requireOwnerOrAdmin(req, id);

    await prisma.community.delete({ where: { id } });

    return NextResponse.json({ status: 1, message: "Community deleted" });
  } catch (error: any) {
    if (error.code === "P2025")
      return NextResponse.json(
        { status: 0, message: "Community not found" },
        { status: 422 }
      );
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Failed to delete community" },
      { status: 500 }
    );
  }
}
