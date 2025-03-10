import OTPInput from "@/components/otp";
import React from "react";

type Props = {
  onOTP: string;
  setOTP: React.Dispatch<React.SetStateAction<string>>;
};

const OTPForm = ({ onOTP, setOTP }: Props) => {
  return (
    <>
      <h2 className="text-gray-600 md:text-4xl font-bold">Enter OTP</h2>
      <p className="text-gray-500 md:text-sm">
        Enter the one time password that was sent to your email.
      </p>
      <div className="w-full justify-center flex py-2">
        <OTPInput otp={onOTP} setOTP={setOTP} />
      </div>
    </>
  );
};

export default OTPForm;
