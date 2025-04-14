import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import FormGenerator from "../form-generator";
import { Button } from "@/components/ui/button";

type Props = {
  questions: {
    id: string;
    question: string;
    answered: string | null;
  }[];
  register: UseFormRegister<FieldValues>;
  error: FieldErrors<FieldValues>;
  onNext(): void;
};

const QuestionsForm = ({ questions, register, error, onNext }: Props) => {
  return (
    <div className="flex flex-col gap-5 justify-center">
      <div className="flex justify-center">
        <h2 className="text-4xl font-bold mb-5">Account Details</h2>
      </div>
      {questions.map((question) => (
        <FormGenerator
          key={question.id}
          defaultValue={question.answered || ""}
          name={`question-${question.id}`}
          register={register}
          errors={error}
          type="text"
          label={question.question}
          inputType="input"
          placeholder={question.answered || "Not answered"}
        />
      ))}
      <Button className="mt-5" type="button" onClick={onNext}>
        Next
      </Button>
    </div>
  );
};

export default QuestionsForm;
