// This utility function handles the actual sending of emails using Nodemailer.
// You will need to install Nodemailer: npm install nodemailer
// And set your environment variables in a .env file.

import nodemailer from 'nodemailer';

// Type definition for email options for better type safety
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  emailAlias?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST, // e.g., 'smtp.gmail.com'
  port: parseInt(process.env.NODEMAILER_PORT || '587', 10),
  secure: process.env.NODEMAILER_SECURE === 'true', // Use 'true' for 465, 'false' for other ports
  auth: {
    user: process.env.NODEMAILER_USER, // Your email address
    pass: process.env.NODEMAILER_PASSWORD, // Your email password or app-specific password
  },
});

export const sendEmail = async (options: EmailOptions) => {
  try {
    await transporter.sendMail({
      from: `${process.env.NODEMAILER_USER}`,
      to: options.to,
      subject: options.subject,
      html: options.html,

      // NEW: use alias for internal routing / reply-to
      replyTo: options.emailAlias || undefined,

      // NEW: extra header for future proxy routing
      headers: options.emailAlias
        ? { "X-Kicbak-Email-Alias": options.emailAlias }
        : undefined,
    });

    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error);
    throw error;
  }
};
