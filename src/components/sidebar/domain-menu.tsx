/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDomain } from "@/hooks/sidebar/use-domain";
import { cn } from "@/lib/utils";
import React from "react";
import AppDrawer from "../drawer";
import { Plus } from "lucide-react";
import { Loader } from "../loader";
import FormGenerator from "../forms/form-generator";
import UploadButton from "../upload-button";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

type Props = {
  min?: boolean;
  domains:
    | {
        id: string;
        name: string;
        icon: string | null;
      }[]
    | null
    | undefined;
};

const DomainMenu = ({ domains, min }: Props) => {
  const { register, onAddDomain, loading, errors, isDomain } = useDomain();

  return (
    <div className={cn("flex flex-col gap-3", min ? "mt-6" : "mt-3")}>
      <div className="flex justify-between w-full items-center">
        {!min && <p className="text-xs text-gray-500">DOMAINS</p>}
        <AppDrawer
          title="Add your business domain"
          description="add in your domain address to integrate your chatbot"
          onOpen={
            <div className="cursor-pointer text-gray-500 rounded-full border-2">
              <Plus />
            </div>
          }
        >
          <Loader loading={loading}>
            <form
              className="mt-3 w-6/12 flex flex-col gap-3"
              onSubmit={onAddDomain}
            >
              <FormGenerator
                errors={errors}
                register={register as any}
                name="domain"
                type="text"
                inputType="input"
                label="Domain"
                placeholder="mydomian.com"
              />
              <UploadButton
                register={register as any}
                label="Upload Icon"
                errors={errors}
              />
              <Button type="submit" className="w-full">
                Add
              </Button>
            </form>
          </Loader>
        </AppDrawer>
      </div>
      <div className="flex flex-col gap-1 text-ironside font-medium">
        {domains &&
          domains.map((domain) => (
            <Link
              key={domain.id}
              href={`/settings/${domain.name.split(".")[0]}`}
              className={cn(
                "flex gap-3 hover:bg-white rounded-lg transition duration-100 ease-in-out cursor-pointer",
                !min ? "p-2 " : "py-2",
                domain.name.split(".")[0] === isDomain && "bg-white"
              )}
            >
              <Image
                src={
                  domain.icon
                    ? `https://ucarecdn.com/${domain.icon}/`
                    : "/default-icon.png"
                }
                alt={domain.name}
                width={30}
                height={30}
                className="rounded-full"
              />
              {!min && <p className="text-sm">{domain.name}</p>}
            </Link>
          ))}
      </div>
    </div>
  );
};

export default DomainMenu;
