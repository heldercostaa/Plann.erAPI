import { PrismaClient } from "@prisma/client";
import { env } from "../env";

export const prisma = new PrismaClient({
  log: env.DATABASE_LOG_LEVEL ? [env.DATABASE_LOG_LEVEL] : [],
});
