"use client";
import { useChangePassword } from "@/hooks/settings/use-settings";
import React from "react";
import FormGenerator from "../forms/form-generator";
import { Section } from "../section-label";
import { Button } from "../ui/button";
import { Loader } from "../loader";

type Props = {};

const ChangePassword = (props: Props) => {
  const { register, errors, onChangePassword, loading } = useChangePassword();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div className="lg:col-span-1">
        <Section label="Change Password" message="Reset your password" />
      </div>
      <form onSubmit={onChangePassword} className="lg:col-span-4">
        <div className="lg:w-[500px] flex flex-col gap-3">
          <FormGenerator
            errors={errors}
            register={register}
            name="password"
            type="password"
            inputType="input"
            label="Password"
            placeholder="New password"
          />
          <FormGenerator
            errors={errors}
            register={register}
            name="confirmPassword"
            type="password"
            inputType="input"
            label="Confirm Password"
            placeholder="Confirm your password"
          />
          <Button className="bg-orange-300 text-gray-700 font-semibold">
            <Loader loading={loading}>Change Password</Loader>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
