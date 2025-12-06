deno run -A .\app.ts

deno task prisma:generate

deno task prisma migrate dev

deno task prisma:studio