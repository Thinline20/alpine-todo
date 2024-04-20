import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
