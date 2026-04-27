import { onGetAllAccountDomains } from "@/actions/settings";
import ConversationMenu from "@/components/conversations";
import Messenger from "@/components/conversations/messenger";
import InfoBar from "@/components/infobar";
import { Separator } from "@/components/ui/separator";
import React from "react";

// type Props = {};

const ConversationPage = async () => {
  const domains = await onGetAllAccountDomains();
  return (
    <div className="w-full h-full flex">
      <div className="w-96 h-full flex flex-col shrink-0">
        <ConversationMenu domains={domains?.domains} />
      </div>
      <Separator orientation="vertical" />
      <div className="w-full flex flex-col h-full">
        <div className="px-5">
          <InfoBar />
        </div>
        <Messenger />
      </div>
    </div>
  );
};

export default ConversationPage;
