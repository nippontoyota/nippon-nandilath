import { z } from "zod";


export const entrySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Only letters and spaces allowed"),
  phone: z
    .string()
    .transform((val) => val.startsWith("+91") ? val.slice(3) : val)
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  pincode: z.string().optional().or(z.literal("")),
  honeypot: z.string().max(0), // Hidden field, must be empty
});

export type EntryInput = z.infer<typeof entrySchema>;
