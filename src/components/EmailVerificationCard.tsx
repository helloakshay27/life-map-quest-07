import { useState, useRef } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationCardProps {
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onBackToSignIn: () => void;
  onVerify: () => Promise<boolean>;
}

const EmailVerificationCard = ({
  email,
  otp,
  onOtpChange,
  onBackToSignIn,
  onVerify,
}: EmailVerificationCardProps) => {
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const handleOtpChange = (value: string) => {
    if (hasError) setHasError(false);
    onOtpChange(value);
  };

  const handleVerify = async () => {
    setIsSubmitting(true);
    const success = await onVerify();
    setIsSubmitting(false);
    if (!success) {
      setHasError(true);
      toast({
        title: "Invalid OTP",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startCooldown = () => {
    setResendCooldown(30);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      const res = await fetch("https://life-api.lockated.com/resend-verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to resend");
      }

      toast({
        title: "OTP sent",
        description: "A new verification code has been sent to your email.",
      });
      startCooldown();
    } catch (error) {
      toast({
        title: "Resend failed",
        description:
          error instanceof Error ? error.message : "Could not send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

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
            onChange={handleOtpChange}
            containerClassName="justify-center"
          >
            <InputOTPGroup className="w-full justify-center gap-2 sm:gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className={cn(
                    "h-12 w-12 rounded-xl border text-base font-semibold shadow-sm first:rounded-xl first:border last:rounded-xl",
                    hasError
                      ? "border-red-400 text-red-600 focus:border-red-500"
                      : "border-slate-200"
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p className={cn("mt-4 text-sm", hasError ? "text-red-500" : "text-slate-500")}>
            {hasError
              ? "Incorrect code. Please try again."
              : "Enter the verification code sent to your email"}
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-8 w-full"
          disabled={isSubmitting || otp.length !== 6}
          onClick={handleVerify}
        >
          {isSubmitting ? "Verifying..." : "Verify email"}
        </Button>

        <p className="mt-5 text-sm text-slate-500">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="font-semibold text-slate-700 transition-colors hover:text-slate-950 disabled:opacity-50"
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationCard;