import db from "../../config/db";
import type { CreateUserDb, UserDb } from "./users.types";

export class UsersRepository {
  async findById(id: number): Promise<UserDb | undefined> {
    return db<UserDb>("users").where({ id }).first();
  }

  async findByEmail(email: string): Promise<UserDb | undefined> {
    return db<UserDb>("users").where({ email }).first();
  }

  async create(input: CreateUserDb): Promise<UserDb> {
    const [id] = await db("users").insert(input);
    const created = await this.findById(Number(id));
    if (!created) throw new Error("USER_CREATE_FAILED");
    return created;
  }
}

// Singleton instance - DODAJ OVO:
export const usersRepository = new UsersRepository();