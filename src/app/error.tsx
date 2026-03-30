"use client";

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <span className="text-6xl mb-4">😵</span>
      <h1 className="font-display text-4xl tracking-wider mb-2 text-white">Oops!</h1>
      <p className="text-white/50 text-sm mb-6 max-w-sm">
        We couldn't load this page right now. Please try again.
      </p>
      <button onClick={reset} className="btn-brand">Refresh</button>
    </div>
  );
}
