/**
 * Generates the HTML for the invitation email with a dynamic signup link.
 * @param {string} signupUrl The unique URL for the user to complete their registration.
 * @returns {string} The full HTML string for the email body.
 */
export const InviteTemplate = (signupUrl: string): string => {
  return `
    <div style="font-family: sans-serif; background-color: #f6f6f6; padding: 20px;">
      <div style="background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">
        <h1 style="font-size: 24px; font-weight: bold; color: #1f2937;">
          Your Invitation Has Been Approved!
        </h1>
        <p style="font-size: 16px; line-height: 24px; color: #4b5563;">
          Hello,
        </p>
        <p style="font-size: 16px; line-height: 24px; color: #4b5563;">
          Your invite request has been approved. You can now complete your account setup and join our community.
        </p>
        <p style="font-size: 16px; line-height: 24px; color: #4b5563;">
          To get started, please click the button below to set your password and complete your registration.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a
            href="${signupUrl}"
            style="background-color: #2563eb; color: #ffffff; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; transition: transform 200ms ease-in-out;"
          >
            Complete Your Account
          </a>
        </div>
        <p style="font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
          If the button doesn't work, copy and paste the following link into your browser:
          <br />
          <a href="${signupUrl}" style="word-break: break-all; color: #6b7280;">
            ${signupUrl}
          </a>
        </p>
      </div>
    </div>
  `;
};

export default InviteTemplate;
