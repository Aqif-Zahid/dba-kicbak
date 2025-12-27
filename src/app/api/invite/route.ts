import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import thirdPartyClientAuth from "@/lib/api-client-auth";

export async function POST(req: Request) {
  try {
    // Allow either: normal logged-in user OR third-party Bearer token
    const session = await getUser(req as any);
    const thirdPartyClient =
      session?.id ? null : await thirdPartyClientAuth.getThirdPartyClientFromRequest(req as any);

    if (!session?.id && !thirdPartyClient) {
      return NextResponse.json({ status: 0, message: "Unauthorized" }, { status: 401 });
    }

    // If third-party request, resolve owner (referrer) userId
    let referrerId: number | null = null;

    if (thirdPartyClient) {
      const owner = await prisma.thirdPartyClient.findUnique({
        where: { id: thirdPartyClient.thirdPartyClientId },
        select: { userId: true },
      });

      if (!owner) {
        return NextResponse.json(
          { status: 0, message: "Invalid third party client" },
          { status: 401 }
        );
      }

      referrerId = owner.userId;
    }

    const body = await req.json();

    // Support BOTH:
    // 1) { email: "a@b.com" }
    // 2) { emails: ["a@b.com", "c@d.com"] }
    const rawEmails: string[] =
      Array.isArray(body?.emails) ? body.emails : body?.email ? [body.email] : [];

    if (rawEmails.length === 0) {
      return NextResponse.json(
        { status: 0, message: "Email is required" },
        { status: 400 }
      );
    }

    const emails = Array.from(
      new Set(
        rawEmails
          .filter(Boolean)
          .map((e: string) => String(e).trim().toLowerCase())
          .filter((e: string) => e.length > 0)
      )
    );

    if (emails.length === 0) {
      return NextResponse.json(
        { status: 0, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find which already exist
    const existingUsers = await prisma.users.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    });

    const existingSet = new Set(existingUsers.map((u) => u.email.toLowerCase()));
    const newEmails = emails.filter((e) => !existingSet.has(e));

    // Create pending users for only new emails
    if (newEmails.length > 0) {
      await prisma.users.createMany({
        data: newEmails.map((email) => ({
          email,
          status: "PENDING",
          referrerId: referrerId ?? undefined,
        })),
        skipDuplicates: true,
      });
    }

    // Keep the old single-email response shape as much as possible
    if (!Array.isArray(body?.emails) && body?.email) {
      if (existingSet.has(String(body.email).trim().toLowerCase())) {
        return NextResponse.json(
          {
            status: 0,
            message: "This email is already registered or has a pending request.",
          },
          { status: 200 }
        );
      }

      const user = await prisma.users.findUnique({
        where: { email: String(body.email).trim().toLowerCase() },
      });

      return NextResponse.json(
        {
          status: 1,
          message: "Invite request submitted successfully",
          user,
        },
        { status: 200 }
      );
    }

    // Bulk response
    return NextResponse.json(
      {
        status: 1,
        message: "Invite request submitted successfully",
        data: {
          createdCount: newEmails.length,
          skippedCount: emails.length - newEmails.length,
          createdEmails: newEmails,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing invite request:", error);
    return NextResponse.json(
      { status: 0, message: "Error processing invite request" },
      { status: 500 }
    );
  }
}
