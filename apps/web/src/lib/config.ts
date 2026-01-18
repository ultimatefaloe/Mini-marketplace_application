import { z } from "zod";

// ---- Define schema for strict env validation ---- //
const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// ---- Parse and validate ---- //
const parsed = envSchema.safeParse({
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const config = parsed.data;
