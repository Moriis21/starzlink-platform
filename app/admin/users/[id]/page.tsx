"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, Globe,
  ArrowLeft, Shield, Bookmark, FileText, CreditCard, CheckCircle,
  AlertCircle, Calendar, RefreshCw, ShieldOff, Trash2, Edit3, Lock
} from "lucide-react";

interface Profile {
  id: string; full_name?: string; email?: string; phone?: string;
  whatsapp_number?: string; country?: string; county_state?: string;
  city_community?: string; current_location?: string; address_description?: string;
  preferred_language?: string; occupation?: string; education_level?: string;
  institution_workplace?: string; area_of_interest?: string; career_goal?: string;
  user_type?: string; role?: string; bio?: string; avatar_url?: string;
  profile_completed?: boolean; account_status?: string;
  created_at?: string; last_login_at?: string; updated_at?: string;
  is_suspended?: boolean;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400 flex-shrink-0 w-40">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right capitalize">{value || "—"}</span>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ saved: 0, cvs: 0, payments: 0, referrals: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [profileRes, savedRes, cvsRes, paymentsRes, referralsRes] = await Promise.allSettled([
          insforge.database.from("profiles").select("*").eq("id", id).maybeSingle(),
          insforge.database.from("saved_items").select("id", { count: "exact" }).eq("user_id", id).limit(1),
          insforge.database.from("cv_uploads").select("id", { count: "exact" }).eq("user_id", id).limit(1),
          insforge.database.from("payments").select("id", { count: "exact" }).eq("user_id", id).limit(1),
          insforge.database.from("referrals").select("id", { count: "exact" }).eq("user_id", id).limit(1),
        ]);

        if (profileRes.status === "fulfilled") setProfile((profileRes.value as any).data);
        setStats({
          saved: savedRes.status === "fulfilled" ? (savedRes.value as any).count ?? 0 : 0,
          cvs: cvsRes.status === "fulfilled" ? (cvsRes.value as any).count ?? 0 : 0,
          payments: paymentsRes.status === "fulfilled" ? (paymentsRes.value as any).count ?? 0 : 0,
          referrals: referralsRes.status === "fulfilled" ? (referralsRes.value as any).count ?? 0 : 0,
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSuspend = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const newVal = !profile.is_suspended;
      await insforge.database.from("profiles").update({ is_suspended: newVal }).eq("id", id);
      setProfile(p => p ? { ...p, is_suspended: newVal } : p);
      toast.success(newVal ? "User suspended." : "User reactivated.");
    } catch { toast.error("Action failed."); }
    setActionLoading(false);
  };

  const handleUnlockProfile = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, profile_completed: false, adminOverride: true }),
      });
      if (!res.ok) throw new Error("Failed");
      // Also update locally
      await insforge.database.from("profiles").update({
        profile_completed: false,
        profile_completed_at: null,
      }).eq("id", id);
      setProfile(p => p ? { ...p, profile_completed: false } : p);
      toast.success("Profile unlocked. User can now edit their profile.");
    } catch { toast.error("Failed to unlock profile."); }
    setActionLoading(false);
  };

  const handleLockProfile = async () => {
    setActionLoading(true);
    try {
      await insforge.database.from("profiles").update({
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
      }).eq("id", id);
      setProfile(p => p ? { ...p, profile_completed: true } : p);
      toast.success("Profile locked.");
    } catch { toast.error("Failed."); }
    setActionLoading(false);
  };

  const handleRoleChange = async (newRole: string) => {
    setActionLoading(true);
    try {
      await insforge.database.from("profiles").update({ role: newRole }).eq("id", id);
      setProfile(p => p ? { ...p, role: newRole } : p);
      toast.success(`Role changed to ${newRole.replace("_", " ")}.`);
    } catch { toast.error("Failed."); }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#1a3c8f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">User not found</p>
        <Link href="/admin/users" className="text-[#1a3c8f] text-sm hover:underline mt-2 block">← Back to Users</Link>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    user: "bg-gray-100 text-gray-600",
    admin: "bg-blue-100 text-blue-700",
    super_admin: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900">{profile.full_name || "Unknown User"}</h1>
          <p className="text-gray-500 text-sm">{profile.email} · ID: {id.slice(0, 16)}…</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", roleColors[profile.role ?? "user"] ?? "bg-gray-100 text-gray-600")}>
            {profile.role?.replace("_", " ") || "user"}
          </span>
          {profile.profile_completed ? (
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Complete
            </span>
          ) : (
            <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Incomplete
            </span>
          )}
          {profile.is_suspended && (
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">Suspended</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Saved Items", value: stats.saved, icon: Bookmark, color: "bg-blue-50 text-blue-600" },
          { label: "CVs Uploaded", value: stats.cvs, icon: FileText, color: "bg-purple-50 text-purple-600" },
          { label: "Payments", value: stats.payments, icon: CreditCard, color: "bg-green-50 text-green-600" },
          { label: "Referrals", value: stats.referrals, icon: Globe, color: "bg-orange-50 text-orange-600" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 flex items-center gap-3`}>
            <s.icon className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs font-medium opacity-75">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#1a3c8f]" /> Personal Information
          </h2>
          <InfoRow label="Full Name" value={profile.full_name} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Phone" value={profile.phone} />
          <InfoRow label="WhatsApp" value={profile.whatsapp_number} />
          <InfoRow label="User Type" value={profile.user_type} />
          <InfoRow label="Preferred Language" value={profile.preferred_language} />
          <InfoRow label="Bio" value={profile.bio} />
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1a3c8f]" /> Location
          </h2>
          <InfoRow label="Country" value={profile.country} />
          <InfoRow label="County / State" value={profile.county_state} />
          <InfoRow label="City / Community" value={profile.city_community} />
          <InfoRow label="Current Location" value={profile.current_location} />
          <InfoRow label="Address" value={profile.address_description} />
        </div>

        {/* Education & Career */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1a3c8f]" /> Education & Career
          </h2>
          <InfoRow label="Occupation" value={profile.occupation} />
          <InfoRow label="Education Level" value={profile.education_level} />
          <InfoRow label="Institution" value={profile.institution_workplace} />
          <InfoRow label="Area of Interest" value={profile.area_of_interest} />
          <InfoRow label="Career Goal" value={profile.career_goal} />
        </div>

        {/* Account details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1a3c8f]" /> Account Details
          </h2>
          <InfoRow label="Role" value={profile.role?.replace("_", " ")} />
          <InfoRow label="Profile Status" value={profile.profile_completed ? "Complete" : "Incomplete"} />
          <InfoRow label="Account Status" value={profile.is_suspended ? "Suspended" : "Active"} />
          <InfoRow label="Registered" value={profile.created_at ? formatDate(profile.created_at) : undefined} />
          <InfoRow label="Last Login" value={profile.last_login_at ? formatDate(profile.last_login_at) : undefined} />
          <InfoRow label="Last Updated" value={profile.updated_at ? formatDate(profile.updated_at) : undefined} />
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#1a3c8f]" /> Admin Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {/* Lock / Unlock profile */}
          {profile.profile_completed ? (
            <button onClick={handleUnlockProfile} disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition-colors disabled:opacity-60">
              <Lock className="w-4 h-4" /> Unlock Profile for Editing
            </button>
          ) : (
            <button onClick={handleLockProfile} disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-60">
              <CheckCircle className="w-4 h-4" /> Mark Profile Complete
            </button>
          )}

          {/* Suspend / Reactivate */}
          <button onClick={handleSuspend} disabled={actionLoading}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-60",
              profile.is_suspended
                ? "border-green-200 text-green-700 hover:bg-green-50"
                : "border-orange-200 text-orange-700 hover:bg-orange-50"
            )}>
            {profile.is_suspended
              ? <><RefreshCw className="w-4 h-4" /> Reactivate Account</>
              : <><ShieldOff className="w-4 h-4" /> Suspend Account</>
            }
          </button>

          {/* Role change */}
          {["user", "admin", "super_admin"].filter(r => r !== profile.role).map(r => (
            <button key={r} onClick={() => handleRoleChange(r)} disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-60 capitalize">
              <Shield className="w-4 h-4" /> Make {r.replace("_", " ")}
            </button>
          ))}

          {/* View in users list */}
          <Link href="/admin/users"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to All Users
          </Link>
        </div>
      </div>
    </div>
  );
}
