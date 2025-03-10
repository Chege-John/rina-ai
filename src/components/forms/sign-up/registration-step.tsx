"use client";

import { useAuthContextHook } from "@/context/use-auth-context";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import dynamic from "next/dynamic"; // Import dynamic from next/dynamic
import TypeSelectionForm from "./type-selection-form";
import { Spinner } from "@/components/spinner";

// Define DetailForm with proper dynamic import
const DetailForm = dynamic(() => import("./account-details-form"), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => <Spinner />, // Correctly specify the loading component
});

const OTPForm = dynamic(() => import("./otp-form"), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => <Spinner />, // Correctly specify the loading component
});

type Props = {};

const RegistrationFormStep = (props: Props) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  const { currentStep } = useAuthContextHook();
  const [onOTP, setOnOTP] = useState<string>("");
  const [onUserType, setOnUserType] = useState<"owner" | "student">("owner");

  // Set the OTP value in the form context
  setValue("otp", onOTP);

  switch (currentStep) {
    case 1:
      return (
        <TypeSelectionForm
          register={register}
          userType={onUserType}
          setUserType={setOnUserType}
        />
      );
    case 2:
      return <DetailForm errors={errors} register={register} />;
    case 3:
      return <OTPForm onOTP={onOTP} setOTP={setOnOTP} />;
  }
  return <div>RegistrationFormStep</div>;
};

export default RegistrationFormStep;
