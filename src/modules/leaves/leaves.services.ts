import { leavesRepository } from "./leaves.repository";
import type { LeaveRequestDTO, CreateLeaveRequestDTO, LeaveType } from "./leaves.types";

// Balans dana po tipu odmora
const LEAVE_BALANCE: Record<LeaveType, number> = {
  godisnji_odmor: 24,
  bolovanje: 15,
  slobodan_dan: 5,
  sluzbeni_put: 30,
};

export class LeavesService {

  async createLeaveRequest(
    userId: number,
    data: CreateLeaveRequestDTO
  ): Promise<LeaveRequestDTO> {
    
    // Provjeri da li datum_od nije nakon datum_do
    if (new Date(data.date_from) > new Date(data.date_to)) {
      const err = new Error("DATE_FROM_AFTER_DATE_TO");
      (err as any).status = 400;
      throw err;
    }

    const request = await leavesRepository.create({
      user_id: userId,
      ...data,
    });

    return this.toDTO(request);
  }

  async getMyRequests(userId: number): Promise<LeaveRequestDTO[]> {
    const requests = await leavesRepository.findByUserId(userId);
    return requests.map(this.toDTO);
  }

  async getBalance(userId: number) {
    const types = Object.keys(LEAVE_BALANCE) as LeaveType[];

    const balance = await Promise.all(
      types.map(async (type) => {
        const used = await leavesRepository.getTotalUsedDays(userId, type);
        const total = LEAVE_BALANCE[type];
        return {
          type,
          used,
          total,
          remaining: total - used,
        };
      })
    );

    return balance;
  }

  private toDTO(request: any): LeaveRequestDTO {
    return {
      id: request.id,
      type: request.type,
      date_from: request.date_from,
      date_to: request.date_to,
      working_days: request.working_days,
      note: request.note,
      status: request.status,
      created_at: request.created_at,
    };
  }
}

export const leavesService = new LeavesService();