import { z } from "zod";

export const createLeaveRequestSchema = z.object({
  type: z.enum([
    "godisnji_odmor",
    "bolovanje",
    "slobodan_dan",
    "sluzbeni_put"
  ]),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format mora biti YYYY-MM-DD"),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format mora biti YYYY-MM-DD"),
  working_days: z.number().int().min(1),
  note: z.string().max(500).nullable().optional(),
});