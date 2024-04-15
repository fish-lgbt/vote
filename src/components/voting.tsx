import { PollsResponse } from '@/app/api/polls/route';
import { VoteResponse } from '@/app/api/vote/route';
import { globalStore } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import { Results } from './results';
import { VotingButton } from './voting-button';

type VotingProps = {
  poll: PollsResponse[number];
};

export const Voting = ({ poll }: VotingProps) => {
  // Global store
  const store = useStore(globalStore);

  // Handle voting for polls
  const { mutate: vote } = useMutation({
    mutationKey: ['vote'],
    mutationFn: async (vote: { pollId: string; choice: string }) => {
      const rows = (await fetch('/api/vote', { method: 'POST', body: JSON.stringify(vote) }).then((response) =>
        response.json(),
      )) as VoteResponse;
      store.setResults(rows);
    },
  });

  // Show the results
  if (store.results) {
    return <Results />;
  }

  // Voting
  return (
    <main className="flex flex-col md:flex-row items-center h-full text-black">
      <VotingButton
        className="bg-[#ff00f7] text-4xl font-bold"
        text={poll.choices[0]}
        onClick={() => {
          vote({
            pollId: poll.id,
            choice: poll.choices[0],
          });
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black dark:bg-white rounded-full w-[50px] h-[50px] font-mono text-center border-none text-[18px] leading-[50px]">
        or
      </div>
      <VotingButton
        className="bg-[#0095f8] text-4xl font-bold"
        text={poll.choices[1]}
        onClick={() => {
          vote({
            pollId: poll.id,
            choice: poll.choices[1],
          });
        }}
      />
    </main>
  );
};
