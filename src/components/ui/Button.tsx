import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANTS = {
  brand: "btn-brand",
  ghost: "btn-ghost",
  danger: "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-all duration-200 active:scale-95",
  outline: "bg-transparent border border-white/15 hover:border-white/30 text-white/70 hover:text-white rounded-xl font-medium transition-all duration-200 active:scale-95",
};

const SIZES = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "brand", size = "md", loading, icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
