'use client';
import { cn } from '@/cn';
import { queryClient } from '@/components/providers';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

type LandingPageProps = {
  onClick: () => void;
};

const LandingPage = ({ onClick }: LandingPageProps) => {
  return (
    <main className="flex w-full h-[100dvh] items-center justify-center bg-[#00ff95]">
      <button onClick={onClick} className="w-full h-[100dvh] block">
        <h1 className="text-4xl font-mono text-black font-bold">Start voting</h1>
      </button>
    </main>
  );
};

type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

const Panel = ({ children, className }: PanelProps) => {
  return (
    <div className={cn('flex h-full w-full outline outline-red-500 justify-center items-center text-xl', className)}>
      {children}
    </div>
  );
};

type ResultPanelProps = {
  text: string;
  percentage: number;
  className?: string;
};

const ResultPanel = ({ text, percentage, className }: ResultPanelProps) => {
  return (
    <Panel className={className}>
      <div className="w-full h-full flex items-center justify-center flex-col gap-2">
        <h1>{text}</h1>
        <h2 className="text-lg font-bold">{percentage}%</h2>
      </div>
    </Panel>
  );
};

type VotingButtonProps = {
  text: string;
  onClick: () => void;
  className?: string;
};

const VotingButton = ({ text, onClick, className }: VotingButtonProps) => {
  return (
    <Panel className={className}>
      <button onClick={onClick} className="w-full h-full block">
        {text}
      </button>
    </Panel>
  );
};

const useChoices = () => {
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
  const {
    isPending,
    error,
    data: choices,
  } = useQuery({
    queryKey: ['choices'],
    queryFn: async () => {
      // Fetch the choices
      const result = await fetch('/api/choices').then((res) => res.json());

      // Reset the current choice index
      setCurrentChoiceIndex(0);

      return result as {
        id: string;
        choices: [string, string];
      }[];
    },
  });
  const [results, setResults] = useState<[string, number][] | null>(null);
  const { mutate: vote } = useMutation({
    mutationKey: ['vote'],
    mutationFn: (vote: { id: string; choice: 0 | 1 }) =>
      fetch('/api/vote', { method: 'POST', body: JSON.stringify(vote) }).then(
        (response) => response.json() as Promise<[string, number][]>,
      ),
    onSuccess(data, variables, context) {
      setResults(data);
    },
  });
  const next = () => {
    // Goto next choice
    setCurrentChoiceIndex((prev) => prev + 1);

    // Clear results
    setResults(null);
  };

  return {
    // Choices
    choices,
    choice: choices?.[currentChoiceIndex],
    choicesLeft: choices ? choices.length - currentChoiceIndex - 1 : 0,

    // Data fetching
    isPending,
    error,

    // Voting
    vote,
    results,
    next,
  };
};

const Voting = () => {
  const { choice, choicesLeft, isPending, error, vote, results, next } = useChoices();

  if (isPending)
    return (
      <main className="text-black flex w-full h-[100dvh] items-center justify-center bg-[#00ff95] font-mono">
        Loading...
      </main>
    );

  if (error) {
    return <main className="flex w-full h-[100dvh] items-center justify-center bg-[#00ff95]">Error: {error.message}</main>;
  }

  if (results) {
    return (
      <main className="flex flex-col md:flex-row items-center h-full text-black">
        <ResultPanel className="bg-[#ff00f7] text-4xl font-bold" text={results[0][0]} percentage={results[0][1]} />
        <button
          onClick={() => {
            next();
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black dark:bg-white rounded-full w-[50px] h-[50px] font-mono text-center border-none text-[18px] leading-[50px]"
        >
          next
        </button>
        <ResultPanel className="bg-[#0095f8] text-4xl font-bold" text={results[1][0]} percentage={results[1][1]} />
        <span className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-white p-2 font-mono text-xs font-bold">
          {choicesLeft} Choices
        </span>
      </main>
    );
  }

  // If the index is out of bounds, return a message
  if (!choice) {
    return (
      <main className="flex w-full h-[100dvh] items-center justify-center bg-[#00ff95]">
        <h1 className="font-mono text-black font-bold">Thank you for voting.</h1>
      </main>
    );
  }

  return (
    <main className="flex flex-col md:flex-row items-center h-full text-black">
      <VotingButton
        className="bg-[#ff00f7] text-4xl font-bold"
        text={choice.choices[0]}
        onClick={() => {
          vote({
            id: choice.id,
            choice: 0,
          });
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black dark:bg-white rounded-full w-[50px] h-[50px] font-mono text-center border-none text-[18px] leading-[50px]">
        or
      </div>
      <VotingButton
        className="bg-[#0095f8] text-4xl font-bold"
        text={choice.choices[1]}
        onClick={() => {
          vote({
            id: choice.id,
            choice: 1,
          });
        }}
      />
      <span className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-white p-2 font-mono text-xs font-bold">
        {choicesLeft} Choices
      </span>
    </main>
  );
};

export default function Home() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  useEffect(() => {
    if (hasStarted) {
      // Black to match the voting page
      document.body.style.backgroundColor = '#000000';
    } else {
      // Green to match the landing page
      document.body.style.backgroundColor = '#00ff95';
    }
  }, [hasStarted]);

  // Not started
  if (!hasStarted)
    return (
      <LandingPage
        onClick={() => {
          setHasStarted(true);
        }}
      />
    );

  // Voting
  return <Voting />;
}
