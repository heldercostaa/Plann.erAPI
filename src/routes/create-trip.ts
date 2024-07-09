import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          startsAt: z.coerce.date(),
          endsAt: z.coerce.date(),
          ownerName: z.string(),
          ownerEmail: z.string().email(),
          emailsToInvite: z.array(z.string().email()),
        }),
      },
    },
    async (request, reply) => {
      const {
        destination,
        startsAt,
        endsAt,
        ownerName,
        ownerEmail,
        emailsToInvite,
      } = request.body;

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
          participants: {
            createMany: {
              data: [
                {
                  name: ownerName,
                  email: ownerEmail,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emailsToInvite.map((email) => ({ email })),
              ],
            },
          },
        },
      });

      return reply.status(201).send({ id: trip.id });
    }
  );
}
