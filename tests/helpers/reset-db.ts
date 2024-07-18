import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function resetDb() {
  await prisma.$transaction([
    prisma.link.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.participant.deleteMany(),
    prisma.trip.deleteMany(),
  ]);
}
