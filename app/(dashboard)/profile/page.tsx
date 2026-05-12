"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usersApi, storageApi } from "@/lib/api";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";
import { User, Mail, Phone, Camera, Save, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: "", phone: "", user_type: "student", profile_image: "",
  });
  const [passwords, setPasswords] = useState({ current: "", new_: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passStep, setPassStep] = useState<"form" | "done">("form");
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        user_type: user.user_type || "student",
        profile_image: user.profile_image || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await usersApi.update(user.id, form);
      toast.success("Profile updated successfully!");
    } catch { toast.error("Failed to update profile."); }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const { url, error } = await storageApi.uploadAvatar(file, user.id);
      if (error) throw error;
      if (url) {
        setForm(f => ({ ...f, profile_image: url }));
        await usersApi.update(user.id, { profile_image: url });
        toast.success("Profile photo updated!");
      }
    } catch { toast.error("Upload failed."); }
    setUploading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) { toast.error("Enter your current password."); return; }
    if (passwords.new_.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (passwords.new_ !== passwords.confirm) { toast.error("New passwords don't match."); return; }
    if (passwords.current === passwords.new_) { toast.error("New password must be different from the current one."); return; }

    setChangingPass(true);
    try {
      // Step 1: Verify old password by attempting to sign in
      const { error: verifyError } = await insforge.auth.signInWithPassword({
        email: user?.email || "",
        password: passwords.current,
      });
      if (verifyError) {
        toast.error("Current password is incorrect.");
        setChangingPass(false);
        return;
      }

      // Step 2: Update to new password
      const { error: updateError } = await (insforge.auth as any).updateUser({
        password: passwords.new_,
      });
      if (updateError) throw updateError;

      setPasswords({ current: "", new_: "", confirm: "" });
      setPassStep("done");
      toast.success("Password changed successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password.");
    }
    setChangingPass(false);
  };

  const profileCompletion = user ? [user.full_name, user.email, form.phone, form.profile_image, user.user_type].filter(Boolean).length / 5 * 100 : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your account information and preferences.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar & Completion */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {form.profile_image ? (
                <img src={form.profile_image} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#1a3c8f]/10" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#1a3c8f] to-blue-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#1a3c8f] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-800 shadow-md">
                {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{user?.full_name}</h3>
            <p className="text-sm text-gray-500 mb-1">{user?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full capitalize font-medium">{user?.user_type}</span>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Profile Completion</span>
                <span className="font-bold text-[#1a3c8f]">{Math.round(profileCompletion)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#1a3c8f] h-2 rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Complete your profile for better recommendations</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Account Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium capitalize text-[#1a3c8f]">{user?.role?.replace("_", " ")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Member Since</span><span className="font-medium text-gray-700">2025</span></div>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5">Personal Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={user?.email || ""} disabled className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234 800 123 4567" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]" />
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
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60">
                <Save className="w-4 h-4" />{saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>

          {/* Password */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1a3c8f]" /> Change Password
            </h2>
            <p className="text-sm text-gray-500 mb-5">Enter your current password to verify, then set a new one.</p>

            {passStep === "done" ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-gray-900 mb-1">Password Changed!</p>
                <p className="text-sm text-gray-500 mb-4">Your password has been updated successfully.</p>
                <button
                  onClick={() => setPassStep("form")}
                  className="text-sm text-[#1a3c8f] font-semibold hover:underline"
                >
                  Change again
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwords.current}
                      onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                      placeholder="Enter your current password"
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]"
                      required
                    />
                    <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwords.new_}
                      onChange={e => setPasswords(p => ({ ...p, new_: e.target.value }))}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwords.confirm && passwords.new_ !== passwords.confirm && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={changingPass || !passwords.current || !passwords.new_ || passwords.new_ !== passwords.confirm}
                  className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {changingPass ? "Verifying…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
