import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

export async function removeActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/activities/:activityId",
    {
      schema: {
        params: z.object({ activityId: z.string().uuid() }),
      },
    },
    async (request, reply) => {
      const { activityId } = request.params;

      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
      });

      if (!activity) {
        throw new ClientError("Activity not found");
      }

      await prisma.activity.delete({
        where: { id: activityId },
      });

      return reply.send();
    }
  );
}
