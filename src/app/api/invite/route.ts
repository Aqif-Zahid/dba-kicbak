import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStatusEnum, profileRoleEnum } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Handles the POST request to submit an invite request.
 * Saves the email to the PostgreSQL database with a 'PENDING' status.
 * @param {Request} req The incoming request object.
 * @returns {Promise<NextResponse>} The JSON response.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Check if the email already exists in the users table
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUser) {
      return NextResponse.json({ message: 'This email is already registered or has a pending request.' }, { status: 200 });
    }

    // Insert the new email into the users table with a 'PENDING' status and a default role
    await db.insert(users).values({
      email: email,
      status: userStatusEnum.enumValues[0], // 'PENDING'
      role: profileRoleEnum.enumValues[0] // 'TRAVELER' as a default
    });

    return NextResponse.json({ message: 'Invite request submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing invite request:', error);
    return NextResponse.json({ message: 'Error processing invite request' }, { status: 500 });
  }
}
