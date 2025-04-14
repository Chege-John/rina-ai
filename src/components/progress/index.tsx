import { Progress } from "../ui/progress";

type ProgressBarProps = {
  end: number;
  label: string;
  credits: number;
};

export const ProgressBar = ({ end, label, credits }: ProgressBarProps) => {
  return (
    <div className="flex flex-col w-full md:w-7/12 gap-1">
      <h2 className="text-gray-800 font-bold">{label}</h2>
      <div className="flex flex-col">
        <div className="flex justify-between text-sm">
          <p>{credits}</p>
          <p>{end}</p>
        </div>
        <Progress
          value={(credits / end) * 100}
          className="w-full bg-orange-400"
        />
      </div>
    </div>
  );
};
