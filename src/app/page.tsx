'use client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { PollsResponse } from './api/polls/route';
import { useStore } from '@tanstack/react-store';
import { globalStore } from '@/store';
import { LandingPage } from '@/components/landing-page';
import { Voting } from '@/components/voting';

export default function Home() {
  const store = useStore(globalStore);
  const hasStarted = store.index >= 0;

  // Get the polls
  const {
    isPending,
    error,
    data: polls,
  } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => {
      // Fetch the polls this user has not voted on
      return (await fetch('/api/polls').then((res) => res.json())) as PollsResponse;
    },
  });

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
  if (!hasStarted) return <LandingPage />;

  // Loading the polls
  if (isPending) {
    return (
      <main className="text-black flex w-full h-[100dvh] items-center justify-center bg-[#00ff95] font-mono">
        Loading...
      </main>
    );
  }

  // Failed to load the polls
  if (error) {
    return <main className="flex w-full h-[100dvh] items-center justify-center bg-[#00ff95]">Error: {error.message}</main>;
  }

  // Get the current poll
  const poll = polls?.[store.index];

  // If we run out of polls
  if (!poll) {
    return (
      <main className="flex w-full h-[100dvh] items-center justify-center bg-[#00ff95] font-mono text-black font-bold">
        Thank you for voting, come back later!
        <pre>
          {JSON.stringify(
            {
              store: {
                index: store.index,
                results: store.results,
              },
              polls,
            },
            null,
            2,
          )}
        </pre>
      </main>
    );
  }

  // Voting
  return <Voting poll={poll} />;
}
