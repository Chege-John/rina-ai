import React from "react";
import { Card } from "../ui/card";
import { CloudIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import Modal from "../modal";
import IntegrationModalBody from "./integration-modal-body";

type Props = {
  name: "stripe";
  logo: string;
  title: string;
  description: string;
  connections: {
    [key in "stripe"]: boolean;
  };
};

const IntegrationTrigger = ({
  connections,
  name,
  logo,
  title,
  description,
}: Props) => {
  return (
    <Modal
      title={title}
      type="Integration"
      logo={logo}
      description={description}
      trigger={
        <Card className="px-3 py-2 cursor-pointer flex gap-2">
          <CloudIcon />
          {connections[name] ? "Connected" : "Connect"}
        </Card>
      }
    >
      <Separator orientation="horizontal" className="bg-gray-200" />
      <IntegrationModalBody connections={connections} type={name} />
    </Modal>
  );
};

export default IntegrationTrigger;
