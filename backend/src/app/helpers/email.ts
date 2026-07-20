import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || process.env.EMAIL || "",
    pass: process.env.EMAIL_PASS || process.env.APP_PASSWORD || "",
  },
});

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetLink = `${process.env.RESET_PASSWORD_LINK || "http://localhost:3001/reset-password"}?token=${token}`;

  const mailOptions = {
    from: `"Kinenao Grocery" <${process.env.EMAIL_USER || process.env.EMAIL}>`,
    to: email,
    subject: "Reset Your Password - Kinenao Grocery",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2e7d32; text-align: center;">Kinenao Grocery</h2>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p>Hello,</p>
        <p>You requested a password reset. Please click the button below to reset your password. This link is valid for 5 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #555;">${resetLink}</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} Kinenao Grocery Ltd. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
