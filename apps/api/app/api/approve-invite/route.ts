import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/sendMail";
import { InviteTemplate } from "@/components/emailTemplates/InviteTemplate";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get the logged-in user
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json(
        { status: 0, message: "User Unauthorized!" },
        { status: 401 }
      );
    }

    const username = user.username;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { status: 0, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find the pending invite request by email
    const inviteRequest = await prisma.users.findFirst({
      where: {
        email,
        status: {
          in: ["PENDING", "WAITLISTED"],
        },
      },
    });

    if (!inviteRequest) {
      return NextResponse.json(
        { status: 0, message: "Invite request not found or already approved" },
        { status: 404 }
      );
    }

    // Build the signup URL
    const signupUrl = `${process.env.APP_URL}/invite/${username}?email=${email}`;

    // Generate the email HTML and send the email
    const emailHtml = InviteTemplate(signupUrl);
    await sendEmail({
      to: email,
      subject: "Your Exclusive Invitation Has Been Approved!",
      html: emailHtml,
    });

    return NextResponse.json({
      status: 1,
      message: "Invite approved and email sent successfully",
    });
  } catch (error) {
    console.error("Error approving invite:", error);
    return NextResponse.json(
      { status: 0, message: "Error approving invite" },
      { status: 500 }
    );
  }
}
