import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string[];
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>
        <span>
          {label}
          {required ? (
            <>
              <span className="text-destructive" aria-hidden="true">
                {" *"}
              </span>
              <span className="sr-only"> (required)</span>
            </>
          ) : null}
        </span>
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error?.[0] ? (
        <p className="text-xs text-destructive" role="alert">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}
