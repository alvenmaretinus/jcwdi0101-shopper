import nodemailer from "nodemailer";
export type SendEmailVerification = {
  url: string;
  email: string;
  subject: string;
  text: string;
};
import { getVerificationTemplate } from "./VerificationEmailTemplate";

export const sendEmailVerification = async ({
  url,
  email,
  subject,
  text,
}: SendEmailVerification) => {
  const googleEmail = process.env.GOOGLE_APP_EMAIL;
  const googlePassword = process.env.GOOGLE_APP_PASSWORD;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleEmail,
      pass: googlePassword,
    },
  });

  await transporter.sendMail({
    from: `SHOPPER Team <${googleEmail}>`, // sender address
    to: email,
    subject,
    text,
    html: getVerificationTemplate(url), // html body
  });
};
