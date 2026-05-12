"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import StarzLinkLogo from "@/components/ui/StarzLinkLogo";
import toast from "react-hot-toast";

export default function SetupPage() {
  const router = useRouter();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "", secret: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Check if any super_admin already exists
    insforge.database.from("profiles").select("id").eq("role", "super_admin").limit(1).then(({ data }) => {
      setAdminExists((data?.length ?? 0) > 0);
    });
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match."); return; }
    if (form.secret !== "STARZLINK_SETUP_2025") { toast.error("Invalid setup secret key."); return; }
    setLoading(true);
    try {
      const { data, error } = await insforge.auth.signUp({
        email: form.email,
        password: form.password,
        name: form.full_name,
      });
      if (error) throw error;

      if (data?.user?.id) {
        // Set role to super_admin in profiles
        await insforge.database.from("profiles").upsert([{
          id: data.user.id,
          full_name: form.full_name,
          role: "super_admin",
          user_type: "institution",
        }], { onConflict: "id" });
      }

      setDone(true);
      toast.success("Super Admin account created successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Setup failed.");
    }
    setLoading(false);
  };

  if (adminExists === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#1a3c8f] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <StarzLinkLogo size="md" variant="dark" showTagline={true} href="/" />
        </div>

        {adminExists ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Setup Already Complete</h2>
            <p className="text-gray-500 text-sm mb-5">A Super Admin account already exists. This setup page is disabled for security.</p>
            <button onClick={() => router.push("/login")} className="w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900">
              Go to Login
            </button>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
            <p className="text-gray-500 text-sm mb-2">Super Admin account created for <strong>{form.email}</strong>.</p>
            <p className="text-xs text-gray-400 mb-5">Please check your email to verify your account, then log in to access the admin panel.</p>
            <button onClick={() => router.push("/login")} className="w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900">
              Go to Login →
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5 p-3 bg-blue-50 rounded-xl">
              <Shield className="w-5 h-5 text-[#1a3c8f] flex-shrink-0" />
              <p className="text-sm text-[#1a3c8f] font-medium">First-time setup: Create your Super Admin account</p>
            </div>
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Admin Full Name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@starzlink.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Create a strong password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required minLength={8} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm Password</label>
                <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Confirm password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Setup Secret Key</label>
                <input type="password" value={form.secret} onChange={e => setForm(f => ({ ...f, secret: e.target.value }))} placeholder="Enter the setup secret key" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
                <p className="text-xs text-gray-400 mt-1">Default key: <code className="bg-gray-100 px-1 rounded">STARZLINK_SETUP_2025</code></p>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 disabled:opacity-60">
                {loading ? "Creating Super Admin..." : "Create Super Admin Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
