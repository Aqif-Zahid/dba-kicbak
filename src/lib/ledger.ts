import { z } from "zod";
import { RewardsReason } from "@prisma/client";

/**
 * Centralized Error Type
 */
export class AppError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const wrapError = (e: unknown, fallbackMessage: string, code: string): never => {
  if (e instanceof AppError) throw e;
  if (e instanceof z.ZodError) {
    throw new AppError(400, "VALIDATION_ERROR", e.message);
  }
  const msg = (e as any)?.message || fallbackMessage;
  throw new AppError(500, code, msg);
};

/**
 * Validation Schemas
 */
export const transactionSchema = z.object({
  debitId: z.number().int().positive(),
  creditId: z.number().int().positive(),
  amount: z.number().positive().finite(),
  reason: z.nativeEnum(RewardsReason),
  refId: z.number().int().positive().optional(),
});

export const userIdSchema = z.number().int().positive();

export const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((v) => v.startDate <= v.endDate, {
    message: "startDate must be less than or equal to endDate",
    path: ["startDate"],
  });

/**
 * Util: safe numeric conversion for bigint/Decimal/string → number
 */
export const toNumberSafe = (v: unknown): number => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v);
  if (typeof v === "object" && "toNumber" in (v as any) && typeof (v as any).toNumber === "function") {
    return (v as any).toNumber();
  }
  return Number(v);
};
