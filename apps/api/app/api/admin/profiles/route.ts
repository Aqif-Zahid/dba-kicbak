import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  const where: any = {};

  const user = await getUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { status: 0, message: "User Unauthorized!" },
      { status: 401 }
    );
  }

  // Search by username, display name, or email
  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
      {
        user: {
          email: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  // 🎭 Role filter if applied
  if (role) {
    where.role = role;
  }

  try {
    const [profiles, total] = await Promise.all([
      prisma.profiles.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              phoneNumber: true,
              status: true, // ✅ now also fetching status
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.profiles.count({ where }),
    ]);

    return NextResponse.json({
      status: 1,
      data: profiles,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin profiles:", error);
    return NextResponse.json(
      { status: 0, message: "Internal server error" },
      { status: 500 }
    );
  }
}
