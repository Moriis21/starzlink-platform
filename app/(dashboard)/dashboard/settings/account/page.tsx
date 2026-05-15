"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import toast from "react-hot-toast";
import { Trash2, AlertTriangle, Shield, Download, Settings, Loader2 } from "lucide-react";

export default function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);

  const handleExport = async (format: "json" | "csv") => {
    if (!user?.id) return;
    setExporting(format);
    try {
      const res = await fetch(`/api/user/export-data?userId=${user.id}&format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `starzlink-data-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Your data has been exported as ${format.toUpperCase()}.`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
    setExporting(null);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE MY ACCOUNT") {
      toast.error('Type "DELETE MY ACCOUNT" exactly to confirm.');
      return;
    }
    if (!agreed) {
      toast.error("You must agree to the terms of deletion.");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Deletion failed");
      }
      toast.success("Your account has been permanently deleted.");
      try { await logout(); } catch {}
      router.replace("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account. Please contact support.");
    }
    setDeleting(false);
  };

  return (
    <div className="max-w-2xl">
      <Breadcrumb crumbs={[{ label: "Settings" }, { label: "Account" }]} />

      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Account Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your account data and preferences.</p>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1a3c8f]" /> Account Information
        </h2>
        <div className="space-y-3">
          {[
            { label: "Full Name", value: user?.full_name },
            { label: "Email", value: user?.email },
            { label: "Account Role", value: user?.role },
            { label: "User Type", value: user?.user_type },
            { label: "User ID", value: user?.id?.slice(0, 16) + "…" },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{r.label}</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{r.value || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile settings link */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Update Your Profile</p>
          <p className="text-xs text-gray-500 mt-0.5">Change your name, phone, location, occupation, and more.</p>
        </div>
        <Link href="/dashboard/settings/profile"
          className="flex items-center gap-1.5 bg-[#1a3c8f] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors flex-shrink-0">
          <Settings className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* Data export */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
        <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Download className="w-5 h-5 text-green-600" /> Download My Data
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Export all your personal data from StarzLink — profile, saved items, CV history, payments, and more.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("json")}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {exporting === "json" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting === "json" ? "Exporting…" : "Download as JSON"}
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 py-2.5 border border-green-300 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-50 disabled:opacity-60 transition-colors"
          >
            {exporting === "csv" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting === "csv" ? "Exporting…" : "Download as CSV"}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
        <h2 className="font-bold text-red-700 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" /> Delete Account
        </h2>
        <p className="text-sm text-red-600 mb-4">
          Permanently delete your StarzLink account and all associated data. This action is irreversible.
        </p>

        {!showDeleteSection ? (
          <button onClick={() => setShowDeleteSection(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors">
            <Trash2 className="w-4 h-4" /> I want to delete my account
          </button>
        ) : step === "warning" ? (
          <div className="space-y-4">
            <div className="bg-white border border-red-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> What will be permanently deleted:
              </p>
              <ul className="text-sm text-red-600 space-y-1 ml-6 list-disc">
                <li>Your profile and account information</li>
                <li>All uploaded CVs and analysis history</li>
                <li>Saved opportunities and bookmarks</li>
                <li>Referral points and history</li>
                <li>Generated cover letters and documents</li>
                <li>Subscription and payment records</li>
                <li>All personal data on StarzLink</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteSection(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={() => setStep("confirm")}
                className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 text-sm">
                Continue with Deletion
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-red-200 rounded-xl p-4">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Type <strong className="text-red-600">DELETE MY ACCOUNT</strong> to confirm
              </label>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 font-mono mb-3"
              />
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-red-600" />
                <span className="text-xs text-gray-600">
                  I understand this action is permanent and cannot be undone. I confirm I want to delete my StarzLink account and all my data.
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep("warning"); setDeleteConfirm(""); setAgreed(false); }}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 text-sm">
                Go Back
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== "DELETE MY ACCOUNT" || !agreed}
                className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-40 text-sm flex items-center justify-center gap-2"
              >
                {deleting ? "Deleting Account…" : "Delete My Account Permanently"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
