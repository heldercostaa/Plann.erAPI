import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
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
        return reply.status(400).send({ message: "Trip not found" });
      }

      if (dayjs(occursAt).isBefore(dayjs(trip.starts_at))) {
        return reply.status(400).send({ message: "Invalid activity date" });
      }

      if (dayjs(occursAt).isAfter(dayjs(trip.ends_at))) {
        return reply.status(400).send({ message: "Invalid activity date" });
      }

      const activity = await prisma.activity.create({
        data: { title, occurs_at: occursAt, trip_id: tripId },
      });

      return reply.status(201).send({ id: activity.id });
    }
  );
}
