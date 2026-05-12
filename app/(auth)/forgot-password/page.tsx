"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({ email });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent to your email!");
    } catch {
      toast.error("Failed to send reset link. Check your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm mb-6">We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.</p>
            <Link href="/login" className="flex items-center justify-center gap-1.5 w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a3c8f] mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mb-7">No worries! Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 disabled:opacity-60 text-sm">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Remember your password? <Link href="/login" className="text-[#1a3c8f] font-semibold hover:underline">Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
