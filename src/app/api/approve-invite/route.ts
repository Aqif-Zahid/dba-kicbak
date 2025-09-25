import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStatusEnum } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendMail';
import InviteTemplate from '@/components/emailTemplates/InviteTemplate';

/**
 * Handles the POST request to approve a pending invite.
 * @param {Request} req The incoming request object.
 * @returns {Promise<NextResponse>} The JSON response.
 */
export async function GET() {
  try {
    // Find the pending invite request by email
    const pendingRequests = await db.query.users.findMany({
      where: eq(users.status, 'PENDING'),
    });

    return NextResponse.json({ status: 1, data: pendingRequests });
  } catch (error) {
    console.error('Error approving invite:', error);
    return NextResponse.json({ message: 'Error approving invite' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Find the pending invite request by email
    const inviteRequest = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!inviteRequest || inviteRequest.status !== 'PENDING') {
      return NextResponse.json({ message: 'Invite request not found or already approved' }, { status: 404 });
    }

    // Generate a secure, temporary token for the signup link
    const token = crypto.randomBytes(32).toString('hex');
    const signupUrl = `https://your-app-url.com/signup?email=${encodeURIComponent(email)}&token=${token}`;

    // Update the invite status to 'APPROVED' and store the token
    // NOTE: Based on your provided schema, the 'users' table does not have 'token' or 'approvedAt' columns.
    // This will cause a Drizzle error. You will need to add these columns to your schema for this to work correctly.
    await db.update(users).set({
      status: userStatusEnum.enumValues[1], // 'ACTIVE'
      // token: token,
      // approvedAt: new Date(),
    }).where(eq(users.email, email));

    // Generate the email HTML and send the email
    const emailHtml = InviteTemplate(signupUrl);
    await sendEmail({
      to: email,
      subject: 'Your Exclusive Invitation Has Been Approved!',
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Invite approved and email sent successfully' });
  } catch (error) {
    console.error('Error approving invite:', error);
    return NextResponse.json({ message: 'Error approving invite' }, { status: 500 });
  }
}
