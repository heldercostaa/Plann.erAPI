import * as nodemailer from "nodemailer";
import { env } from "../env";

export async function getMailClient() {
  const account = await nodemailer.createTestAccount();
  let user = account.user;
  let pass = account.pass;

  if (env.NODE_ENV === "production") {
    user = env.EMAIL_LOGIN || user;
    pass = env.EMAIL_PASSWORD || pass;
  }

  console.log("[DEBUG] user: ", user);
  console.log("[DEBUG] pass: ", pass);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  return transporter;
}
