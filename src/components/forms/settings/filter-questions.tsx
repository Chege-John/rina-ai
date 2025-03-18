"use client";

import { Section } from "@/components/section-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useFilterQuestions } from "@/hooks/settings/use-settings";
import React from "react";
import FormGenerator from "../form-generator";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import Accordion from "@/components/accordian";

type Props = {
  id: string;
};

const FilterQuestions = ({ id }: Props) => {
  const { register, errors, onAddFilterQuestions, loading, isQuestions } =
    useFilterQuestions(id);
  return (
    <Card className="w-full grid grid-cols-1 lg:grid-cols-2">
      <CardContent className="p-6 border-r-[1px]">
        <CardTitle>Help Desk</CardTitle>
        <form
          onSubmit={onAddFilterQuestions}
          className="flex flex-col gap-6 mt-10"
        >
          <div className="flex flex-col gap-3">
            <Section
              label="Question"
              message="Add a question that you want your chatbot to ask."
            />
            <FormGenerator
              errors={errors}
              register={register}
              name="question"
              type="text"
              inputType="input"
              form="filter-questions-form"
              placeholder="Type your question"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Section
              label="Answer to question"
              message="The answer for the question above."
            />
            <FormGenerator
              errors={errors}
              register={register}
              name="answer"
              type="text"
              inputType="textarea"
              form="filter-questions-form"
              placeholder="Type your answer"
              lines={5}
            />
          </div>
          <Button
            type="submit"
            className="bg-orange-400 hover:bg-orange-600 hover:opacity-70 transition duration-150 ease-in-out text-white font-semibold"
          >
            Create
          </Button>
        </form>
      </CardContent>
      <CardContent className="p-6 overflow-y-auto chat-window">
        <Loader loading={loading}>
          {isQuestions.length ? (
            isQuestions.map((question) => (
              <p key={question.id} className="font-bold">
                {question.question}
              </p>
            ))
          ) : (
            <CardDescription>No Questions Added</CardDescription>
          )}
        </Loader>
      </CardContent>
    </Card>
  );
};

export default FilterQuestions;
