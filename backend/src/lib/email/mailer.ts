import nodemailer from "nodemailer";
import { getVerificationTemplate } from "./VerificationEmailTemplate";
import { getResetPasswordTemplate } from "./getResetPasswordTemplate";

const googleEmail = process.env.GOOGLE_APP_EMAIL;
const googlePassword = process.env.GOOGLE_APP_PASSWORD;

export type SendEmailVerification = {
  url: string;
  email: string;
  subject: string;
  text: string;
};
export const sendEmailVerification = async ({
  url,
  email,
  subject,
  text,
}: SendEmailVerification) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleEmail,
      pass: googlePassword,
    },
  });

  await transporter.sendMail({
    from: `SHOPPER Team`,
    to: email,
    subject,
    text,
    html: getVerificationTemplate(url),
  });
};

export type SendResetPasswordEmail = {
  url: string;
  email: string;
  subject: string;
  text: string;
};
export const sendResetPasswordEmail = async ({
  url,
  email,
  subject,
  text,
}: SendResetPasswordEmail) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleEmail,
      pass: googlePassword,
    },
  });

  await transporter.sendMail({
    from: `SHOPPER Team`,
    to: email,
    subject,
    text,
    html: getResetPasswordTemplate(url),
  });
};
