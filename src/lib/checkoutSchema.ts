import { z } from "zod";
import { SUPPORTED_ZONES } from "@/utils/shippingRules";

// ─── Kenyan phone regex ────────────────────────────────────────────────────────
// Accepts: 0712345678 | +254712345678 | 254712345678
const kenyanPhone = z
  .string()
  .min(1, "Phone number is required")
  .regex(
    /^(?:\+?254|0)[17]\d{8}$/,
    "Enter a valid Kenyan mobile number (e.g. 0712 345 678)"
  )
  .transform(v => v.replace(/[\s\-()]/g, ""));

// ─── Checkout form schema ──────────────────────────────────────────────────────
export const checkoutSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Name is too long")
    .regex(/^[A-Za-z\s'\-]+$/, "Name may only contain letters, spaces, hyphens, and apostrophes"),

  phone: kenyanPhone,

  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address")
    .max(120, "Email is too long"),

  deliveryZone: z
    .string()
    .min(1, "Please select a delivery zone")
    .refine(
      val => SUPPORTED_ZONES.includes(val as (typeof SUPPORTED_ZONES)[number]),
      { message: "Selected zone is not yet supported. Please choose another." }
    ),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address is too long"),

  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
