import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId",
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        body: z.object({
          destination: z.string().min(4).optional(),
          startsAt: z.coerce.date().optional(),
          endsAt: z.coerce.date().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { destination, startsAt, endsAt } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        return reply.status(400).send({ message: "Trip not found" });
      }

      if (dayjs(startsAt).isBefore(new Date())) {
        return reply.status(400).send({ message: "Invalid trip start date" });
      }

      if (dayjs(endsAt).isBefore(dayjs(startsAt))) {
        return reply.status(400).send({ message: "Invalid trip end date" });
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          starts_at: startsAt,
          ends_at: endsAt,
        },
      });

      return reply.send({ tripId: trip.id });
    }
  );
}
