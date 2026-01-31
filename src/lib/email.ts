import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
) {
  const VerificationLink = `${process.env.BASE_URL}/auth/new-verification?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Email Verification For Testing",
    html: `<h2>Email Verification</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${VerificationLink}">Verify Email</a>
        <p>Or copy and paste this link: ${VerificationLink}</p>
        <p>This link will expire in hour.</p>`,
  };

  try {
    console.log("Transporter created, attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification Mail sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending Verification email:", error);
    throw error;
  }
}
