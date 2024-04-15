import { cn } from '@/cn';

type VotingButtonProps = {
  text: string;
  onClick: () => void;
  className?: string;
};

export const VotingButton = ({ text, onClick, className }: VotingButtonProps) => {
  return (
    <button onClick={onClick} className={cn('w-full h-full block cursor-pointer text-xl', className)}>
      {text}
    </button>
  );
};
