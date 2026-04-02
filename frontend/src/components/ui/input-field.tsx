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
      <label htmlFor={inputId} className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-text-strong)]">
          {label}
        </span>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-info)] focus:ring-2 focus:ring-[var(--color-info)]/25",
            className,
          )}
          {...props}
        />
        {error ? <span className="text-sm text-[#b55050]">{error}</span> : null}
      </label>
    );
  },
);

InputField.displayName = "InputField";
