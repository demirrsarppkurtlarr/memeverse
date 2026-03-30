import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
}

const VARIANTS = {
  default: "bg-white/8 text-white/60 border-white/10",
  brand: "bg-brand-500/15 text-brand-400 border-brand-500/30",
  success: "bg-green-500/15 text-green-400 border-green-500/30",
  warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  danger: "bg-red-500/15 text-red-400 border-red-500/30",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const SIZES = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border font-medium",
      VARIANTS[variant],
      SIZES[size],
      className
    )}>
      {children}
    </span>
  );
}
