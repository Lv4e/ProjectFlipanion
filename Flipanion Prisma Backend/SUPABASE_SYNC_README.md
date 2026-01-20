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
