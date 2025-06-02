import { onGetPaymentConnected } from "@/actions/settings";
import InfoBar from "@/components/infobar";
import IntegrationsList from "@/components/integrations";
import React from "react";

export const dynamic = "force-dynamic";

const IntegrationsPage = async () => {
  const payment = await onGetPaymentConnected();

  //Object of connections
  const connections = {
    stripe: payment ? true : false,
  };

  return (
    <>
      <InfoBar />
      <IntegrationsList connections={connections} />
    </>
  );
};

export default IntegrationsPage;
