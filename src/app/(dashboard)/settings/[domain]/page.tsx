import { onGetCurrentDomainInfo } from "@/actions/settings";
import { redirect } from "next/navigation";
import React from "react";

type Props = { params: { domain: string } };

const DomainSettingsPage = async ({ params }: Props) => {
  const domain = await onGetCurrentDomainInfo(params.domain);
  if (!domain) redirect("/dashboard");
  return <div>DomainSettingsPage</div>;
};

export default DomainSettingsPage;
