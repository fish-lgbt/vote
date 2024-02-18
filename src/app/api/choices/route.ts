import { axiom } from '@/axiom';
import { thingsToVoteOn } from '@/things-to-vote-on';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const getChoiceIdsVotedOn = async (sessionId: string) => {
  const _ = await axiom.query(
    `vote | where sessionId=="${sessionId}" | summarize count() by bin_auto(_time), id | project id`,
  );
  return _.matches?.map((_) => _.data.id as string).filter(Boolean) ?? [];
};

const getChoicesNotVotedOn = async (sessionId: string) => {
  const choiceIdsVotedOn = await getChoiceIdsVotedOn(sessionId);
  const choices = [...thingsToVoteOn.entries()]
    .filter(([id]) => !choiceIdsVotedOn?.includes(id))
    .map(([id, choices]) => ({ id, choices }));
  return choices;
};

export async function GET(request: NextRequest) {
  // Get the session ID from the request
  const sessionId = request.cookies.get('sessionId')?.value;
  if (!sessionId) throw new Error('No session ID found');

  // Get the choices that the user has not voted on
  const choices = await getChoicesNotVotedOn(sessionId);

  // Return the choices that the user has not voted on
  return new Response(JSON.stringify(choices));
}
