"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, GraduationCap, Briefcase, Bell, LayoutGrid } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import Logo from "@/components/ui/Logo";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    const social = searchParams.get("social");
    const action = searchParams.get("action");
    const error = searchParams.get("error");
    const email = searchParams.get("email");

    if (error === "linkedin_not_configured" || error === "facebook_not_configured") {
      toast.error("This social login is not configured yet.");
    } else if (error === "oauth_failed") {
      toast.error("Social login failed. Please try again.");
    } else if (error === "no_email") {
      toast.error("Could not retrieve email from social provider.");
    } else if (social && action === "signin" && email) {
      toast.success(`We sent a sign-in link to ${decodeURIComponent(email)}. Check your inbox!`);
      setForm(f => ({ ...f, email: decodeURIComponent(email) }));
    } else if (social && action === "signup" && email) {
      toast.success(`Account created! Check ${decodeURIComponent(email)} for a verification link.`);
      setForm(f => ({ ...f, email: decodeURIComponent(email) }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("verif")) {
        toast.error("Please verify your email first.");
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        toast.error("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider,
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error(`${provider === "google" ? "Google" : "GitHub"} login failed. Try again.`);
      setOauthLoading(null);
    }
  };

  const handleCustomOAuth = (provider: "linkedin" | "facebook") => {
    window.location.href = `/api/auth/${provider}`;
  };

  const features = [
    { icon: GraduationCap, label: "Scholarships", color: "bg-purple-500" },
    { icon: Briefcase, label: "Job Leads", color: "bg-blue-500" },
    { icon: Bell, label: "Timely Updates", color: "bg-green-500" },
    { icon: LayoutGrid, label: "Resources", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col lg:flex-row"
      >
        {/* ── Left panel (desktop) ── */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-b from-[#0d1b4b] to-[#1a3c8f] w-72 flex-shrink-0 p-8 text-white">
          <div className="text-center">
            {/* Real logo in white container */}
            <div className="flex justify-center mb-5">
              <Logo variant="dark" size="sm" href="/" />
            </div>
            <h2 className="text-xl font-extrabold mb-2">Welcome Back!</h2>
            <p className="text-blue-200 text-sm leading-relaxed">Log in to continue your journey with StarzLink.</p>
          </div>
          <div className="space-y-3">
            {features.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-blue-100 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile logo strip ── */}
        <div className="lg:hidden flex justify-center pt-7 pb-4 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f]">
          <Logo variant="dark" size="sm" href="/" />
        </div>

        {/* ── Form ── */}
        <div className="flex-1 p-6 sm:p-10">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Sign In</h1>
          <p className="text-gray-500 text-sm mb-6">Log in to your StarzLink account.</p>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Google */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuth("google")}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-60"
            >
              {oauthLoading === "google"
                ? <span className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                : <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
              }
              Google
            </motion.button>

            {/* GitHub */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuth("github")}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-60"
            >
              {oauthLoading === "github"
                ? <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
                : <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
              }
              GitHub
            </motion.button>

            {/* LinkedIn */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleCustomOAuth("linkedin")}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#0A66C2] hover:bg-blue-50 transition-all disabled:opacity-60"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </motion.button>

            {/* Facebook */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleCustomOAuth("facebook")}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#1877F2] hover:bg-blue-50 transition-all disabled:opacity-60"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </motion.button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or continue with email</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter your email" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors" required />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#1a3c8f] font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Enter your password" className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</> : "Sign In"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#1a3c8f] font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
