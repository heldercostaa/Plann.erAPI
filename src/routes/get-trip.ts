import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId",
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: true,
          activities: { orderBy: { occurs_at: "asc" } },
          links: true,
        },
      });

      if (!trip) {
        return reply.status(400).send({ message: "Trip not found" });
      }

      return reply.send({ trip });
    }
  );
}
