import { onBookNewAppointment, saveAnswers } from "@/actions/appointment";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const usePortal = (
  customerId: string,
  domainId: string,
  email: string
) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const [step, setStep] = useState<number>(2);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  setValue("date", date);

  const onNext = () => setStep((prev) => prev + 1);
  const onPrev = () => setStep((prev) => prev - 1);

  const onBookingAppointment = handleSubmit(async (values) => {
    try {
      setLoading(true);
      const questions = Object.keys(values)
        .filter((key) => key.startsWith("question"))
        .reduce((obj: any, key) => {
          obj[key.split("question-")[1]] = values[key];
          return obj;
        }, {});

      const savedAnswsers = await saveAnswers(questions, customerId);

      if (savedAnswsers) {
        const booked = await onBookNewAppointment(
          domainId,
          customerId,
          email,
          values.slot,
          values.date
        );

        if (booked && booked.status === 200) {
          setLoading(false);
          toast({
            title: "Success",
            description: booked.message,
          });
          setStep(3);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
      });
    }
  });

  const onSelectedTimeSlot = (slot: string) => setSelectedSlot(slot);

  return {
    step,
    onNext,
    onPrev,
    register,
    errors,
    date,
    setDate,
    onBookingAppointment,
    onSelectedTimeSlot,
    selectedSlot,
    loading,
  };
};
