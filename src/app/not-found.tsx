import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <div className="relative mb-6">
        <span className="font-display text-[10rem] leading-none text-white/5 select-none">404</span>
        <span className="absolute inset-0 flex items-center justify-center text-6xl">🤷</span>
      </div>
      <h1 className="font-display text-4xl tracking-wider mb-2 gradient-text">PAGE NOT FOUND</h1>
      <p className="text-white/40 text-sm mb-8 max-w-xs">
        This meme has been lost to the void. Or maybe it never existed.
      </p>
      <Link href="/" className="btn-brand">
        Back to Feed
      </Link>
    </div>
  );
}
