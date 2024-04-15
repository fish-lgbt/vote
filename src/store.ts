import { Store } from '@tanstack/store';
import { VoteResponse } from './app/api/vote/route';

type State = {
  // Polls
  index: number;
  next: () => void;

  // Voting
  results: VoteResponse | null;
  setResults: (results: VoteResponse) => void;
};

export const globalStore = new Store<State>({
  index: -1,
  next: () => {
    globalStore.setState((prev) => ({ ...prev, index: prev.index + 1, results: null }));
  },
  results: null,
  setResults: (results) => {
    globalStore.setState((prev) => ({ ...prev, results }));
  },
});
