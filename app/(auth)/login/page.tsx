"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  /* ── Email / Password login ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("verif")) {
        toast.error("Please verify your email first. Check your inbox for a verification code.");
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        toast.error("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Google OAuth ── */
  const handleGoogle = async () => {
    setOauthLoading("google");
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider: "google",
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      // InsForge auto-redirects; if not, redirect manually
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err?.message || "Google login failed.");
      setOauthLoading(null);
    }
  };

  /* ── LinkedIn OAuth ── */
  const handleLinkedIn = async () => {
    setOauthLoading("linkedin");
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider: "linkedin",
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error("LinkedIn login is not configured yet. Please use email or Google.");
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex">

        {/* ── Left decorative panel ── */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-b from-[#0d1b4b] to-[#1a3c8f] w-72 p-8 text-white flex-shrink-0">
          <div className="text-center">
            <Image src="/images/logo.jpg" alt="StarzLink" width={120} height={120} style={{ height: "80px", width: "auto", margin: "0 auto" }} className="object-contain brightness-0 invert mb-6" />
            <h2 className="text-2xl font-extrabold mb-2">Welcome Back!</h2>
            <p className="text-blue-200 text-sm">Log in to continue your journey with StarzLink.</p>
          </div>
          <div className="space-y-3">
            {[
              { icon: "🔒", t: "Secure & Private", d: "Your data is safe with us." },
              { icon: "✨", t: "Personalized", d: "Get recommendations that matter." },
              { icon: "🔔", t: "Timely Updates", d: "Never miss opportunities." },
              { icon: "🎓", t: "All in One Place", d: "Jobs, scholarships and more." },
            ].map(({ icon, t, d }) => (
              <div key={t} className="flex items-start gap-2">
                <span className="text-lg">{icon}</span>
                <div><p className="text-sm font-semibold">{t}</p><p className="text-xs text-blue-300">{d}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <div className="flex-1 p-8 md:p-12">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome Back!</h1>
          <p className="text-gray-500 text-sm mb-7">Log in to continue your journey with StarzLink.</p>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogle}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#1a3c8f] hover:bg-blue-50 transition-all disabled:opacity-60"
            >
              {oauthLoading === "google" ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-[#1a3c8f] rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button
              onClick={handleLinkedIn}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#0A66C2] hover:bg-blue-50 transition-all disabled:opacity-60"
            >
              {oauthLoading === "linkedin" ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-[#0A66C2] rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              )}
              Continue with LinkedIn
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or sign in with email</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter your email address" className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Enter your password" className="w-full pl-10 pr-11 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-[#1a3c8f]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#1a3c8f] font-medium hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Logging in…</> : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account? <Link href="/signup" className="text-[#1a3c8f] font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
