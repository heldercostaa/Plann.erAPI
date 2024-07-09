import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import * as nodemailer from "nodemailer";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
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

      const formattedStartDate = dayjs(startsAt).format("LL");
      const formattedEndDate = dayjs(endsAt).format("LL");
      const confirmationUrl = `http://localhost:3333/trips/${trip.id}/confirm`;

      const mail = await getMailClient();

      const message = await mail.sendMail({
        from: {
          name: "Plann.er Team",
          address: "hello@plann.er",
        },
        to: {
          name: ownerName,
          address: ownerEmail,
        },
        subject: `Confirm you trip to ${destination} on ${formattedStartDate}`,
        html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>You requested a trip creation to <strong>${destination}</strong> between <strong>${formattedStartDate}</strong> and <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>To confirm and plan your trip, click the link below:</p>
          <p></p>
          <p>
            <a href="${confirmationUrl} target="_blank">Confirm trip</a>
          </p>
          <p></p>
          <p>If you don't know what this email is about, please disconsider this message.</p>
        </div>
        `.trim(),
      });

      console.log(
        `Email preview link: ${nodemailer.getTestMessageUrl(message)}`
      );

      return reply.status(201).send({ id: trip.id });
    }
  );
}
