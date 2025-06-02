/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getUserClients,
  getUserPlanInfo,
  getUserTotalProductPrices,
} from "@/actions/dashboard";
import DashboardCard from "@/components/dashboard/cards";
import { PlanUsage } from "@/components/dashboard/plan-usage";
import InfoBar from "@/components/infobar";
import { BadgeDollarSign, DollarSign, UserRound } from "lucide-react";
import React from "react";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Props = {};

const Page = async (props: Props) => {
  const clients = await getUserClients();
  const plan = await getUserPlanInfo();
  const products = await getUserTotalProductPrices();
  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        <div className="flex gap-5 flex-wrap">
          <DashboardCard
            value={clients || 0}
            title="Potential Clients"
            icon={<UserRound />}
          />
          <DashboardCard
            value={products! * clients! || 0}
            sales
            title="Pipeline Value"
            icon={<DollarSign />}
          />
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 py-10">
          <div>
            <div>
              <h2 className="font-bold text-2xl">Plan Usage</h2>
              <p className="text-sm font-light">
                A detailed overview of your metrics, usage, customers and more
              </p>
            </div>
            <PlanUsage
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              plan={plan?.plan!}
              credits={plan?.credits || 0}
              domains={plan?.domains || 0}
              clients={clients || 0}
            />
          </div>
          <div className="flex flex-col">
            <div className="w-full flex justify-between items-start mb-5">
              <div className="flex gap-3 items-center">
                <BadgeDollarSign />
                <p className="font-bold">Recent Transactions</p>
              </div>
              <p className="text-sm">See More</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
