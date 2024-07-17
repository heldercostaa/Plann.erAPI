import * as nodemailer from "nodemailer";
import { env } from "../env";

export async function getMailClient() {
  const account = await nodemailer.createTestAccount();
  let user = account.user;
  let pass = account.pass;
  let host = "smtp.ethereal.email";
  let secure = false;
  let port: number | undefined = undefined;

  if (env.NODE_ENV === "production") {
    user = env.EMAIL_LOGIN || user;
    pass = env.EMAIL_PASSWORD || pass;
    host = "smtp.gmail.com";
    secure = true;
    port = 465;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}
