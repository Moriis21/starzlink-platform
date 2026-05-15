"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { storageApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, Camera, Save, Lock, Eye, EyeOff,
  CheckCircle2, ShieldCheck, MapPin, GraduationCap,
  Globe, Briefcase, Edit3, CheckCircle
} from "lucide-react";

interface FullProfile {
  full_name?: string; email?: string; phone?: string; whatsapp_number?: string;
  user_type?: string; role?: string; bio?: string; profile_image?: string; avatar_url?: string;
  country?: string; county_state?: string; city_community?: string;
  current_location?: string; address_description?: string;
  preferred_language?: string; occupation?: string; education_level?: string;
  institution_workplace?: string; area_of_interest?: string; career_goal?: string;
  profile_completed?: boolean; created_at?: string; last_login_at?: string;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400 flex-shrink-0 w-36">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FullProfile>({});
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ current: "", new_: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passStep, setPassStep] = useState<"form" | "done">("form");
  const [changingPass, setChangingPass] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load full profile from DB
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const { data } = await insforge.database.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (data) {
          setProfile(data as FullProfile);
        } else {
          setProfile({ full_name: user.full_name, email: user.email, phone: user.phone, user_type: user.user_type });
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const { url, error } = await storageApi.uploadAvatar(file, user.id);
      if (error) throw error;
      if (url) {
        setProfile(p => ({ ...p, profile_image: url, avatar_url: url }));
        await insforge.database.from("profiles").update({ profile_image: url, avatar_url: url }).eq("id", user.id);
        toast.success("Profile photo updated!");
      }
    } catch { toast.error("Upload failed."); }
    setUploading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) { toast.error("Enter your current password."); return; }
    if (passwords.new_.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (passwords.new_ !== passwords.confirm) { toast.error("Passwords don't match."); return; }
    setChangingPass(true);
    try {
      const { error: verifyError } = await insforge.auth.signInWithPassword({ email: user?.email || "", password: passwords.current });
      if (verifyError) { toast.error("Current password is incorrect."); setChangingPass(false); return; }
      const { error: updateError } = await (insforge.auth as any).updateUser({ password: passwords.new_ });
      if (updateError) throw updateError;
      setPasswords({ current: "", new_: "", confirm: "" });
      setPassStep("done");
      toast.success("Password changed successfully!");
    } catch (err: any) { toast.error(err?.message || "Failed to change password."); }
    setChangingPass(false);
  };

  const avatarUrl = profile.profile_image || profile.avatar_url;
  const displayName = profile.full_name || user?.full_name || "User";
  const completedFields = [
    profile.full_name, profile.phone, profile.country, profile.county_state,
    profile.city_community, profile.occupation, profile.preferred_language,
  ].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 7) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#1a3c8f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm">Your account information and details.</p>
        </div>
        <Link href="/dashboard/settings/profile"
          className="flex items-center gap-2 bg-[#1a3c8f] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-900 transition-colors text-sm">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — avatar + completion */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#1a3c8f]/10" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#1a3c8f] to-blue-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#1a3c8f] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-800 shadow-md">
                {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{displayName}</h3>
            <p className="text-sm text-gray-500 mb-1">{profile.email || user?.email}</p>
            <div className="flex items-center justify-center gap-2 flex-wrap mt-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full capitalize font-medium">{profile.user_type || "student"}</span>
              {profile.profile_completed && (
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3 h-3" /> Complete
                </span>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Profile Strength</span>
                <span className="font-bold text-[#1a3c8f]">{completionPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#1a3c8f] h-2 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
              </div>
              {completionPct < 100 && (
                <Link href="/dashboard/settings/profile" className="text-xs text-[#1a3c8f] hover:underline mt-1.5 block">
                  Complete your profile →
                </Link>
              )}
            </div>
          </div>

          {/* Account info card */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-3">Account Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium capitalize text-[#1a3c8f]">{(profile.role || "user").replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-green-600">{profile.profile_completed ? "Complete" : "Incomplete"}</span>
              </div>
              {profile.preferred_language && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Language</span>
                  <span className="font-medium text-gray-700">{profile.preferred_language}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — profile details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1a3c8f]" /> Personal Information
            </h2>
            <InfoRow label="Full Name" value={profile.full_name} />
            <InfoRow label="Email" value={profile.email || user?.email} />
            <InfoRow label="Phone" value={profile.phone} />
            <InfoRow label="WhatsApp" value={profile.whatsapp_number} />
            <InfoRow label="User Type" value={profile.user_type} />
            {profile.bio && (
              <div className="pt-2">
                <p className="text-sm text-gray-400 mb-1">Bio</p>
                <p className="text-sm text-gray-700">{profile.bio}</p>
              </div>
            )}
            {!profile.phone && !profile.bio && (
              <div className="py-3 text-center">
                <p className="text-sm text-gray-400 mb-2">No personal details saved yet.</p>
                <Link href="/dashboard/settings/profile" className="text-sm text-[#1a3c8f] font-semibold hover:underline">
                  Add your details →
                </Link>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1a3c8f]" /> Location
            </h2>
            <InfoRow label="Country" value={profile.country} />
            <InfoRow label="County / State" value={profile.county_state} />
            <InfoRow label="City / Community" value={profile.city_community} />
            <InfoRow label="Current Location" value={profile.current_location} />
            <InfoRow label="Address" value={profile.address_description} />
            {!profile.country && (
              <div className="py-3 text-center">
                <p className="text-sm text-gray-400 mb-2">No location saved yet.</p>
                <Link href="/dashboard/settings/profile" className="text-sm text-[#1a3c8f] font-semibold hover:underline">
                  Add location →
                </Link>
              </div>
            )}
          </div>

          {/* Career */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#1a3c8f]" /> Education & Career
            </h2>
            <InfoRow label="Occupation" value={profile.occupation} />
            <InfoRow label="Education Level" value={profile.education_level} />
            <InfoRow label="Institution" value={profile.institution_workplace} />
            <InfoRow label="Area of Interest" value={profile.area_of_interest} />
            {profile.career_goal && (
              <div className="pt-2">
                <p className="text-sm text-gray-400 mb-1">Career Goal</p>
                <p className="text-sm text-gray-700">{profile.career_goal}</p>
              </div>
            )}
            {!profile.occupation && !profile.education_level && (
              <div className="py-3 text-center">
                <p className="text-sm text-gray-400 mb-2">No career details saved yet.</p>
                <Link href="/dashboard/settings/profile" className="text-sm text-[#1a3c8f] font-semibold hover:underline">
                  Add career details →
                </Link>
              </div>
            )}
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1a3c8f]" /> Change Password
            </h2>
            <p className="text-sm text-gray-500 mb-4">Verify your current password then set a new one.</p>

            {passStep === "done" ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-gray-900 mb-1">Password Changed!</p>
                <button onClick={() => setPassStep("form")} className="text-sm text-[#1a3c8f] font-semibold hover:underline mt-2">
                  Change again
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { label: "Current Password", key: "current" as const, show: showCurrent, toggle: () => setShowCurrent(v => !v), placeholder: "Current password" },
                  { label: "New Password", key: "new_" as const, show: showNew, toggle: () => setShowNew(v => !v), placeholder: "At least 6 characters" },
                  { label: "Confirm New Password", key: "confirm" as const, show: showConfirm, toggle: () => setShowConfirm(v => !v), placeholder: "Repeat new password" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">{f.label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={f.show ? "text" : "password"} value={passwords[f.key]}
                        onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} required
                        className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]" />
                      <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {f.key === "confirm" && passwords.confirm && passwords.new_ !== passwords.confirm && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                ))}
                <button type="submit" disabled={changingPass || !passwords.current || !passwords.new_ || passwords.new_ !== passwords.confirm}
                  className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60 transition-colors">
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
