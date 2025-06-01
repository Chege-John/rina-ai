/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { onIntegrateDomain } from "@/actions/settings";
import { toast } from "@/components/ui/toast";
import {
  AddDomainSchema,
  AddDomainFormValues,
} from "@/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadClient } from "@uploadcare/upload-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
});

export const useDomain = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddDomainFormValues>({
    resolver: zodResolver(AddDomainSchema),
  });

  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(false);
  const [isDomain, setIsDomain] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    setIsDomain(pathname.split("/").pop());
  }, [pathname]);

  const onAddDomain = handleSubmit(async (values: AddDomainFormValues) => {
    setLoading(true);
    try {
      let imageUuid: string | undefined;
      if (values.image && values.image.length > 0) {
        const uploaded = await upload.uploadFile(values.image[0]);
        imageUuid = uploaded.uuid;
      }
      // Use a default value if imageUuid is undefined
      const domain = await onIntegrateDomain(values.domain, imageUuid ?? "");
      if (domain) {
        reset();
        setLoading(false);
        toast({
          title: domain.status == 200 ? "Success" : "Error",
          description: domain.message,
        });
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to add domain. Please try again.",
      });
    }
  });

  return {
    register,
    onAddDomain,
    errors,
    loading,
    isDomain,
  };
};
