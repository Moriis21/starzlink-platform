"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { referralsApi, pointsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Users, Copy, Share2, CheckCircle, Gift, UserPlus, ArrowRight, MessageCircle } from "lucide-react";

const REWARD_MILESTONES = [
  { referrals: 1, reward: "100 Points", color: "bg-blue-100 text-blue-700" },
  { referrals: 3, reward: "350 Points + Badge", color: "bg-purple-100 text-purple-700" },
  { referrals: 5, reward: "600 Points + Pro Badge", color: "bg-yellow-100 text-yellow-700" },
  { referrals: 10, reward: "1500 Points + Champion", color: "bg-orange-100 text-orange-700" },
];

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    initReferrals();
  }, [user?.id]);

  const initReferrals = async () => {
    setLoading(true);

    // Get or generate referral code
    const { data: profile } = await insforge.database.from("profiles").select("referral_code, points").eq("id", user!.id).single();
    let code = (profile as any)?.referral_code;

    if (!code) {
      // Generate: first 4 chars of ID + random 4 chars
      code = (user!.id.slice(0, 4) + Math.random().toString(36).slice(2, 6)).toUpperCase();
      await insforge.database.from("profiles").update({ referral_code: code }).eq("id", user!.id);
    }

    setReferralCode(code);
    setTotalPoints((profile as any)?.points ?? 0);

    // Fetch referrals
    const refs = await referralsApi.getMyReferrals(user!.id);
    setReferrals(refs as any[]);
    setLoading(false);
  };

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : "https://starzlink.com"}/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Join StarzLink — Liberia's #1 platform for scholarships, jobs & opportunities! Use my referral link: ${referralLink}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const shareTwitterX = () => {
    const msg = encodeURIComponent(`Join StarzLink, Liberia's best opportunity platform! Sign up with my referral link and let's grow together. ${referralLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${msg}`, "_blank");
  };

  const completedReferrals = referrals.filter(r => r.status === "completed").length;
  const pointsFromReferrals = referrals.filter(r => r.status === "completed").reduce((s, r) => s + (r.points_awarded ?? 0), 0);
  const nextMilestone = REWARD_MILESTONES.find(m => m.referrals > completedReferrals);
  const progressPct = nextMilestone ? (completedReferrals / nextMilestone.referrals) * 100 : 100;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#1a3c8f]" /> Referral Program
        </h1>
        <p className="text-gray-500 text-sm">Invite friends and earn points for every successful referral.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Referral Link */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Your Referral Link</h2>
              <div className="flex gap-2 mb-4">
                <input
                  value={referralLink}
                  readOnly
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-700 focus:outline-none"
                />
                <button onClick={handleCopy} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${copied ? "bg-green-600 text-white" : "bg-[#1a3c8f] text-white hover:bg-blue-900"}`}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={shareWhatsApp} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl text-sm transition-colors">
                  <Share2 className="w-4 h-4" /> WhatsApp
                </button>
                <button onClick={shareTwitterX} className="flex-1 flex items-center justify-center gap-2 py--2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl text-sm transition-colors py-2.5">
                  <MessageCircle className="w-4 h-4" /> Twitter / X
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Referrals", value: referrals.length, icon: UserPlus, color: "bg-blue-50 text-blue-700" },
                { label: "Completed", value: completedReferrals, icon: CheckCircle, color: "bg-green-50 text-green-700" },
                { label: "Points Earned", value: pointsFromReferrals, icon: Gift, color: "bg-yellow-50 text-yellow-700" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}><Icon className="w-5 h-5" /></div>
                  <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress to next milestone */}
            {nextMilestone && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">Next Milestone</h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${nextMilestone.color}`}>{nextMilestone.reward}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{completedReferrals} / {nextMilestone.referrals} referrals</span>
                  <span>{nextMilestone.referrals - completedReferrals} more to go</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-[#1a3c8f] to-blue-400 rounded-full transition-all" style={{ width: `${Math.min(100, progressPct)}%` }} />
                </div>
              </div>
            )}

            {/* Referrals list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Your Referrals</h3>
              </div>
              {referrals.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No referrals yet. Share your link to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {referrals.map(ref => (
                    <div key={ref.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {ref.referred_email.replace(/(.{2}).+(@.+)/, "$1***$2")}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(ref.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {ref.points_awarded > 0 && <span className="text-sm font-bold text-[#1a3c8f]">+{ref.points_awarded} pts</span>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ref.status === "completed" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                          {ref.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* How it works */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-[#1a3c8f]" /> How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Share Your Link", desc: "Copy your unique referral link and share it with friends via WhatsApp, social media, or email." },
                  { step: "2", title: "Friend Signs Up", desc: "Your friend creates a free StarzLink account using your referral link." },
                  { step: "3", title: "Earn 100 Points", desc: "Once they complete registration, you automatically earn 100 points!" },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-3">
                    <div className="w-8 h-8 bg-[#1a3c8f] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{step}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a3c8f] rounded-2xl p-5 mt-4 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Gift className="w-5 h-5" /> Reward Milestones</h3>
              <div className="space-y-2">
                {REWARD_MILESTONES.map(m => (
                  <div key={m.referrals} className={`flex items-center justify-between p-2 rounded-xl ${completedReferrals >= m.referrals ? "bg-white/20" : "bg-white/10"}`}>
                    <span className="text-sm flex items-center gap-1.5">
                      {completedReferrals >= m.referrals && <CheckCircle className="w-3.5 h-3.5 text-green-300" />}
                      {m.referrals} referral{m.referrals !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs font-bold text-blue-200">{m.reward}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
