"use client";

import { useRouter } from "next/navigation";
import { X, Crown, Check, Lock } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

const proFeatures = [
  "Download Improved CV (PDF & Word)",
  "Interview Pro Preparation Guide",
  "Unlimited CV Reviews & Analysis",
  "Professional Application Letter Generator",
  "LinkedIn Profile Optimizer",
  "Priority AI Processing",
];

export default function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Pro Feature</p>
              <h2 className="text-xl font-extrabold">Unlock {featureName}</h2>
            </div>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Upgrade to Pro to access all premium career tools.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4 font-medium">Everything included in Pro:</p>
          <ul className="space-y-2 mb-6">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border-2 border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Monthly</p>
              <p className="text-2xl font-extrabold text-gray-900">$5</p>
              <p className="text-xs text-gray-400">per month</p>
            </div>
            <div className="border-2 border-[#1a3c8f] rounded-xl p-3 text-center relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                Best Value
              </span>
              <p className="text-xs text-gray-500 mb-1">Yearly</p>
              <p className="text-2xl font-extrabold text-[#1a3c8f]">$50</p>
              <p className="text-xs text-green-600 font-medium">Save $10</p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); router.push("/dashboard/career/upgrade"); }}
            className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
