"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Please enter the 6-digit code."); return; }
    setLoading(true);
    try {
      const { data, error } = await insforge.auth.verifyEmail({ email, otp: code });
      if (error) throw error;
      setVerified(true);
      toast.success("Email verified successfully!");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await insforge.auth.resendVerificationEmail({ email });
      toast.success("New verification code sent to your email!");
    } catch {
      toast.error("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-500 text-sm">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <Link href="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a3c8f] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#1a3c8f]" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-500 text-sm">
            We sent a 6-digit verification code to<br />
            <strong className="text-gray-900">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full border border-gray-200 rounded-xl px-4 py-4 text-2xl font-bold text-center tracking-[0.5em] text-gray-900 focus:outline-none focus:border-[#1a3c8f] focus:ring-2 focus:ring-[#1a3c8f]/20 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying…</> : "Verify Email"}
          </button>
        </form>

        <div className="text-center mt-5">
          <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 text-[#1a3c8f] font-semibold text-sm hover:underline mx-auto disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Sending…" : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3c8f]" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
