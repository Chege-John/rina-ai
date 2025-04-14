import {
  onDomainCustomerResponses,
  onGetAllDomainBookings,
} from "@/actions/appointment";
import PortalForm from "@/components/forms/portal/portal-form";
import React from "react";

type Props = { params: { domainid: string; customerid: string } };

const CustomerSignUpForm = async ({ params }: Props) => {
  const questions = await onDomainCustomerResponses(params.customerid);
  const bookings = await onGetAllDomainBookings(params.domainid);

  if (!questions || !bookings) return null;
  return (
    <PortalForm
      bookings={bookings}
      questions={questions.questions}
      email={questions.email!}
      domainId={params.domainid}
      customerId={params.customerid}
      type="Appointment"
    />
  );
};

export default CustomerSignUpForm;
