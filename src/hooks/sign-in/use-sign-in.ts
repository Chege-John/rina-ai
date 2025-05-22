import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/toast"; // Assuming toast is a function, not a hook
import { zodResolver } from "@hookform/resolvers/zod";
import { UserLoginProps, UserLoginSchema } from "@/schemas/auth.schema";
import { useForm } from "react-hook-form";

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: "onChange",
  });

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserLoginProps) => {
      if (!isLoaded) return;

      try {
        setLoading(true);
        const authenticated = await signIn.create({
          identifier: values.email,
          password: values.password,
        });

        if (authenticated.status === "complete") {
          await setActive({ session: authenticated.createdSessionId });
          toast({
            title: "Success",
            description: "Welcome back!",
          });
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (error: unknown) {
        // Narrow down the error type before accessing properties
        if (error instanceof Error) {
          // Check if error is an instance of the Error class
          if (error.message.includes("form_password_incorrect")) {
            toast({
              title: "Error",
              description: "Email/password is incorrect, try again",
            });
          } else {
            toast({
              title: "Error",
              description: "An unexpected error occurred. Please try again.",
            });
          }
        } else {
          // Handle the case where error is not an instance of Error (e.g., network error, or a custom error type)
          toast({
            title: "Error",
            description: "An unknown error occurred. Please try again.",
          });
        }
      }
    }
  );

  return {
    methods,
    onHandleSubmit,
    loading,
  };
};
