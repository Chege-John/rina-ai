import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DashboardHome() {
  console.log("Dashboard home page rendering"); // Debug
  redirect("/dashboard");
}
