import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { env } from "../env";
import { ClientError } from "../errors/client-error";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { logger } from "../lib/pino";
import { prisma } from "../lib/prisma";
import { confirmTripEmail } from "../templates/confirmTripEmail";

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

      if (dayjs(endsAt).isBefore(dayjs(startsAt))) {
        throw new ClientError("Invalid trip end date");
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          startsAt,
          endsAt,
          participants: {
            createMany: {
              data: [
                {
                  name: ownerName,
                  email: ownerEmail,
                  isOwner: true,
                  isConfirmed: true,
                },
                ...emailsToInvite.map((email) => ({ email })),
              ],
            },
          },
        },
      });

      const formattedStartDate = dayjs(startsAt).format("LL");
      const formattedEndDate = dayjs(endsAt).format("LL");
      const confirmationUrl = `${env.API_BASE_URL}/trips/${trip.id}/confirm`;

      const mail = await getMailClient();

      await mail.sendMail({
        from: {
          name: "Plann.er Team",
          address: "hello@plann.er",
        },
        to: {
          name: ownerName,
          address: ownerEmail,
        },
        subject: `Confirm you trip to ${destination} on ${formattedStartDate}`,
        html: confirmTripEmail({
          destination,
          confirmationUrl,
          formattedStartDate,
          formattedEndDate,
        }),
      });

      logger.info(`Sent trip creation email to: ${ownerEmail}`);

      return reply.status(201).send({ tripId: trip.id });
    }
  );
}
