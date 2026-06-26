import { z } from "zod";

/** Validation schema for the company profile form. */
export const companySchema = z.object({
  logo: z.string().optional(),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name is required")
    .max(120, "Too long"),
  ownerName: z.string().trim().max(120, "Too long").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number is required")
    .max(20, "Too long"),
  alternatePhone: z
    .string()
    .trim()
    .max(20, "Too long")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  website: z.string().trim().max(160).optional().or(z.literal("")),
  address: z.string().trim().min(3, "Address is required").max(400),
  termsAndConditions: z.string().max(4000).optional().or(z.literal("")),
  bankDetails: z.string().max(1000).optional().or(z.literal("")),
  upiQr: z.string().optional(),
  signature: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
