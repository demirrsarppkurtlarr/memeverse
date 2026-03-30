import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "input-field",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500/50 focus:border-red-500/70",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        {hint && !error && <p className="text-xs text-white/25 font-mono">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
