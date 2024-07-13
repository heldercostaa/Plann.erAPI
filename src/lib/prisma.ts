import { PrismaClient } from "@prisma/client";
import { env } from "../env";

export const prisma = new PrismaClient({
  log: env.DB_LOG_LEVEL ? [env.DB_LOG_LEVEL] : [],
});
