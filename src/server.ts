import { app } from "./app";
import { env } from "./env";
import { logger } from "./lib/pino";

app.listen({ host: "0.0.0.0", port: env.PORT }).then(() => {
  logger.info(`🚀 Server running!`);
});
