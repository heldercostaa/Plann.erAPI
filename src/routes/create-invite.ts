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

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        body: z.object({ email: z.string().email() }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { email } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          tripId,
        },
      });

      const formattedStartDate = dayjs(trip.startsAt).format("LL");
      const formattedEndDate = dayjs(trip.endsAt).format("LL");

      const mail = await getMailClient();

      const confirmationUrl = `${env.WEB_BASE_URL}/#/trips/${tripId}`;

      await mail.sendMail({
        from: {
          name: "Plann.er Team",
          address: "hello@plann.er",
        },
        to: participant.email,
        subject: `Confirm your presence to ${trip.destination} on ${formattedStartDate}`,
        html: confirmParticipationEmail({
          confirmationUrl,
          destination: trip.destination,
          formattedEndDate,
          formattedStartDate,
        }),
      });

      logger.info(`Sent participation email to: ${participant.email}`);

      return reply.send({ participantId: participant.id });
    }
  );
}
