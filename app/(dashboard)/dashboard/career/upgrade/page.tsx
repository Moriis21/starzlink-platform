"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Check, X, Crown, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import PaymentModal from "@/components/payment/PaymentModal";

const FEATURES = [
  { label: "CV Upload & Analysis", free: true, pro: true },
  { label: "CV Score & ATS Score", free: true, pro: true },
  { label: "Preview Improved CV", free: true, pro: true },
  { label: "Download Improved CV", free: false, pro: true },
  { label: "PDF Export", free: false, pro: true },
  { label: "Word Export", free: false, pro: true },
  { label: "Interview Pro", free: false, pro: true },
  { label: "Unlimited CV Reviews", free: false, pro: true },
  { label: "Application Letter Generator", free: false, pro: true },
  { label: "LinkedIn Optimizer", free: false, pro: true },
  { label: "Priority AI Processing", free: false, pro: true },
];

export default function UpgradePage() {
  const { user } = useAuth();
  const { sub, isPro, refresh } = useSubscription();
  const [activePlan, setActivePlan] = useState<"monthly" | "yearly">("yearly");
  const [success, setSuccess] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; plan: "monthly" | "yearly" | null }>({ open: false, plan: null });

  const handleUpgrade = (plan: "monthly" | "yearly") => {
    if (!user?.id) return;
    setPaymentModal({ open: true, plan });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-full mb-4"
        >
          <Crown className="w-4 h-4" /> AI Career Pro
        </motion.div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Unlock Your Professional Career Tools
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Get access to Interview Pro, Application Letter Generator, LinkedIn Optimizer, and unlimited CV reviews.
        </p>
      </div>

      {/* Already Pro */}
      {isPro && !success && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
          <h3 className="text-xl font-extrabold text-yellow-900">You&apos;re already Pro!</h3>
          {sub?.current_period_end && (
            <p className="text-yellow-700 text-sm mt-1">
              Your plan is active until {new Date(sub.current_period_end).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      )}

      {/* Success */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-green-900 mb-2">Welcome to Pro!</h3>
          <p className="text-green-700">All premium features are now unlocked. Start using them right away.</p>
        </motion.div>
      )}

      {/* Pricing Cards */}
      {!isPro && !success && (
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white/80 backdrop-blur-sm border-2 rounded-2xl p-6 transition-all cursor-pointer ${
              activePlan === "monthly" ? "border-[#1a3c8f] shadow-xl" : "border-gray-200 shadow-lg hover:border-gray-300"
            }`}
            onClick={() => setActivePlan("monthly")}
          >
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Monthly Plan</h3>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-4xl font-extrabold text-gray-900">$5</span>
              <span className="text-gray-500 text-sm mb-1">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              {["Full CV Analysis & Scoring", "Interview Pro Guide", "Application Letter Generator", "LinkedIn Optimizer", "Unlimited CV Reviews", "PDF & Word Export"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={(e) => { e.stopPropagation(); handleUpgrade("monthly"); }}
              disabled={paymentModal.open}
              className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              Get Pro Monthly
            </button>
          </motion.div>

          {/* Yearly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white/80 backdrop-blur-sm border-2 rounded-2xl p-6 transition-all cursor-pointer relative ${
              activePlan === "yearly" ? "border-[#1a3c8f] shadow-xl" : "border-gray-200 shadow-lg hover:border-gray-300"
            }`}
            onClick={() => setActivePlan("yearly")}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Best Value
            </span>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Yearly Plan</h3>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-4xl font-extrabold text-gray-900">$50</span>
              <span className="text-gray-500 text-sm mb-1">/year</span>
            </div>
            <p className="text-green-600 text-sm font-semibold mb-4">Save $10 vs monthly billing</p>
            <ul className="space-y-2 mb-6">
              {["Full CV Analysis & Scoring", "Interview Pro Guide", "Application Letter Generator", "LinkedIn Optimizer", "Unlimited CV Reviews", "PDF & Word Export"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={(e) => { e.stopPropagation(); handleUpgrade("yearly"); }}
              disabled={paymentModal.open}
              className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              Get Pro Yearly
            </button>
          </motion.div>
        </div>
      )}

      {/* Feature Comparison */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900">Feature Comparison</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center text-[#1a3c8f]">Pro</span>
          </div>
          {FEATURES.map(({ label, free, pro }) => (
            <div key={label} className="grid grid-cols-3 gap-4 px-6 py-3 items-center">
              <span className="text-sm text-gray-700">{label}</span>
              <div className="flex justify-center">
                {free ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex justify-center">
                {pro ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.open && paymentModal.plan && (
        <PaymentModal
          isOpen={paymentModal.open}
          onClose={() => setPaymentModal({ open: false, plan: null })}
          amount={paymentModal.plan === "yearly" ? 50 : 5}
          currency="USD"
          itemType={paymentModal.plan === "yearly" ? "pro_yearly" : "pro_monthly"}
          itemLabel={paymentModal.plan === "yearly" ? "Pro Yearly Plan — $50/year" : "Pro Monthly Plan — $5/month"}
          paymentType="subscription"
          onPaymentSubmitted={() => {
            setPaymentModal({ open: false, plan: null });
            setSuccess(true);
            refresh();
          }}
        />
      )}
    </div>
  );
}
