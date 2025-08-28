// Basic email service for sending employee invitations
// In a production environment, you would use a proper email service like SendGrid, Mailgun, etc.
import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";

interface EmailData {
  to: string;
  subject: string;
  employeeName: string;
  companyName: string;
  tempPassword: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(data: EmailData) {
  try {
    const { error } = await resend.emails.send({
      from: "Calendary <calendary@cinebase.pl>",
      to: [data.to],
      subject: data.subject,
      react: EmailTemplate({
        companyName: data.companyName,
        employeeName: data.employeeName,
        email: data.to,
        tempPassword: data.tempPassword,
      }),
    });

    if (error) {
      console.error("Email sending error:", error);
      return { success: false, message: "Nie udało się wysłać emaila" };
    }

    return { success: true, message: "Email został wysłany" };
  } catch (error) {
    console.error("Email sending error:", error);
  }
}
