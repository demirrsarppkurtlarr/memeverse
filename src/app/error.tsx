"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <span className="text-6xl mb-4">💥</span>
      <h1 className="font-display text-4xl tracking-wider mb-2 text-red-400">SOMETHING BROKE</h1>
      <p className="text-white/40 text-sm mb-2 max-w-sm">{error.message || "An unexpected error occurred"}</p>
      {error.digest && (
        <p className="text-white/20 text-xs font-mono mb-6">Error ID: {error.digest}</p>
      )}
      <button onClick={reset} className="btn-brand">Try Again</button>
    </div>
  );
}
