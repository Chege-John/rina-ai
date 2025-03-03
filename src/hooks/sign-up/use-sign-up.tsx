"use client";

import {
  UserRegistrationProps,
  UserRegistrationSchema,
} from "@/schemas/auth.schema";
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { onCompleteUserRegistration } from "@/actions/auth";

export const useSignUpForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      type: "owner",
    },
    mode: "onChange",
  });

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: email,
        password: password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      onNext((prev) => prev + 1);
    } catch (err) {
      const error = err as { errors: { longMessage: string }[] };
      toast({
        title: "Error",
        description: error.errors[0]?.longMessage || "An error occurred.",
      });
    }
  };

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      if (!isLoaded) return;
      try {
        setIsLoading(true);
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp,
        });

        if (completeSignUp.status !== "complete") {
          return { message: "Something went wrong!" };
        }

        if (completeSignUp.status == "complete") {
          if (!signUp.createdUserId) return;

          const registered = await onCompleteUserRegistration(
            values.fullname,
            signUp.createdUserId,
            values.type
          );

          if (registered?.status == 200 && registered.user) {
            await setActive({
              session: completeSignUp.createdSessionId,
            });

            setIsLoading(false);
            router.push("/dashboard");
          }

          if (registered?.status == 400) {
            toast({
              title: "Error",
              description: registered.message || "Registration failed.",
            });
          }
        }
      } catch (err) {
        const error = err as { errors: { longMessage: string }[] };
        toast({
          title: "Error",
          description: error.errors[0]?.longMessage || "An error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  );

  return { isLoading, onGenerateOTP, onHandleSubmit, methods };
};
