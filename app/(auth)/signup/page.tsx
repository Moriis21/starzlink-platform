"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, ShieldCheck, Sparkles, Bell, LayoutGrid } from "lucide-react";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "", confirm_password: "", user_type: "student",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", valid: form.password.length >= 8 },
    { label: "Include uppercase and lowercase letters", valid: /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) },
    { label: "Include a number or special character", valid: /[\d!@#$%^&*]/.test(form.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { toast.error("Please agree to the Privacy Policy."); return; }
    if (form.password !== form.confirm_password) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { data, error } = await insforge.auth.signUp({
        email: form.email,
        password: form.password,
        name: form.full_name,
      });

      if (error) throw error;

      // Save extra profile data
      if (data?.user?.id) {
        await insforge.database.from("profiles").upsert([{
          id: data.user.id,
          full_name: form.full_name,
          phone: form.phone,
          user_type: form.user_type,
        }], { onConflict: "id" });
      }

      if (data?.requireEmailVerification) {
        toast.success("Account created! Check your email for a 6-digit verification code.");
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        toast.success("Account created successfully! Welcome to StarzLink.");
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-b from-[#0d1b4b] to-[#1a3c8f] w-72 p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold mb-2">Join StarzLink</h2>
            <p className="text-blue-200 text-sm mb-6">Create your account and unlock a world of opportunities.</p>
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto">
              <User className="w-16 h-16 text-blue-200" />
            </div>
          </div>
          <div className="mt-8 space-y-3 w-full">
            {[
              { icon: ShieldCheck, label: "Secure & Private", desc: "Your data is safe with us." },
              { icon: Sparkles, label: "Personalized Experience", desc: "Get recommendations that matter." },
              { icon: Bell, label: "Timely Updates", desc: "Never miss important opportunities." },
              { icon: LayoutGrid, label: "All in One Place", desc: "Jobs, scholarships, trainings and more." },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-2">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-blue-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-blue-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Sign Up</h1>
          <p className="text-gray-500 text-sm mb-6">Let's get you started with your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Enter your full name" className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter your email address" className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Enter your phone number" className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">I am a</label>
              <div className="grid grid-cols-4 gap-2">
                {["student", "graduate", "professional", "institution"].map(type => (
                  <button key={type} type="button" onClick={() => setForm(f => ({ ...f, user_type: type }))} className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-colors border ${form.user_type === type ? "bg-[#1a3c8f] border-[#1a3c8f] text-white" : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Create a strong password" className="w-full pl-10 pr-10 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map(({ label, valid }) => (
                    <div key={label} className={`flex items-center gap-1.5 text-xs ${valid ? "text-green-600" : "text-gray-400"}`}>
                      <CheckCircle className={`w-3.5 h-3.5 ${valid ? "text-green-500" : "text-gray-300"}`} />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showConfirm ? "text" : "password"} value={form.confirm_password} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} placeholder="Confirm your password" className={`w-full pl-10 pr-10 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-1 ${form.confirm_password && form.password !== form.confirm_password ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#1a3c8f] focus:ring-[#1a3c8f]"}`} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="agree-signup" checked={agree} onChange={e => setAgree(e.target.checked)} className="accent-[#1a3c8f] mt-0.5" />
              <label htmlFor="agree-signup" className="text-xs text-gray-500">
                I agree to the <Link href="/privacy" className="text-[#1a3c8f] hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-[#1a3c8f] hover:underline">Terms of Use</Link>.
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 disabled:opacity-60 text-sm">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or sign up with</div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={async () => {
                try {
                  const { data, error } = await insforge.auth.signInWithOAuth({ provider: "google", redirectTo: `${window.location.origin}/auth/callback` });
                  if (error) throw error;
                  if (data?.url) window.location.href = data.url;
                } catch { toast.error("Google sign-up failed."); }
              }}
              className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#1a3c8f] hover:bg-blue-50 font-medium transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const { data, error } = await insforge.auth.signInWithOAuth({ provider: "linkedin", redirectTo: `${window.location.origin}/auth/callback` });
                  if (error) throw error;
                  if (data?.url) window.location.href = data.url;
                } catch { toast.error("LinkedIn sign-up not configured yet."); }
              }}
              className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#0A66C2] hover:bg-blue-50 font-medium transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1a3c8f] font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
