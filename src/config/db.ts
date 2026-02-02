import knex, { type Knex } from "knex";
import { env } from "./env";

export const db: Knex = knex({
  client: "mysql2",
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  pool: { min: 2, max: 10 },
});

export default db;
