"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/context/AuthContext";
import { User, Phone, ChevronRight, GraduationCap, Briefcase, Building2, Users } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "@/components/ui/Logo";
import { motion } from "framer-motion";

const userTypes = [
  { value: "student", label: "Student", icon: GraduationCap, desc: "Undergraduate or postgraduate student" },
  { value: "graduate", label: "Graduate", icon: GraduationCap, desc: "Recently graduated" },
  { value: "professional", label: "Professional", icon: Briefcase, desc: "Working professional" },
  { value: "institution", label: "Institution", icon: Building2, desc: "University, NGO, company" },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: "",
    user_type: "student",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.replace("/login"); return; }
    setLoading(true);
    try {
      const { error } = await insforge.database
        .from("profiles")
        .upsert([{
          id: user.id,
          full_name: form.full_name,
          phone: form.phone,
          user_type: form.user_type,
          updated_at: new Date().toISOString(),
        }], { onConflict: "id" })
        .select();
      if (error) throw error;
      toast.success("Profile complete! Welcome to StarzLink 🎉");
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b4b] via-[#1a3c8f] to-[#2563eb] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] p-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <Logo variant="dark" size="sm" href="/" />
          </div>
          <h1 className="text-xl font-extrabold mt-2">Almost there! 🚀</h1>
          <p className="text-blue-200 text-sm mt-1">Complete your profile to get personalized opportunities</p>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {/* Full name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+231 770 787 020"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] transition-colors"
              />
            </div>
          </div>

          {/* User type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">I am a…</label>
            <div className="grid grid-cols-2 gap-2">
              {userTypes.map(({ value, label, icon: Icon, desc }) => (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setForm(f => ({ ...f, user_type: value }))}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                    form.user_type === value
                      ? "border-[#1a3c8f] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${form.user_type === value ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${form.user_type === value ? "text-[#1a3c8f]" : "text-gray-800"}`}>{label}</p>
                    <p className="text-xs text-gray-400 leading-tight">{desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
            ) : (
              <>Complete Profile <ChevronRight className="w-4 h-4" /></>
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            className="w-full text-sm text-gray-400 hover:text-gray-600 text-center transition-colors"
          >
            Skip for now
          </button>
        </form>
      </motion.div>
    </div>
  );
}
