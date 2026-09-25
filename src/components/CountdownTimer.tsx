import { formatCountdown, useCountdown } from "../hooks/useCountdown";

interface CountdownTimerProps {
  expiresAt: string;
  /** "compact" shows just the time; "full" adds the "Expires in" label. */
  variant?: "compact" | "full";
  className?: string;
}

/** Live countdown that ticks every second until the address expires. */
export function CountdownTimer({ expiresAt, variant = "full", className = "" }: CountdownTimerProps) {
  const { remainingMs, expired } = useCountdown(expiresAt);

  if (expired) {
    return (
      <span className={`font-medium text-red-500 ${className}`}>
        {variant === "full" ? "Expired" : "Expired"}
      </span>
    );
  }

  const time = formatCountdown(remainingMs);
  return (
    <span className={`font-mono font-semibold tabular-nums ${className}`}>
      {variant === "full" ? `Expires in ${time}` : time}
    </span>
  );
}
