import type { NextRequest } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { UUID } from 'crypto';

export const runtime = 'edge';

type PollsRow = {
  id: UUID;
  question: string;
  choices: `${string},${string}`;
};

export type PollsResponse = {
  id: string;
  question: string;
  choices: string[];
}[];

export async function GET(request: NextRequest) {
  const { env } = getRequestContext();

  // Get the session ID from the request
  const sessionId = request.cookies.get('sessionId')?.value;
  if (!sessionId) throw new Error('No session ID found');

  // Get all the polls that the user has not voted on
  // Fetch the id, question, choices for each poll
  const { results: rows } = await env.DB.prepare(
    `
    SELECT polls.id, polls.question, GROUP_CONCAT(choices.choice, ', ') AS choices
    FROM polls
    LEFT JOIN choices ON polls.id = choices.pollId
    GROUP BY polls.id, polls.question;
  `,
  )
    // .bind(sessionId)
    .all<PollsRow>();

  const choices = rows.map((row) => {
    return {
      id: row.id,
      question: row.question ? row.question : undefined,
      choices: row.choices.split(',').map((choice) => choice.trim()),
    };
  });

  // Return the choices that the user has not voted on
  return new Response(JSON.stringify(choices));
}
