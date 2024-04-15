import { cn } from '@/cn';

type ResultPanelProps = {
  text: string;
  percentage: number;
  className?: string;
};

export const ResultPanel = ({ text, percentage, className }: ResultPanelProps) => {
  return (
    <div className={cn('w-full h-full flex items-center justify-center flex-col gap-2 text-xl', className)}>
      <h1>{text}</h1>
      <h2 className="text-lg font-bold">{percentage}%</h2>
    </div>
  );
};
