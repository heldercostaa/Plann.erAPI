import pino from "pino";
import { PrettyOptions } from "pino-pretty";
import { env } from "../env/index.js";

const pinoPrettyOptions: PrettyOptions = {
  colorize: true,
  ignore: "pid,hostname",
};

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: pinoPrettyOptions,
  },
});
