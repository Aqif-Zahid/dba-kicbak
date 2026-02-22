import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User Unauthorized!" },
        { status: 401 }
      );
    }

    // 🔹 Get query params
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;

    // 🔹 Build where filters
    const where: any = {};

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      const allowedRoles = [
        "TRAVELER",
        "OPERATOR",
        "CREATOR",
        "AGENT",
        "ADMIN",
      ];
      if (allowedRoles.includes(role)) {
        where.role = role;
      }
    }

    if (status) {
      const allowedStatuses = ["WAITLISTED", "PENDING", "ACTIVE", "BLOCKED"];
      if (allowedStatuses.includes(status)) {
        where.status = status;
      }
    }

    // 🔹 Main query
    const [userList, total] = await prisma.$transaction([
      prisma.users.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          emailAlias: true,
          phoneNumber: true,
          status: true,
          createdAt: true,
          defaultProfile: true,
        },
      }),
      prisma.users.count({ where }),
    ]);

    return NextResponse.json({
      status: 1,
      data: userList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { status: 0, message: "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { status: 0, message: "User Unauthorized!" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { status: 0, message: "User ID is required" },
        { status: 400 }
      );
    }

    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      return NextResponse.json(
        { status: 0, message: "User ID must be a number" },
        { status: 400 }
      );
    }

    const deletedUser = await prisma.users.deleteMany({
      where: { id: numericUserId },
    });

    return NextResponse.json({
      status: 1,
      message: "User deleted successfully",
      deleted: deletedUser.count,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { status: 0, message: "Error deleting user" },
      { status: 500 }
    );
  }
}
