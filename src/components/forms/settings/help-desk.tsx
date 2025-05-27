/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Section } from "@/components/section-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useHelpDesk } from "@/hooks/settings/use-settings";
import React from "react";
import FormGenerator from "../form-generator";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import Accordion from "@/components/accordian";

type Props = {
  id: string;
};

const HelpDesk = ({ id }: Props) => {
  const { register, errors, onSubmitQuestion, loading, isQuestions } =
    useHelpDesk(id);
  return (
    <Card className="w-full grid grid-cols-1 lg:grid-cols-2">
      <CardContent className="p-6 border-r-[1px]">
        <CardTitle>Help Desk</CardTitle>
        <form onSubmit={onSubmitQuestion} className="flex flex-col gap-6 mt-10">
          <div className="flex flex-col gap-3">
            <Section
              label="Question"
              message="Add a question that you believe is frequently asked."
            />
            <FormGenerator
              errors={errors}
              register={register as any}
              name="question"
              type="text"
              inputType="input"
              form="help-desk-form"
              placeholder="Type your question"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Section
              label="Answer to question"
              message="The answer to the question above."
            />
            <FormGenerator
              errors={errors}
              register={register as any}
              name="answer"
              type="text"
              inputType="textarea"
              form="help-desk-form"
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
              <Accordion
                key={question.id}
                trigger={question.question}
                content={question.answer}
              />
            ))
          ) : (
            <CardDescription>No Questions Added</CardDescription>
          )}
        </Loader>
      </CardContent>
    </Card>
  );
};

export default HelpDesk;
