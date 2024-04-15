import { globalStore } from '@/store';
import { useStore } from '@tanstack/react-store';
import { ResultPanel } from './results-panel';

export const Results = () => {
  const store = useStore(globalStore);

  if (!store.results) {
    return null;
  }

  return (
    <main className="flex flex-col md:flex-row items-center h-full text-black">
      <ResultPanel
        className="bg-[#ff00f7] text-4xl font-bold"
        text={store.results[0].choice}
        percentage={store.results[0].percentage}
      />
      <button
        onClick={() => {
          store.next();
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black dark:bg-white rounded-full w-[50px] h-[50px] font-mono text-center border-none text-[18px] leading-[50px] cursor-pointer"
      >
        next
      </button>
      <ResultPanel
        className="bg-[#0095f8] text-4xl font-bold"
        text={store.results[1].choice}
        percentage={store.results[1].percentage}
      />
    </main>
  );
};
