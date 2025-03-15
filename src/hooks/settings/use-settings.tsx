import { onUpdatePassword } from "@/actions/settings";
import { toast } from "@/components/ui/toast";
import {
  ChangePasswordProps,
  ChangePasswordSchema,
} from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
