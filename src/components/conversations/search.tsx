import React from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";

type Props = {
  register: UseFormRegister<FieldValues>;
  domains?:
    | {
        name: string;
        id: string;
        icon: string | null;
      }[]
    | undefined;
};

const ConversationSearch = ({ domains, register }: Props) => {
  return (
    <div className="flex flex-col py-3">
      <select
        {...register("domain")}
        defaultValue="" // Set default to empty string
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
