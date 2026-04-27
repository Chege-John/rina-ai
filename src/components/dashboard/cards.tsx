import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { JSX } from "react";

type Props = {
  title: string;
  value: number;
  icon: JSX.Element;
  sales?: boolean;
};

const DashboardCard = ({ title, value, icon, sales }: Props) => {
  return (
    <Card className="flex flex-col gap-3 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 w-full md:w-fit min-w-[200px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {React.cloneElement(icon, { className: "h-4 w-4 text-muted-foreground" })}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {sales && "$"}
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
