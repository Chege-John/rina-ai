"use client";

import React from "react";
import FormGenerator from "../forms/form-generator";
import { Loader, UploadIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ErrorMessage } from "@hookform/error-message";
import { Button } from "../ui/button";
import { useProducts } from "@/hooks/settings/use-settings";

type CreateProductFormProps = {
  id: string;
};

const CreateProductForm = ({ id }: CreateProductFormProps) => {
  const { onCreateNewProduct, register, errors, loading } = useProducts(id);
  return (
    <form
      className="mt-3 w-full flex flex-col gap-5 py-10"
      onSubmit={onCreateNewProduct}
    >
      <FormGenerator
        errors={errors}
        register={register}
        name="name"
        type="text"
        inputType="input"
        label="Name"
        placeholder="Your product name"
      />
      <div className="flex flex-col items-start">
        <Label
          htmlFor="upload-product"
          className="flex gap-2 p-3 rounded-lg bg-orange-200 text-gray-600 cursor-pointer font-semibold text-sm items-center"
        >
          <Input
            {...register("image")}
            type="file"
            id="upload-product"
            className="hidden"
          />
          <UploadIcon /> Upload
        </Label>
        <ErrorMessage
          errors={errors}
          name="image"
          render={({ message }) => (
            <p className="text-red-400 mt-2">
              {message === "Required" ? "" : message}
            </p>
          )}
        />
      </div>
      <FormGenerator
        errors={errors}
        register={register}
        name="price"
        type="text"
        inputType="input"
        label="Price"
        placeholder="0.00"
      />
      <Button type="submit" className="w-full">
        <Loader loading={loading}>Create Product</Loader>
      </Button>
    </form>
  );
};

export default CreateProductForm;
