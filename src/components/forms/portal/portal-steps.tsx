import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import QuestionsForm from "./questions";
import BookAppointmentDate from "./booking-date";

type Props = {
  questions: {
    id: string;
    question: string;
    answered: string | null;
  }[];
  type: "Appointment" | "Payment";
  register: UseFormRegister<FieldValues>;
  error: FieldErrors<FieldValues>;
  onNext(): void;
  step: number;
  date: Date | undefined;
  onBooking: React.Dispatch<React.SetStateAction<Date | undefined>>;
  onBack(): void;
  onSlot(slot: string): void;
  slot?: string;
  loading: boolean;
  bookings?:
    | {
        date: Date;
        slot: string;
      }[]
    | undefined;
  products?:
    | {
        name: string;
        image: string;
        price: number;
      }[]
    | undefined;
  amount?: number;
  stripeId?: string;
};

const PortalSteps = ({
  questions,
  type,
  register,
  error,
  onNext,
  step,
  date,
  onBooking,
  onBack,
  onSlot,
  slot,
  loading,
  bookings,
  products,
  amount,
  stripeId,
}: Props) => {
  if (step == 1) {
    return (
      <QuestionsForm
        questions={questions}
        register={register}
        error={error}
        onNext={onNext}
      />
    );
  }
  if (step == 2 && type == "Appointment") {
    return (
      <BookAppointmentDate
        date={date}
        onBooking={onBooking}
        onBack={onBack}
        onSlot={onSlot}
        currentSlot={slot}
        register={register}
        loading={loading}
        bookings={bookings}
      />
    );
  }

  //WIP Setup Stripe
  {
    /*
     if (step == 2 && type == "Payment") {
    return (
      <PaymentForm
        products={products}
        amount={amount}
        stripeId={stripeId}
        onBack={onBack}
        onNext={onNext}
      />
    );
  }*/
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="font-bold text-gray-600 text-4xl">
        <p className="text-center">
          Thank you for taking the time to fill in this form. We look foward to
          <br /> speaking to you soon.
        </p>
      </h2>
    </div>
  );
};

export default PortalSteps;
