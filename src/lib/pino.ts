import pino from "pino";
import { PrettyOptions, isColorSupported } from "pino-pretty";
import { env } from "../env";
// @ts-expect-error
import supportsColor from "supports-color";

const pinoPrettyOptions: PrettyOptions = {
  colorize: true,
  ignore: "pid,hostname",
};

const pinoPretty = {
  target: "pino-pretty",
  options: pinoPrettyOptions,
};

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: supportsColor.stdout ? pinoPretty : undefined,
});
