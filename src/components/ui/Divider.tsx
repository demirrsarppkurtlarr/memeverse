import { cn } from "@/lib/utils";

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-xs text-white/30 font-mono uppercase tracking-wider shrink-0">{label}</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>
    );
  }
  return <div className={cn("h-px bg-white/8", className)} />;
}
