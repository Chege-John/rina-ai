import { onGetCurrentDomainInfo } from "@/actions/settings";
import BotTrainingForm from "@/components/forms/settings/bot-training";
import SettingsForm from "@/components/forms/settings/forms";
import InfoBar from "@/components/infobar";
import ProductTable from "@/components/products";
import { redirect } from "next/navigation";
import React from "react";

export default async function DomainSettingsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainParam } = await params;
  const domain = await onGetCurrentDomainInfo(domainParam);
  if (!domain) redirect("/dashboard");

  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        <SettingsForm
          plan={domain.subscription?.plan ?? "STANDARD"}
          chatbot={domain.domains[0].chatbot}
          id={domain.domains[0].id}
          name={domain.domains[0].name}
        />
        <BotTrainingForm id={domain.domains[0].id} />
        <ProductTable id={domain.domains[0].id} />
      </div>
    </>
  );
}
