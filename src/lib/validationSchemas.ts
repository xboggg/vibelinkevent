import { z } from "zod";

// Phone number validation.
// Accepts either Ghana local (0XXXXXXXXX — 10 digits starting with 0) or
// international E.164 (+[country][number], 8–15 digits total after the +).
// Whitespace, hyphens, dots and parens are tolerated in input — we strip them
// before matching so users can type "+49 157 571 78561" or "024 581 7973"
// or "(0) 24-581-7973" without hitting a validator error.
const stripPhoneFormatting = (v: string) => v.replace(/[\s\-().]/g, "");
const isValidPhone = (v: string) => {
  const d = stripPhoneFormatting(v);
  // Ghana local: 0 followed by 9 more digits (any operator prefix accepted)
  if (/^0\d{9}$/.test(d)) return true;
  // International E.164: + followed by 8–15 digits, first digit not 0
  if (/^\+[1-9]\d{7,14}$/.test(d)) return true;
  return false;
};

const PHONE_ERROR = "Please enter a valid phone number. Ghana format: 024 XXX XXXX. International: +49 157 5717 8561 (start with +country code).";

export const eventTypeSchema = z.object({
  eventType: z.string().min(1, "Please select an event type"),
});

export const eventDetailsSchema = z.object({
  eventTitle: z.string().trim().min(1, "Event title is required").max(100, "Event title must be less than 100 characters"),
  eventDate: z.date({ required_error: "Event date is required" }),
  eventTime: z.string().optional(),
  eventVenue: z.string().trim().min(1, "Venue name is required").max(200, "Venue name must be less than 200 characters"),
  eventAddress: z.string().max(300, "Address must be less than 300 characters").optional(),
  celebrantNames: z.string().max(200, "Names must be less than 200 characters").optional(),
  additionalInfo: z.string().max(1000, "Additional info must be less than 1000 characters").optional(),
});

export const styleColorsSchema = z.object({
  colorPalette: z.string().min(1, "Please select a color palette"),
  stylePreference: z.string().min(1, "Please select a design style"),
  customColors: z.array(z.string()).optional(),
  designNotes: z.string().max(1000, "Design notes must be less than 1000 characters").optional(),
});

export const packageSchema = z.object({
  selectedPackage: z.string().min(1, "Please select a package"),
});

export const timelineSchema = z.object({
  deliveryUrgency: z.enum(["standard", "rush"]),
  preferredDeliveryDate: z.date().nullable().optional(),
});

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().min(1, "Email address is required").email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(1, "Phone number is required").refine(isValidPhone, { message: PHONE_ERROR }),
  whatsapp: z.string().refine((v) => v === "" || isValidPhone(v), { message: PHONE_ERROR }).optional().or(z.literal("")),
  hearAboutUs: z.string().optional(),
});

export const fullOrderSchema = z.object({
  eventType: z.string().min(1, "Please select an event type"),
  eventTitle: z.string().trim().min(1, "Event title is required"),
  eventDate: z.date({ required_error: "Event date is required" }),
  eventTime: z.string().optional(),
  eventVenue: z.string().trim().min(1, "Venue name is required"),
  eventAddress: z.string().optional(),
  celebrantNames: z.string().optional(),
  additionalInfo: z.string().optional(),
  colorPalette: z.string().min(1, "Please select a color palette"),
  stylePreference: z.string().min(1, "Please select a design style"),
  customColors: z.array(z.string()).optional(),
  designNotes: z.string().optional(),
  selectedPackage: z.string().min(1, "Please select a package"),
  selectedAddOns: z.array(z.string()),
  deliveryUrgency: z.enum(["standard", "rush"]),
  preferredDeliveryDate: z.date().nullable().optional(),
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone number is required"),
  whatsapp: z.string().optional(),
  hearAboutUs: z.string().optional(),
  referenceImages: z.array(z.any()).optional(),
});

export type EventTypeFormData = z.infer<typeof eventTypeSchema>;
export type EventDetailsFormData = z.infer<typeof eventDetailsSchema>;
export type StyleColorsFormData = z.infer<typeof styleColorsSchema>;
export type PackageFormData = z.infer<typeof packageSchema>;
export type TimelineFormData = z.infer<typeof timelineSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
