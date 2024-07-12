import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ClientError } from "./errors/client-error";
import { logger } from "./lib/pino";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    logger.error(error.flatten().fieldErrors);
    return reply
      .status(400)
      .send({ message: "Invalid input", errors: error.flatten().fieldErrors });
  }

  if (error instanceof ClientError) {
    logger.error(error.message);
    return reply.status(400).send({ message: error.message });
  }

  logger.fatal(error);
  return reply.status(500).send({ message: "Internal server error" });
};
