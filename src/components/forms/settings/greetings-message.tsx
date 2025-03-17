import { Section } from "@/components/section-label";
import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import FormGenerator from "../form-generator";

type Props = {
  message: string;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
};

const GreetingsMessage = ({ message, register, errors }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <Section
        label="Greetings Message"
        message="Customize your welcome message"
      />
      <div className="lg:w-[500px]">
        <FormGenerator
          errors={errors}
          register={register}
          name="welcomeMessage"
          type="text"
          inputType="textarea"
          placeholder={message}
          lines={2}
        />
      </div>
    </div>
  );
};

export default GreetingsMessage;
