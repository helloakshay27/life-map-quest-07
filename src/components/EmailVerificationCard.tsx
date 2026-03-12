import { ShieldCheck, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface EmailVerificationCardProps {
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onBackToSignIn: () => void;
  onVerify: () => void;
  onResend: () => void;
  isSubmitting?: boolean;
}

const EmailVerificationCard = ({
  email,
  otp,
  onOtpChange,
  onBackToSignIn,
  onVerify,
  onResend,
  isSubmitting = false,
}: EmailVerificationCardProps) => {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/95 p-8 shadow-2xl backdrop-blur sm:p-10">
      <button
        type="button"
        onClick={onBackToSignIn}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Verify your email
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
          We&apos;ve sent a 6-digit code to
          <span className="block font-semibold text-slate-900">{email}</span>
        </p>

        <div className="mt-8 w-full">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={onOtpChange}
            containerClassName="justify-center"
          >
            <InputOTPGroup className="w-full justify-center gap-2 sm:gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-12 w-12 rounded-xl border border-slate-200 text-base font-semibold shadow-sm first:rounded-xl first:border last:rounded-xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p className="mt-4 text-sm text-slate-500">
            Enter the verification code sent to your email
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-8 w-full"
          disabled={isSubmitting || otp.length !== 6}
          onClick={onVerify}
        >
          {isSubmitting ? "Verifying..." : "Verify email"}
        </Button>

        <p className="mt-5 text-sm text-slate-500">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={onResend}
            className="font-semibold text-slate-700 transition-colors hover:text-slate-950"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationCard;