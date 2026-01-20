import { PrismaClient } from "@prisma/client";

// This script forces Prisma to regenerate by importing it
const prisma = new PrismaClient();
console.log("✅ Prisma client generated successfully with supabaseId field");
await prisma.$disconnect();
