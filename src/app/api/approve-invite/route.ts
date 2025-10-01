import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/sendMail";
import InviteTemplate from "@/components/emailTemplates/InviteTemplate";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { message: "User Unauthorized!" },
        { status: 401 }
      );
    }
    const username = user.username;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find the pending invite request by email
    const inviteRequest = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (
      !inviteRequest ||
      !["PENDING", "WAITLISTED"].includes(inviteRequest.status)
    ) {
      return NextResponse.json(
        { message: "Invite request not found or already approved" },
        { status: 404 }
      );
    }
    const signupUrl = `${process.env.APP_URL}/invite/${username}?email=${email}`;

    // Generate the email HTML and send the email
    const emailHtml = InviteTemplate(signupUrl);
    await sendEmail({
      to: email,
      subject: "Your Exclusive Invitation Has Been Approved!",
      html: emailHtml,
    });

    return NextResponse.json({
      message: "Invite approved and email sent successfully",
    });
  } catch (error) {
    console.error("Error approving invite:", error);
    return NextResponse.json(
      { message: "Error approving invite" },
      { status: 500 }
    );
  }
}
