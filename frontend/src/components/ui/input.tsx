import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = "text", leftIcon, rightIcon, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label != null && (
          <label htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
            {props.required === true && (
              <span className="ml-1 text-destructive" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon != null && (
            <span className="pointer-events-none absolute left-3 flex items-center text-muted-foreground" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border border-input bg-secondary/40 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground/50 transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon  != null ? "pl-9"  : "pl-3",
              rightIcon != null ? "pr-9"  : "pr-3",
              error != null && "border-destructive focus-visible:ring-destructive",
              className
            )}
            aria-invalid={error != null}
            aria-describedby={
              error != null ? `${inputId}-error` : hint != null ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightIcon != null && (
            <span className="pointer-events-none absolute right-3 flex items-center text-muted-foreground" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>

        {error != null && (
          <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">{error}</p>
        )}
        {hint != null && error == null && (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
