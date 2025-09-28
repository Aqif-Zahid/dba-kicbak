import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, like, and, or, sql } from "drizzle-orm";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { message: "User Unauthorized!" },
        { status: 401 }
      );
    }

    // 🔹 Get query params
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    // 🔹 Build filters
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.displayName, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.phoneNumber, `%${search}%`)
        )
      );
    }
    if (role) {
      const allowedRoles = [
        "TRAVELER",
        "OPERATOR",
        "CREATOR",
        "AGENT",
        "ADMIN",
      ] as const;
      if (allowedRoles.includes(role as any)) {
        conditions.push(eq(users.role, role as (typeof allowedRoles)[number]));
      }
    }

    if (status) {
      // Cast status to the correct enum type
      const allowedStatuses = [
        "WAITLISTED",
        "PENDING",
        "ACTIVE",
        "BLOCKED",
      ] as const;
      if (allowedStatuses.includes(status as any)) {
        conditions.push(
          eq(users.status, status as (typeof allowedStatuses)[number])
        );
      }
    }

    // 🔹 Main query
    const userList = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        profilePicture: users.profilePicture,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(sql`${users.createdAt} DESC`)
      .offset(skip)
      .limit(limit);

    // 🔹 Count total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

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
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "User Unauthorized!" },
        { status: 401 }
      );
    }

    // 🔹 Get user ID from query params
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { status: 0, message: "User ID is required" },
        { status: 400 }
      );
    }

    // 🔹 Delete user
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      return NextResponse.json(
        { status: 0, message: "User ID must be a number" },
        { status: 400 }
      );
    }
    const result = await db.delete(users).where(eq(users.id, numericUserId));
    return NextResponse.json({
      status: 1,
      message: "User deleted successfully",
      deleted: result.rowCount || 0,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { status: 0, message: "Error deleting user" },
      { status: 500 }
    );
  }
}
