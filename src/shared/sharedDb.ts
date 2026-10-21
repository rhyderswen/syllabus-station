import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prismaGlobal: PrismaClient = new PrismaClient({
  adapter: adapter,
  log:
    process.env.NODE_ENV === "production"
      ? ["error"]
      : ["query", "error", "warn", "info"],
});
