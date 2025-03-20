import { z, ZodType } from "zod";
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from "./settings.schema";

export type ConversationSearchProps = {
  query: string;
  domain: string;
};

export type ChatBotMessageProps = {
  content?: string;
  image?: string | File[] | null;
};

export const ConversationSearchSchema: ZodType<ConversationSearchProps> =
  z.object({
    query: z.string().min(1, { message: "You must enter a search query" }),
    domain: z.string().min(1, { message: "You must select a domain" }),
  });

export const ChatBotMessageSchema: ZodType<ChatBotMessageProps> = z
  .object({
    content: z
      .string()
      .min(1)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    image: z.union([z.string(), z.array(z.instanceof(File))]).nullable(), // string, File[], or null
  })
  .refine(
    (schema) => {
      // No image or empty
      if (!schema.image) return true;

      // If string, assume it's a valid URL (add URL validation if needed)
      if (typeof schema.image === "string") {
        return true; // Or add z.string().url() in the schema
      }

      // If File array
      if (schema.image.length === 0) return true;
      const file = schema.image[0];
      return (
        ACCEPTED_FILE_TYPES.includes(file.type) && file.size <= MAX_UPLOAD_SIZE
      );
    },
    {
      message: `Image must be a valid URL or a file of type ${ACCEPTED_FILE_TYPES.join(
        ", "
      )} and less than ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB`,
      path: ["image"],
    }
  );
