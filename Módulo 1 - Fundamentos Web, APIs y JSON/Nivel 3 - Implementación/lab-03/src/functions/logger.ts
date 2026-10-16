import { appendFile, mkdir } from "node:fs/promises";

import type { LogLevels } from "../types/logLevel.ts";

const log_directory: string = `${process.env.RESULTS_DIRECTORY + "logs"}`;
const log_file: string = `${log_directory + "/paginationsProcess.log"}`;

async function writeLog(
  level: LogLevels,
  message: string,
  data?: Record<string, unknown>,
): Promise<void> {
  await mkdir(`${log_directory}`, { recursive: true });

  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };

  await appendFile(log_file, JSON.stringify(log) + "\n", "utf8");
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) =>
    writeLog("INFO", message, data),
  warn: (message: string, data?: Record<string, unknown>) =>
    writeLog("WARN", message, data),
  error: (message: string, data?: Record<string, unknown>) =>
    writeLog("ERROR", message, data),
  debug: (message: string, data?: Record<string, unknown>) =>
    writeLog("DEBUG", message, data),
};
