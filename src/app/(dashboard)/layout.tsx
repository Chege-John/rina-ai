// app/(dashboard)/layout.tsx
import { onLoginUser } from "@/actions/auth";
import DashboardClient from "./dashboardwrapper";
import React from "react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Props = {
  children: React.ReactNode;
};

const OwnerLayout = async ({ children }: Props) => {
  console.log("Dashboard Layout rendering");

  const authenticated = await onLoginUser();
  if (!authenticated) {
    redirect("/auth/sign-in");
  }

  return (
    <DashboardClient domains={authenticated.domain}>{children}</DashboardClient>
  );
};

export default OwnerLayout;
