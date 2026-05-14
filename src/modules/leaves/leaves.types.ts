export type LeaveType = 
  | "godisnji_odmor"
  | "bolovanje"
  | "slobodan_dan"
  | "sluzbeni_put";

export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveRequestDb = {
  id: number;
  user_id: number;
  type: LeaveType;
  date_from: string;
  date_to: string;
  working_days: number;
  note: string | null;
  status: LeaveStatus;
  created_at?: string;
};

export type CreateLeaveRequestDb = {
  user_id: number;
  type: LeaveType;
  date_from: string;
  date_to: string;
  working_days: number;
  note?: string | null;
};

export type LeaveRequestDTO = {
  id: number;
  type: LeaveType;
  date_from: string;
  date_to: string;
  working_days: number;
  note: string | null;
  status: LeaveStatus;
  created_at?: string;
};

export type CreateLeaveRequestDTO = {
  type: LeaveType;
  date_from: string;
  date_to: string;
  working_days: number;
  note?: string | null;
};