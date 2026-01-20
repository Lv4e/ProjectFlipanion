import { PrismaClient } from "./client/client.ts";
import { load } from "jsr:@std/dotenv";

await load({ export: true });

const prisma = new PrismaClient();

async function checkMigration() {
    console.log("🔍 Checking if supabaseId column exists in Supabase...\n");
    
    try {
        // Check if the column exists
        const result = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'User' 
            AND column_name = 'supabaseId';
        `;
        
        if (Array.isArray(result) && result.length > 0) {
            console.log("✅ Column exists in Supabase!");
            console.log("Column details:", result[0]);
        } else {
            console.log("❌ Column NOT found in Supabase");
            console.log("\n🔧 Let me apply the migration now...");
            
            await prisma.$executeRaw`
                ALTER TABLE "User" ADD COLUMN "supabaseId" TEXT;
            `;
            
            await prisma.$executeRaw`
                CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");
            `;
            
            console.log("✅ Migration applied to Supabase successfully!");
        }
        
        console.log("\n📋 Next: Run supabase-sync.sql in Supabase Dashboard");
        
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkMigration();
