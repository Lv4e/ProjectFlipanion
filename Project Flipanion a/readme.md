deno run -A .\app.ts

deno task prisma:generate

deno task prisma migrate dev
