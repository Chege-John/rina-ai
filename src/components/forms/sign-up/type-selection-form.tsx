"use client";

import React from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import UserTypeCard from "./user-type-card";

type Props = {
  register: UseFormRegister<FieldValues>;
  userType: "owner" | "student";
  setuserType: React.Dispatch<React.SetStateAction<"owner" | "student">>;
};

const TypeSelectionForm = ({ register, setuserType, userType }: Props) => {
  return (
    <>
      <h2 className="text-black md:text-4xl font-bold">Create an account</h2>
      <p className="text-black md:text-sm">
        Tell us about yourself! What do you do? Let&apos;s tailor your
        <br /> experience so it best suits you.
      </p>
      <UserTypeCard
        register={register}
        setUserType={setuserType}
        userType={userType}
        value="owner"
        title="I own a business"
        text="Setting up my account for my company"
      ></UserTypeCard>
    </>
  );
};

export default TypeSelectionForm;
