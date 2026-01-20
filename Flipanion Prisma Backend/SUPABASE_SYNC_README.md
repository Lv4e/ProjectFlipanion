## How It Works Now

### On User Signup (Automatic)
1. User signs up via Supabase Auth
2. Supabase creates record in `auth.users`
3. **Trigger automatically creates record in your `User` table** ✨
4. Your app can now use your `User` table normally

### Querying Users

**By Supabase ID (recommended):**
```typescript
const user = await prisma.user.findUnique({
  where: { supabaseId: "5f54219c-b8dc-41f5-a71e-1ea248d8aee2" }
});
```

**By Email:**
```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
});
```

---

## Files Created

- `schema.prisma` - Updated with supabaseId field
- `migrations/20260120000000_add_supabase_id/migration.sql` - Database migration
- `supabase-sync.sql` - **RUN THIS IN SUPABASE!**
- `apply-migration.ts` - Migration script (already executed)

---

## What to Do Next

1. ✅ Run `supabase-sync.sql` in Supabase Dashboard
2. Test signup with a new user
3. Verify user appears in both:
   - Supabase → Authentication → Users
   - Your `User` table (check with Prisma Studio: `deno task prisma:studio`)

---

## Important Notes

- ✅ Your database is connected via `.env` (DATABASE_URL, DIRECT_URL)
- ✅ Migration applied to Supabase PostgreSQL
- ✅ Prisma client regenerated with new field
- ⚠️ **You still need to run `supabase-sync.sql` in Supabase Dashboard!**
