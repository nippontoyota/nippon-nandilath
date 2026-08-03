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
  customerLocation: z.string().min(2, "Location is required"),
  interestedInPurchase: z.enum(["Yes", "Maybe", "No"]),
  modelId: z.string().optional(),
  branchId: z.string().optional(),
  confirm: z.boolean().refine((val) => val === true, {
    message: "You must confirm that the provided information is correct",
  }),
  honeypot: z.string().max(0), // Hidden field, must be empty
}).superRefine((data, ctx) => {
  if (data.interestedInPurchase === "Yes" && (!data.modelId || data.modelId.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["modelId"],
      message: "Please select a vehicle model",
    });
  }
});

export type EntryInput = z.infer<typeof entrySchema>;
