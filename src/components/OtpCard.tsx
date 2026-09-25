import { CopyButton } from "./CopyButton";

interface OtpCardProps {
  otp: string;
}

/** Prominent verification-code card shown when an email contains an OTP. */
export function OtpCard({ otp }: OtpCardProps) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center dark:border-indigo-900 dark:bg-indigo-950/50">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        Verification Code
      </p>
      <p className="mt-2 font-mono text-4xl font-bold tracking-[0.2em] text-indigo-700 dark:text-indigo-200">
        {otp}
      </p>
      <div className="mt-3 flex justify-center">
        <CopyButton text={otp} label="Copy Code" />
      </div>
    </div>
  );
}
