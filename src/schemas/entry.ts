import { z } from "zod";

const VIN_CHARSET = /^[A-HJ-NPR-Z0-9]{17}$/;

export const entrySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Only letters and spaces allowed"),
  phone: z
    .string()
    .transform((val) => val.startsWith("+91") ? val.slice(3) : val)
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")),
  modelId: z.string().min(1, "Select a model"),
  colourId: z.string().min(1, "Select a colour"),
  vin: z
    .string()
    .length(17, "VIN must be exactly 17 characters")
    .regex(VIN_CHARSET, "VIN contains invalid characters"),
  branchId: z.string().optional(),
  confirm: z.boolean().refine((val) => val === true, {
    message: "You must confirm that the provided information is correct",
  }),
  honeypot: z.string().max(0), // Hidden field, must be empty
});

export type EntryInput = z.infer<typeof entrySchema>;
