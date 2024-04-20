import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    DATABASE_URL: z.string().min(1),
  },
  runtimeEnv: import.meta.env,
});
