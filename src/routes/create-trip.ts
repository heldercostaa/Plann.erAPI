import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          startsAt: z.coerce.date(),
          endsAt: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { destination, startsAt, endsAt } = request.body;

      if (dayjs(startsAt).isBefore(new Date())) {
        return reply.status(400).send({ message: "Invalid trip start date" });
      }

      if (dayjs(endsAt).isBefore(dayjs(startsAt))) {
        return reply.status(400).send({ message: "Invalid trip end date" });
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at: startsAt,
          ends_at: endsAt,
        },
      });

      return reply.status(201).send({ id: trip.id });
    }
  );
}
