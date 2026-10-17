The database schema is in `prisma/schema.prisma` and defined using the [Prisma ORM](https://www.prisma.io/).

You can generate the database client using `pnpm run prisma:generate`.

You can then create a database using `pnpm run prisma:dev` and then taking the database connection URL and adding it to .env. See .env.example for an example.

You can then run the server using `pnpm run dev` and everything should be working.