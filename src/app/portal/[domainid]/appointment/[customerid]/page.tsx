import {
  onDomainCustomerResponses,
  onGetAllDomainBookings,
} from "@/actions/appointment";
import PortalForm from "@/components/forms/portal/portal-form";
import React from "react";

type Props = { params: Promise<{ domainid: string; customerid: string }> };

const CustomerSignUpForm = async ({ params }: Props) => {
  const { domainid, customerid } = await params;
  const questions = await onDomainCustomerResponses(customerid);
  const bookings = await onGetAllDomainBookings(domainid);

  if (!questions || !bookings) return null;
  return (
    <PortalForm
      bookings={bookings}
      questions={questions.questions}
      email={questions.email!}
      domainId={domainid}
      customerId={customerid}
      type="Appointment"
    />
  );
};

export default CustomerSignUpForm;
