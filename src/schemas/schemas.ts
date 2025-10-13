import { z } from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .min(4, "Invalid user name")
    .max(50, "Username can not be more than 50 characters"),
  displayName: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name can not be more than 50 characters"),
  bio: z
    .string()
    .max(255, "Bio can not be more than 255 characters")
    .optional(),
  role: z.string().optional(),
  profilePicture: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});
