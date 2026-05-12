"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Login successful! Welcome back.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex">
        {/* Left Decorative Panel */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-b from-[#0d1b4b] to-[#1a3c8f] w-72 p-8 text-white">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <svg viewBox="0 0 32 32" fill="none" className="w-12 h-12">
                <rect x="3" y="8" width="11" height="16" rx="1" fill="white"/>
                <rect x="18" y="8" width="11" height="16" rx="1" fill="white" opacity="0.7"/>
                <rect x="14" y="6" width="4" height="20" rx="1" fill="#60a5fa"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold mb-2">Welcome Back!</h2>
            <p className="text-blue-200 text-sm">Log in to continue your journey with StarzLink.</p>
          </div>
          <div className="mt-8 space-y-3 w-full">
            {["Secure & Private", "Personalized Experience", "Timely Updates", "All in One Place"].map((f, i) => (
              <div key={f} className="flex items-center gap-2 text-sm text-blue-200">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-8 md:p-12">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome Back!</h1>
          <p className="text-gray-500 text-sm mb-7">Log in to continue your journey with StarzLink.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Enter your email address"
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-[#1a3c8f]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#1a3c8f] hover:underline font-medium">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 text-sm">
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or log in with</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Google", "LinkedIn", "Microsoft"].map((provider) => (
              <button key={provider} className="flex items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#1a3c8f] hover:bg-blue-50 transition-colors font-medium">
                {provider}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#1a3c8f] font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
