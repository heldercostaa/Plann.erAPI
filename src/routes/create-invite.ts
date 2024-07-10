import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import * as nodemailer from "nodemailer";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

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
          trip_id: tripId,
        },
      });

      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient();

      const confirmationUrl = `http://localhost:3333/participants/${participant.id}/confirm`;

      const message = await mail.sendMail({
        from: {
          name: "Plann.er Team",
          address: "hello@plann.er",
        },
        to: participant.email,
        subject: `Confirm you presence to ${trip.destination} on ${formattedStartDate}`,
        html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>You were invited to participate in a trip to <strong>${trip.destination}</strong> between <strong>${formattedStartDate}</strong> and <strong>${formattedEndDate}</strong>.</p>
            <p></p>
            <p>To confirm your present in the trip, click the link below:</p>
            <p></p>
            <p>
              <a href="${confirmationUrl}>Confirm trip</a>
            </p>
            <p></p>
            <p>If you don't know what this email is about, please disconsider this message.</p>
          </div>
        `.trim(),
      });

      console.log(
        `Email preview link: ${nodemailer.getTestMessageUrl(message)}`
      );

      return reply.send({ participantId: participant.id });
    }
  );
}
