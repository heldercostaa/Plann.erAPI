import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("production"),
    DB_URL: z.string().url(),
    DB_LOG_LEVEL: z.enum(["query", "info", "warn", "error"]).default("info"),
    API_BASE_URL: z.string().url(),
    WEB_BASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3333),
    LOG_LEVEL: z
      .enum(["silent", "trace", "debug", "info", "warn", "error", "fatal"])
      .default("info"),
    EMAIL_LOGIN: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
  })
  .refine(
    (env) =>
      !(
        env.NODE_ENV === "production" &&
        (!env.EMAIL_LOGIN || !env.EMAIL_PASSWORD)
      ),
    {
      message:
        "Email login and password must be provided on production environment",
      path: ["EMAIL_LOGIN", "EMAIL_PASSWORD"],
    }
  );

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(
    "❗ Invalid environment variables: ",
    _env.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
