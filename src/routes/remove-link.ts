import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

export async function removeLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/links/:linkId",
    {
      schema: {
        params: z.object({ linkId: z.string().uuid() }),
      },
    },
    async (request, reply) => {
      const { linkId } = request.params;

      const link = await prisma.link.findUnique({
        where: { id: linkId },
      });

      if (!link) {
        throw new ClientError("Link not found");
      }

      await prisma.link.delete({
        where: { id: linkId },
      });

      return reply.send();
    }
  );
}
