import Link from "next/link";

export default function MemeNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <span className="text-6xl mb-4">🖼️</span>
      <h2 className="font-display text-3xl tracking-wider mb-2">MEME NOT FOUND</h2>
      <p className="text-white/40 text-sm mb-6">This meme may have been deleted or never existed.</p>
      <Link href="/" className="btn-brand">Back to Feed</Link>
    </div>
  );
}
