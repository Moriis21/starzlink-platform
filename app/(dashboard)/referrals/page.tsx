"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { redemptionsApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Users, Copy, Share2, CheckCircle, Gift, UserPlus, Loader2,
  DollarSign, Star, Info, Clock, X
} from "lucide-react";

const POINTS_PER_REFERRAL = 5;
const POINTS_PER_DOLLAR = 100;

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemForm, setRedeemForm] = useState({ resource: "", points: 100 });
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => { if (user?.id) init(); }, [user?.id]);

  const init = async () => {
    setLoading(true);
    const { data: profile } = await insforge.database.from("profiles").select("referral_code,points").eq("id", user!.id).single();
    let code = (profile as any)?.referral_code;
    if (!code) {
      code = (user!.id.slice(0, 4) + Math.random().toString(36).slice(2, 6)).toUpperCase();
      await insforge.database.from("profiles").update({ referral_code: code }).eq("id", user!.id);
    }
    setReferralCode(code);
    setUserPoints((profile as any)?.points ?? 0);
    const { data: refs } = await insforge.database.from("referrals").select("*").eq("referrer_id", user!.id).order("created_at", { ascending: false });
    setReferrals((refs as any) ?? []);
    const myRedemptions = await redemptionsApi.getMyRedemptions(user!.id);
    setRedemptions(myRedemptions as any[]);
    setLoading(false);
  };

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : "https://starzlink.com"}/signup?ref=${referralCode}`;
  const completedReferrals = referrals.filter(r => r.status === "completed").length;
  const pointsEarned = completedReferrals * POINTS_PER_REFERRAL;
  const pendingRedemptions = redemptions.filter(r => r.status === "pending").length;
  const milestones = [5, 10, 20, 50, 100];
  const nextMilestone = milestones.find(m => completedReferrals < m) ?? 100;
  const progress = Math.min((completedReferrals / nextMilestone) * 100, 100);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userPoints < redeemForm.points) { toast.error(`You need ${redeemForm.points} pts. You have ${userPoints}.`); return; }
    if (!redeemForm.resource.trim()) { toast.error("Please specify which resource you want."); return; }
    setRedeeming(true);
    try {
      const { error } = await redemptionsApi.request(user!.id, redeemForm.resource, redeemForm.points);
      if (error) throw error;
      toast.success("Redemption request submitted! Admin will review within 24 hours.");
      setShowRedeemModal(false);
      setRedeemForm({ resource: "", points: 100 });
      init();
    } catch { toast.error("Failed to submit. Try again."); }
    setRedeeming(false);
  };

  if (loading) return <div className="space-y-4 animate-pulse">{Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Referral Programme</h1>
        <p className="text-gray-500 text-sm mt-1">Invite friends and earn points. <strong>1 friend = 5 pts · 20 friends = 100 pts = $1</strong> in paid resource credit.</p>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-6 text-white">
        <h2 className="font-extrabold mb-4">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: "1", icon: Share2, t: "Share Your Link", d: "Copy and share your unique referral link with friends, classmates, and colleagues." },
            { n: "2", icon: UserPlus, t: "Friend Joins", d: "When they sign up using your link, you automatically earn 5 points per person." },
            { n: "3", icon: Gift, t: "Redeem for Resources", d: "Collect 100 pts ($1) and request any paid resource on the platform — free!" },
          ].map(s => (
            <div key={s.n} className="bg-white/10 rounded-xl p-4 flex items-start gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{s.n}</div>
              <div><p className="font-bold text-sm mb-1">{s.t}</p><p className="text-blue-200 text-xs leading-relaxed">{s.d}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: referrals.length, icon: Users, color: "bg-blue-50 text-blue-700" },
          { label: "Completed", value: completedReferrals, icon: CheckCircle, color: "bg-green-50 text-green-700" },
          { label: "Points Earned", value: `${pointsEarned} pts`, icon: Star, color: "bg-yellow-50 text-yellow-700" },
          { label: "Credit Earned", value: `$${(pointsEarned / POINTS_PER_DOLLAR).toFixed(2)}`, icon: DollarSign, color: "bg-purple-50 text-purple-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <s.icon className="w-5 h-5 mb-2 opacity-70" />
            <p className="text-xl font-extrabold">{s.value}</p>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between mb-2 text-sm">
          <span className="font-semibold text-gray-900">Progress to {nextMilestone} referrals</span>
          <span className="font-bold text-[#1a3c8f]">{completedReferrals}/{nextMilestone}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#1a3c8f] to-blue-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{nextMilestone - completedReferrals} more referrals · {(nextMilestone - completedReferrals) * POINTS_PER_REFERRAL} points away</p>
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-extrabold text-gray-900 mb-3">Your Referral Link</h2>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm text-gray-600 flex-1 truncate font-mono">{referralLink}</span>
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-bold text-[#1a3c8f] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex-shrink-0">
            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { const msg = encodeURIComponent(`Join StarzLink — Liberia's #1 platform for scholarships, jobs & opportunities! Use my link: ${referralLink}`); window.open(`https://wa.me/?text=${msg}`, "_blank"); }}
            className="flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90">
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>
          <button onClick={() => { const t = encodeURIComponent(`Join me on StarzLink — Liberia's best platform for scholarships, jobs & opportunities! ${referralLink}`); window.open(`https://twitter.com/intent/tweet?text=${t}`, "_blank"); }}
            className="flex items-center gap-2 bg-black text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90">
            <Share2 className="w-4 h-4" /> Share on X
          </button>
        </div>
      </div>

      {/* Redeem */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="font-extrabold text-gray-900 mb-1">Redeem Points for Resources</h2>
            <p className="text-gray-500 text-sm">Balance: <strong className="text-[#1a3c8f]">{userPoints} pts</strong> = <strong>${(userPoints / POINTS_PER_DOLLAR).toFixed(2)}</strong> credit</p>
            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Info className="w-3.5 h-3.5" /> 100 pts = $1 · Min 100 pts per redemption</p>
          </div>
          <button onClick={() => setShowRedeemModal(true)} disabled={userPoints < 100}
            className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-900 disabled:opacity-40">
            <Gift className="w-4 h-4" /> Redeem Now
          </button>
        </div>
        {pendingRedemptions > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2 text-sm text-yellow-800 mb-4">
            <Clock className="w-4 h-4 flex-shrink-0" /> {pendingRedemptions} redemption {pendingRedemptions === 1 ? "request" : "requests"} pending admin review.
          </div>
        )}
        {redemptions.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700 text-sm">Redemption History</p>
            {redemptions.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.resource_requested}</p>
                  <p className="text-xs text-gray-400">{r.points_used} pts · ${r.usd_value} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referrals list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-extrabold text-gray-900 mb-4">Your Referrals ({referrals.length})</h2>
        {referrals.length === 0 ? (
          <div className="text-center py-10"><Users className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 text-sm">No referrals yet — share your link above!</p></div>
        ) : referrals.map(r => (
          <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[#1a3c8f] font-bold text-sm">{r.referred_email?.charAt(0)?.toUpperCase()}</div>
              <div>
                <p className="text-sm font-medium text-gray-700">{r.referred_email?.replace(/(.{3}).*(@.*)/, "$1***$2")}</p>
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.status === "completed" && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+5 pts</span>}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-gray-900 text-lg">Redeem Points</h2>
              <button onClick={() => setShowRedeemModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mb-5 flex justify-between text-sm">
              <span className="text-gray-600">Available points</span>
              <span className="font-extrabold text-[#1a3c8f]">{userPoints} pts = ${(userPoints / POINTS_PER_DOLLAR).toFixed(2)}</span>
            </div>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Points to Redeem</label>
                <div className="flex gap-2 mb-2">
                  {[100, 200, 500].filter(v => v <= userPoints).map(v => (
                    <button key={v} type="button" onClick={() => setRedeemForm(f => ({ ...f, points: v }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${redeemForm.points === v ? "bg-[#1a3c8f] text-white border-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {v} pts<br /><span className="text-xs opacity-70">${(v / 100).toFixed(0)}</span>
                    </button>
                  ))}
                </div>
                <input type="number" min={100} max={userPoints} step={100} value={redeemForm.points} onChange={e => setRedeemForm(f => ({ ...f, points: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                <p className="text-xs text-gray-400 mt-1">= ${(redeemForm.points / 100).toFixed(2)} credit · Min 100 pts</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Which paid resource do you want? <span className="text-red-500">*</span></label>
                <textarea value={redeemForm.resource} onChange={e => setRedeemForm(f => ({ ...f, resource: e.target.value }))} rows={3} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none"
                  placeholder="e.g. 'IELTS Preparation Guide' or 'CV Template Pack' — name or describe the paid resource you want." />
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-xs text-yellow-800">
                Admin will review within <strong>24 hours</strong> and grant access. Points deducted only upon approval.
              </div>
              <button type="submit" disabled={redeeming || redeemForm.points < 100 || userPoints < redeemForm.points || !redeemForm.resource.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-50">
                {redeeming ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Gift className="w-4 h-4" /> Submit Request</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
