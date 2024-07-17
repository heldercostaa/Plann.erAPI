import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { env } from "../env";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/participants/:participantId/confirm",
    {
      schema: {
        params: z.object({ participantId: z.string().uuid() }),
        body: z.object({
          name: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params;
      const { name } = request.body;

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        throw new ClientError("Participant not found");
      }

      await prisma.participant.update({
        where: { id: participantId },
        data: { isConfirmed: true, name },
      });

      return reply.send();
    }
  );
}
