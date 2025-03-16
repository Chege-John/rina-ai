import {
  onChatBotImageUpdate,
  onDeleteUserDomain,
  onUpdateDomain,
  onUpdatePassword,
  onUpdateWelcomeMessage,
} from "@/actions/settings";
import { toast } from "@/components/ui/toast";
import {
  ChangePasswordProps,
  ChangePasswordSchema,
} from "@/schemas/auth.schema";
import {
  DomainSettingsProps,
  DomainSettingsSchema,
} from "@/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadClient } from "@uploadcare/upload-client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
});

export const useThemeMode = () => {
  const { theme, setTheme } = useTheme();
  return {
    setTheme,
    theme,
  };
};

export const useChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordProps>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onChange",
  });

  const { loading, setLoading } = useState<boolean>(false);

  const onChangePassword = handleSubmit(async (values: ChangePasswordProps) => {
    try {
      setLoading(true);
      const updated = await onUpdatePassword(values.password);
      if (updated) {
        reset();
        setLoading(false);
        toast({
          title: updated.status == 200 ? "Success" : "Error",
          description: updated.message,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  return {
    register,
    errors,
    onChangePassword,
    loading,
  };
};

export const useSettings = ({ id }: { id: string }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DomainSettingsProps>({
    resolver: zodResolver(DomainSettingsSchema),
  });

  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [deleting, setDeleting] = useState<boolean>(false);

  const onUpdateSettings = handleSubmit(async (values) => {
    try {
      setLoading(true);

      // Handle domain update
      if (values.domain) {
        const domain = await onUpdateDomain(id, values.domain);
        if (domain) {
          toast({
            title: "Success",
            description: domain.message,
          });
        }
      }

      // Handle image update
      if (values.image?.[0]) {
        const uploaded = await upload.uploadFile(values.image[0]);
        const image = await onChatBotImageUpdate(id, uploaded.uuid);
        if (image) {
          toast({
            title: image.status === 200 ? "Success" : "Error",
            description: image.message,
          });
        }
      }

      // Handle welcome message update
      if (values.welcomeMessage) {
        const message = await onUpdateWelcomeMessage(values.welcomeMessage, id);
        if (message) {
          toast({
            title: message.status === 200 ? "Success" : "Error",
            description: message.message,
          });
        }
      }

      // Reset form and refresh page after successful updates
      reset();
      router.refresh();
    } catch (error) {
      console.error("Update settings error:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating settings",
      });
    } finally {
      setLoading(false);
    }
  }); // Added missing closing parenthesis for handleSubmit

  const onDeleteDomain = async () => {
    try {
      setDeleting(true);
      const deleted = await onDeleteUserDomain(id);
      if (deleted) {
        toast({
          title: deleted.status === 200 ? "Success" : "Error",
          description: deleted.message,
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Delete domain error:", error);
      toast({
        title: "Error",
        description: "Failed to delete domain",
      });
    } finally {
      setDeleting(false); // Moved to finally block to ensure it always runs
    }
  };

  return {
    register,
    errors,
    onUpdateSettings,
    loading,
    onDeleteDomain,
    deleting,
  };
}; // Added missing closing brace for the hook
