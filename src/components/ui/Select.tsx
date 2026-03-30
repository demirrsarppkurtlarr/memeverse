import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "input-field appearance-none pr-10 cursor-pointer",
              error && "border-red-500/50",
              className
            )}
            {...props}
          >
            {options.map(({ value, label }) => (
              <option key={value} value={value} className="bg-surface-900">
                {label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
        </div>
        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
