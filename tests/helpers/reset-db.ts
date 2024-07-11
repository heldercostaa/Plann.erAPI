import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const prisma = new PrismaClient();

async function resetDb() {
  await prisma.$transaction([
    prisma.link.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.participant.deleteMany(),
    prisma.trip.deleteMany(),
  ]);
}

export default async () => {
  try {
    await resetDb();
  } catch (err) {
    execSync(`npx prisma migrate deploy`, { stdio: "inherit" });
    await resetDb();
  }
};
