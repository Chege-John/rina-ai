import { Progress } from "../ui/progress";

type ProgressBarProps = {
  end: number;
  label: string;
  credits: number;
};

export const ProgressBar = ({ end, label, credits }: ProgressBarProps) => {
  return (
    <div className="flex flex-col w-full md:w-7/12 gap-2">
      <div className="flex justify-between items-end">
        <h3 className="font-semibold text-sm text-foreground">{label}</h3>
        <span className="text-xs text-muted-foreground">{credits} / {end}</span>
      </div>
      <Progress
        value={(credits / end) * 100}
        className="h-2 w-full bg-muted [&>div]:bg-[#256ff1]"
      />
    </div>
  );
};
