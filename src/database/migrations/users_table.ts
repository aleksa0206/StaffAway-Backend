import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

    

  await knex.schema.createTable("users", (t) => {
    t.increments("id").primary();
    t.string("email", 255).notNullable().unique();
    t.string("name", 255).nullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
