import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("leave_requests", (t) => {
    t.increments("id").primary();
    t.integer("user_id").unsigned().notNullable()
      .references("id").inTable("users").onDelete("CASCADE");
    t.enum("type", [
      "godisnji_odmor",
      "bolovanje", 
      "slobodan_dan",
      "sluzbeni_put"
    ]).notNullable();
    t.date("date_from").notNullable();
    t.date("date_to").notNullable();
    t.integer("working_days").notNullable();
    t.string("note", 500).nullable();
    t.enum("status", ["pending", "approved", "rejected"])
      .notNullable()
      .defaultTo("pending");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("leave_requests");
}