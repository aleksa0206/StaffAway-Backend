import db from "../../config/db";
import type { LeaveRequestDb, CreateLeaveRequestDb } from "./leaves.types";

export class LeavesRepository {
  
  async create(input: CreateLeaveRequestDb): Promise<LeaveRequestDb> {
    const [id] = await db("leave_requests").insert(input);
    const created = await this.findById(Number(id));
    if (!created) throw new Error("LEAVE_REQUEST_CREATE_FAILED");
    return created;
  }

  async findById(id: number): Promise<LeaveRequestDb | undefined> {
    return db<LeaveRequestDb>("leave_requests").where({ id }).first();
  }

  async findByUserId(user_id: number): Promise<LeaveRequestDb[]> {
    return db<LeaveRequestDb>("leave_requests")
      .where({ user_id })
      .orderBy("created_at", "desc");
  }

  async getTotalUsedDays(user_id: number, type: string): Promise<number> {
    const result = await db("leave_requests")
      .where({ user_id, type, status: "approved" })
      .sum("working_days as total")
      .first();
    return Number(result?.total) || 0;
  }
}

export const leavesRepository = new LeavesRepository();