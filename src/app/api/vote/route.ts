import { axiom } from '@/axiom';
import { thingsToVoteOn } from '@/things-to-vote-on';

import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const calculatePercentageOfVotes = async (id: string) => {
  // Get the number of votes for each item
  const query = `vote | where id=="${id}" | summarize count() by bin_auto(_time), choice`;
  const result = await axiom.query(query);
  const choicesAndVotes =
    result.buckets.totals
      // Filter out any items that are not in the list of things to vote on
      // This is to prevent old broken data from being included in the results
      ?.filter((item) => thingsToVoteOn.get(id)?.includes(item.group['choice'] as string))
      ?.map((_) => [_.group['choice'] as string, _.aggregations?.[0].value as number] as const) ?? [];
  const votes = Object.fromEntries(choicesAndVotes);

  // Calculate the total number of votes
  const totalVotes = Object.values(votes).reduce((acc, curr) => acc + curr, 0);

  // Calculate the percentage of votes for each item
  const percentages = Object.values(votes).map((votes) => (votes / totalVotes) * 100);

  // Round the percentages to 2 decimal places for better readability
  const roundedPercentages = percentages.map((percentage) => parseFloat(percentage.toFixed(2)));

  // Return the percentage of votes for each item
  return roundedPercentages.map((percentage, index) => [Object.keys(votes)[index], percentage]);
};

export async function POST(request: NextRequest) {
  // Get the session ID from the request
  const sessionId = request.cookies.get('sessionId')?.value;
  if (!sessionId) throw new Error('No session ID found');

  // Save the user's vote
  const body = (await request.json()) as { id: string; choice: string };
  axiom.ingest('vote', [{ sessionId, id: body.id, choice: body.choice }]);

  // Get the percentage of votes for each item
  const percentages = await calculatePercentageOfVotes(body.id);

  // Return the percentage of votes for each item
  return new Response(JSON.stringify(percentages));
}
