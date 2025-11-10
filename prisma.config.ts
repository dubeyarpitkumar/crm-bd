// 👇 यह लाइन सबसे ऊपर जोड़ें
import "dotenv/config"; 

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"), // अब यह DATABASE_URL को .env से उठाएगा
  },
});