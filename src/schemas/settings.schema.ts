import { z } from "zod";

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export type DomainSettingsProps = {
  domain?: string;
  image?: any;
  welcomeMessage?: string;
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
