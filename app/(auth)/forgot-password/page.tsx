"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";

type Step = "email" | "code" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // ── Step 1: Request OTP via InsForge's native reset ─────────────────────
  const sendCode = async (targetEmail: string) => {
    // InsForge's "Reset Password Method: code" — this sends a 6-digit OTP natively
    const { error } = await insforge.auth.sendResetPasswordEmail({ email: targetEmail });
    if (error) throw error;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendCode(email);
      setStep("code");
      toast.success("Reset code sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err?.message || "Could not send code. Check your email address.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendCode(email);
      toast.success("New code sent!");
    } catch {
      toast.error("Failed to resend. Try again.");
    }
    setResending(false);
  };

  // ── Step 2: Verify OTP + set new password ───────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Enter the 6-digit code from your email."); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }

    setLoading(true);
    try {
      // InsForge verifies the OTP and creates a recovery session
      const { error: verifyError } = await (insforge.auth as any).verifyOtp({
        email,
        token: code,
        type: "recovery",
      });
      if (verifyError) throw verifyError;

      // With active recovery session, update the password
      const { error: updateError } = await (insforge.auth as any).updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setStep("done");
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired code. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b4b] via-[#1a3c8f] to-[#2563eb] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md">

        {/* ── Done ─────────────────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Password Updated!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Link href="/login" className="flex items-center justify-center gap-2 w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors">
              Go to Login
            </Link>
          </div>
        )}

        {/* ── Step 1: Enter email ───────────────────────────────────────────── */}
        {step === "email" && (
          <>
            <Link href="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a3c8f] mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
            <div className="w-12 h-12 bg-[#1a3c8f]/10 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-[#1a3c8f]" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mb-7">
              Enter your email address and we&apos;ll send you a <strong>6-digit code</strong> to reset your password.
            </p>
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 disabled:opacity-60 transition-colors"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Reset Code"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Remember your password?{" "}
              <Link href="/login" className="text-[#1a3c8f] font-semibold hover:underline">Log in</Link>
            </p>
          </>
        )}

        {/* ── Step 2: Enter code + new password ────────────────────────────── */}
        {step === "code" && (
          <>
            <button
              onClick={() => setStep("email")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a3c8f] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Change email
            </button>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-[#1a3c8f]" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Check Your Email</h1>
            <p className="text-gray-500 text-sm mb-1">
              We sent a <strong>6-digit code</strong> to:
            </p>
            <p className="text-[#1a3c8f] font-bold text-sm mb-6">{email}</p>

            <form onSubmit={handleReset} className="space-y-4">
              {/* Code input */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">6-Digit Reset Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20"
                  required
                />
                <p className="text-xs text-gray-400 mt-1.5">Check your inbox and spam folder · Code expires in 15 minutes</p>
              </div>

              {/* New password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 pr-11 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full px-4 pr-11 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6 || !newPassword || newPassword !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 disabled:opacity-60 transition-colors"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting…</> : "Reset Password"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500">
                Didn&apos;t receive a code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[#1a3c8f] font-semibold hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend code"}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
