import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        body: z.object({
          title: z.string().min(4),
          occursAt: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { title, occursAt } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      if (dayjs(occursAt).isAfter(dayjs(trip.endsAt))) {
        throw new ClientError("Invalid activity date");
      }

      const activity = await prisma.activity.create({
        data: { title, occursAt, tripId },
      });

      return reply.status(201).send({ activityId: activity.id });
    }
  );
}
