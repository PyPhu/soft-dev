import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email to any friend when they are invited.
 */
export async function sendInvitationEmail(toEmail: string, senderName: string, sport: string) {
  try {
    await transporter.sendMail({
      from: `"Sports Booking" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `New Invite: ${sport} with ${senderName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
          <h2 style="color: #0070f3;">Reservation Invitation</h2>
          <p><strong>${senderName}</strong> has invited you to a <strong>${sport}</strong> session.</p>
          <p>Click below to view your dashboard and Accept or Decline:</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/reservations" 
             style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; border-radius: 0.5rem; text-decoration: none; font-weight: bold;">
            View Invitation
          </a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Invitation Error:", error);
    return { success: false };
  }
}

/**
 * Sends an email to the Host when a friend accepts.
 */
export async function sendAcceptanceEmail(hostEmail: string, participantName: string, sport: string) {
  try {
    await transporter.sendMail({
      from: `"Sports Booking" <${process.env.EMAIL_USER}>`,
      to: hostEmail,
      subject: `Joined! ${participantName} is in for ${sport}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
          <h2 style="color: #10b981;">New Participant Joined!</h2>
          <p>Great news! <strong>${participantName}</strong> has accepted your invitation to play <strong>${sport}</strong>.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/reservations" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 0.5rem; text-decoration: none; font-weight: bold;">
            Check Reservation
          </a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Acceptance Error:", error);
    return { success: false };
  }
}

/**
 * Sends an email to the Host when a friend declines.
 */
export async function sendDeclineEmail(hostEmail: string, participantName: string, sport: string) {
  try {
    await transporter.sendMail({
      from: `"Sports Booking" <${process.env.EMAIL_USER}>`,
      to: hostEmail,
      subject: `Update: ${participantName} declined for ${sport}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
          <h2 style="color: #ef4444;">Invitation Declined</h2>
          <p>Hi, <strong>${participantName}</strong> has declined your invitation for <strong>${sport}</strong>.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Decline Error:", error);
    return { success: false };
  }
}