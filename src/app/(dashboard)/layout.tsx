// app/(dashboard)/layout.tsx
import { onLoginUser } from "@/actions/auth";
import DashboardClient from "./dashboardwrapper";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const OwnerLayout = async ({ children }: Props) => {
  console.log("Dashboard Layout rendering");

  const authenticated = await onLoginUser();
  if (!authenticated) return null;

  return (
    <DashboardClient domains={authenticated.domain}>{children}</DashboardClient>
  );
};

export default OwnerLayout;
