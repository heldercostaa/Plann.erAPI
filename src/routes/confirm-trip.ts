import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import * as nodemailer from "nodemailer";
import { z } from "zod";
import { env } from "../env";
import { ClientError } from "../errors/client-error";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { logger } from "../lib/pino";
import { prisma } from "../lib/prisma";
import { confirmParticipationEmail } from "../templates/confirmParticipationEmail";

export async function confirmTrip(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/trips/:tripId/confirm",
      { schema: { params: z.object({ tripId: z.string().uuid() }) } },
      async (request, reply) => {
        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
          where: { id: tripId },
          include: {
            participants: {
              where: {
                isOwner: false,
              },
            },
          },
        });

        if (!trip) {
          throw new ClientError("Trip not found");
        }

        if (trip.isConfirmed) {
          return reply.redirect(`${env.WEB_BASE_URL}/#/trips/${tripId}`);
        }

        await prisma.trip.update({
          where: { id: tripId },
          data: { isConfirmed: true },
        });

        const formattedStartDate = dayjs(trip.startsAt).format("LL");
        const formattedEndDate = dayjs(trip.endsAt).format("LL");

        const mail = await getMailClient();

        await Promise.all(
          trip.participants.map(async (participant) => {
            const confirmationUrl = `${env.WEB_BASE_URL}/#/trips/${tripId}`;

            await mail.sendMail({
              from: {
                name: "Plann.er Team",
                address: "hello@plann.er",
              },
              to: participant.email,
              subject: `Confirm you presence to ${trip.destination} on ${formattedStartDate}`,
              html: confirmParticipationEmail({
                confirmationUrl,
                destination: trip.destination,
                formattedEndDate,
                formattedStartDate,
              }),
            });

            logger.info(`Sent participation email to: ${participant.email}`);
          })
        );

        return reply.redirect(`${env.WEB_BASE_URL}/#/trips/${tripId}`);
      }
    );
}
