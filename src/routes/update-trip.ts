import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
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
        throw new ClientError("Trip not found");
      }

      if (dayjs(startsAt).isBefore(new Date())) {
        throw new ClientError("Invalid trip start date");
      }

      if (dayjs(endsAt).isBefore(dayjs(startsAt))) {
        throw new ClientError("Invalid trip end date");
      }

      if (dayjs(endsAt).isBefore(trip.startsAt)) {
        throw new ClientError("Invalid trip end date");
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          startsAt,
          endsAt,
        },
      });

      return reply.send({ tripId: trip.id });
    }
  );
}
