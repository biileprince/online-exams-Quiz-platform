import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, className, error, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <label htmlFor={inputId} className={cn("block space-y-1.5", className)}>
        <span className="text-sm font-medium text-[var(--color-on-surface)]">
          {label}
        </span>
        <input
          ref={ref}
          id={inputId}
          className="h-11 w-full rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] px-4 text-sm text-[var(--color-on-surface)] outline-none transition-all duration-200 placeholder:text-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          {...props}
        />
        {error ? (
          <span className="text-sm text-[var(--color-error)]">{error}</span>
        ) : null}
      </label>
    );
  },
);

InputField.displayName = "InputField";
