import React from "react";
import { UseFormRegister } from "react-hook-form";
import { ConversationSearchProps } from "@/schemas/conversation.schema";

type Props = {
  register: UseFormRegister<ConversationSearchProps>;
  domains?:
    | {
        name: string;
        id: string;
        icon: string | null;
      }[]
    | undefined;
};

const ConversationSearch = ({ domains, register }: Props) => {
  console.log("Domains received in ConversationSearch:", domains);
  return (
    <div className="flex flex-col py-3 gap-3">
      <input
        {...register("query")}
        placeholder="Search conversations"
        className="px-3 py-4 text-sm border-[1px] rounded-lg"
      />
      <select
        {...register("domain")}
        defaultValue=""
        className="px-3 py-4 text-sm border-[1px] rounded-lg mr-5"
      >
        <option disabled value="">
          Domain Name
        </option>
        {domains?.map((domain) => (
          <option key={domain.id} value={domain.id}>
            {domain.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ConversationSearch;
