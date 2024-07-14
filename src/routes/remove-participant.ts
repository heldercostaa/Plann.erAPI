import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

export async function removeParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/participants/:participantsId",
    {
      schema: {
        params: z.object({ participantsId: z.string().uuid() }),
      },
    },
    async (request, reply) => {
      const { participantsId } = request.params;

      const participant = await prisma.participant.findUnique({
        where: { id: participantsId },
      });

      if (!participant) {
        throw new ClientError("Participant not found");
      }

      await prisma.participant.delete({
        where: { id: participantsId },
      });

      return reply.send();
    }
  );
}
