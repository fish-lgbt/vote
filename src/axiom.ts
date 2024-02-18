import { Axiom } from '@axiomhq/js';

if (!process.env.AXIOM_TOKEN || !process.env.AXIOM_ORG_ID) {
  throw new Error('AXIOM_TOKEN and AXIOM_ORG_ID environment variables are required');
}

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
});
