import { getRequestContext } from '@cloudflare/next-on-pages';

import type { NextRequest } from 'next/server';

export const runtime = 'edge';

type VoteRow = {
  choice: string;
  votes: number;
  percentage: number;
};

export type VoteResponse = VoteRow[];

const calculatePercentageOfVotes = async (pollId: string) => {
  const { env } = getRequestContext();

  // Get the number of votes for each choice
  const { results } = await env.DB.prepare(
    `SELECT c.choice, 
    COUNT(v.choice) AS vote_count,
    (ROUND(COUNT(v.choice) * 100.0 / total.total_votes)) AS percentage
    FROM choices c
    LEFT JOIN votes v ON c.choice = v.choice AND c.pollId = v.pollId
    JOIN (
      SELECT pollId, COUNT(*) AS total_votes
      FROM votes
      WHERE pollId = ?1
      GROUP BY pollId
    ) total ON c.pollId = total.pollId
    WHERE c.pollId = ?1
    GROUP BY c.choice;
  `,
  )
    .bind(pollId)
    .all<VoteRow>();

  return results;
};

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();

  // Get the session ID from the request
  const sessionId = request.cookies.get('sessionId')?.value;
  if (!sessionId) throw new Error('No session ID found');

  // Get the user's vote from the request
  const { pollId, choice } = await request.json<{ pollId: string; choice: string }>();

  // Save the user's vote
  await env.DB.prepare('INSERT INTO votes (id, pollId, sessionId, choice) VALUES (?1, ?2, ?3, ?4);')
    .bind(crypto.randomUUID(), pollId, sessionId, choice)
    .run();

  // Get the percentage of votes for each item
  const percentages = await calculatePercentageOfVotes(pollId);

  // Return the percentage of votes for each item
  return new Response(JSON.stringify(percentages));
}
