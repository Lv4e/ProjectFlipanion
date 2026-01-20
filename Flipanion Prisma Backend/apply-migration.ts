import { PrismaClient } from "./client/client.ts";
import { load } from "jsr:@std/dotenv";

await load({ export: true });

const prisma = new PrismaClient();

async function migrate() {
    console.log("🔄 Applying migration: add_supabase_id...");
    
    try {
        // Apply the migration SQL
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseId" TEXT;
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseId_key" ON "User"("supabaseId");
        `);
        
        console.log("✅ Migration applied successfully!");
        console.log("\n📋 Next steps:");
        console.log("1. Go to Supabase Dashboard → SQL Editor");
        console.log("2. Run the SQL in: supabase-sync.sql");
        console.log("   This will:");
        console.log("   - Create trigger to sync new signups");
        console.log("   - Backfill existing Supabase users");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
