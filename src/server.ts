import { app } from "./app";
import { env } from "./env";
import { logger } from "./lib/pino";

app.listen({ port: env.PORT }).then(() => {
  logger.info("🚀 Server running!");
});
