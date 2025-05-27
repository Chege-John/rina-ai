/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export const MAX_UPLOAD_SIZE = 2 * 1024 * 1024; // 2MB in bytes
export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export type DomainSettingsProps = {
  domain?: string;
  image?: any;
  welcomeMessage?: string;
};

export type HelpDeskQuestionsProps = {
  question: string;
  answer: string;
};

export type AddProductProps = z.infer<typeof AddProductSchema>;

export type FilterQuestionsProps = {
  question: string;
};

export const AddDomainSchema = z.object({
  domain: z
    .string()
    .min(4, { message: "A domain must have atleast 3 characters" })
    .refine(
      (value) =>
        /((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,3}$/.test(value ?? ""),
      "This is not a valid domain"
    ),
  image: z
    .any()
    .refine((files) => files?.[0]?.size <= MAX_UPLOAD_SIZE, {
      message: "Your file size must be less than 2MB",
    })
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), {
      message: "Only JPG, JPEG & PNG are accepted file formats",
    }),
});

export const DomainSettingsSchema = z
  .object({
    domain: z
      .string()
      .min(4, { message: "A domain must have at least 3 characters" })
      .refine(
        (value) =>
          /((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,3}$/.test(value ?? ""),
        "This is not a valid domain"
      )
      .optional()
      .or(z.literal("").transform(() => undefined)),
    image: z.any().optional(),
    welcomeMessage: z
      .string()
      .min(6, "The message must be at least 6 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine(
    (schema) => {
      if (schema.image?.length) {
        return (
          ACCEPTED_FILE_TYPES.includes(schema.image[0]?.type) &&
          schema.image[0]?.size <= MAX_UPLOAD_SIZE
        );
      }
      return true; // If no image is provided, validation passes
    },
    {
      message:
        "The file must be less than 2Mb, and only JPG, JPEG & PNG are accepted file formats",
      path: ["image"],
    }
  );

export const HelpDeskQuestionsSchema = z.object({
  question: z.string().min(1, { message: "Question cannot be left empty" }),
  answer: z.string().min(1, "Answer cannot be left empty"),
});

export const FilterQuestionsSchema = z.object({
  question: z.string().min(1, { message: "Question cannot be left empty" }),
});

export const AddProductSchema = z
  .object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    image: z.any(),
    price: z
      .string()
      .min(1, { message: "Price is required" })
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Price must be a valid positive number",
      }), // Remove the .transform() - keep as string
  })
  .refine(
    (schema) => {
      if (schema.image?.length) {
        return (
          ACCEPTED_FILE_TYPES.includes(schema.image[0]?.type) &&
          schema.image[0]?.size <= MAX_UPLOAD_SIZE
        );
      }
      return schema.image?.length > 0;
    },
    {
      message:
        "Image is required. File must be less than 2MB, and only JPG, JPEG & PNG are accepted file formats",
      path: ["image"],
    }
  );
