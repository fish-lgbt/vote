'use client';
import { globalStore } from '@/store';
import { useStore } from '@tanstack/react-store';

export const LandingPage = () => {
  const store = useStore(globalStore);
  return (
    <main className="flex w-full h-full items-center justify-center bg-[#00ff95]">
      <button
        onClick={() => {
          store.next();
        }}
        className="w-full h-full block text-4xl font-mono text-black font-bold"
      >
        <h1>Start voting</h1>
      </button>
    </main>
  );
};
