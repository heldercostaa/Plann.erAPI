import cors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { errorHandler } from "./error-handler";
import { logger } from "./lib/pino";
import { confirmParticipant } from "./routes/confirm-participant";
import { confirmTrip } from "./routes/confirm-trip";
import { createActivity } from "./routes/create-activity";
import { createInvite } from "./routes/create-invite";
import { createLink } from "./routes/create-link";
import { createTrip } from "./routes/create-trip";
import { getActivities } from "./routes/get-activities";
import { getLinks } from "./routes/get-links";
import { getParticipant } from "./routes/get-participant";
import { getParticipants } from "./routes/get-participants";
import { getTrip } from "./routes/get-trip";
import { removeActivity } from "./routes/remove-activity";
import { removeParticipant } from "./routes/remove-participant";
import { updateTrip } from "./routes/update-trip";

export const app = fastify();

app.addHook("preHandler", async (request, reply) => {
  logger.trace(`[${request.method}] ${request.url}`);
});

app.register(cors, { origin: "*" });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);
app.register(getTrip);
app.register(getParticipants);
app.register(createInvite);
app.register(updateTrip);
app.register(getParticipant);
app.register(removeParticipant);
app.register(removeActivity);
