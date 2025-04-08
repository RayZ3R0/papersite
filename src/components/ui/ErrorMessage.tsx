"use client";

interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
}

export function ErrorMessage({
  title = "Error",
  message,
  action,
}: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-destructive/10 border border-destructive p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-destructive">{title}</h3>
        <p className="text-text-muted">{message}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
