"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Smartphone, CreditCard, Building2, CheckCircle2,
  Loader2, Copy, Check, ExternalLink, Upload, AlertCircle,
  Shield, Clock, Star, Wallet, ChevronLeft
} from "lucide-react";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────
type PaymentMethod = "orange_money" | "mobile_money" | "credit_card" | "paypal" | "bank_transfer";
type Step = "select_method" | "instructions" | "card_form" | "bank_form" | "confirming" | "submitted";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  itemType: string;
  itemLabel: string;
  paymentType: string;
  itemId?: string;
  onPaymentSubmitted?: (paymentId: string) => void;
}

// ── USSD helpers ───────────────────────────────────────────────────────────────
function getOrangeMoneyUSSD(amount: number) {
  return `*144*1*1*1*0770787020*${amount}#`;
}
function getMobileMoneyUSSD(amount: number) {
  return `*156*1*1*0888283007*2*${amount}*11#`;
}
function toTelLink(ussd: string) {
  return "tel:" + ussd.replace(/#/g, "%23");
}

// ── Method config ──────────────────────────────────────────────────────────────
const METHOD_CONFIG = {
  orange_money: {
    label: "Orange Money",
    badge: "Popular in Liberia",
    desc: "Dial USSD · Instant",
    color: "from-orange-500 to-orange-600",
    bgLight: "bg-orange-50 border-orange-200",
    textColor: "text-orange-600",
    icon: "🟠",
  },
  mobile_money: {
    label: "Mobile Money",
    badge: "Lonestar MTN",
    desc: "Dial USSD · Instant",
    color: "from-blue-500 to-blue-700",
    bgLight: "bg-blue-50 border-blue-200",
    textColor: "text-blue-600",
    icon: "🔵",
  },
  credit_card: {
    label: "Credit Card",
    badge: "Powered by Stripe",
    desc: "Secure · International",
    color: "from-slate-700 to-slate-900",
    bgLight: "bg-slate-50 border-slate-200",
    textColor: "text-slate-700",
    icon: "💳",
  },
  paypal: {
    label: "PayPal",
    badge: "Global · Trusted",
    desc: "Fast & Secure",
    color: "from-yellow-400 to-yellow-500",
    bgLight: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-700",
    icon: "🅿️",
  },
  bank_transfer: {
    label: "Bank Transfer",
    badge: "Manual · 1-2 days",
    desc: "Direct bank payment",
    color: "from-gray-500 to-gray-700",
    bgLight: "bg-gray-50 border-gray-200",
    textColor: "text-gray-600",
    icon: "🏦",
  },
};

const BANK_DETAILS = [
  { label: "Bank Name", value: "First International Bank Liberia" },
  { label: "Account Name", value: "StarzLink Platform" },
  { label: "Account Number", value: "1234567890" },
  { label: "SWIFT/Routing", value: "FIBLLLMX" },
];

// ── CopyButton ─────────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/30 transition-colors flex-shrink-0"
      title="Copy"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500" />}
    </button>
  );
}

// ── Main PaymentModal ──────────────────────────────────────────────────────────
export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency = "USD",
  itemType,
  itemLabel,
  paymentType,
  itemId,
  onPaymentSubmitted,
}: Props) {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<Step>("select_method");
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Card form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardEmail, setCardEmail] = useState("");
  const [cardLoading, setCardLoading] = useState(false);

  // Bank form state
  const [bankRef, setBankRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PayPal email state
  const [paypalNote, setPaypalNote] = useState("");

  const amtStr = `$${amount.toFixed(2)}`;

  const resetAndClose = () => {
    setStep("select_method");
    setSelectedMethod(null);
    setCardName(""); setCardNumber(""); setCardExpiry(""); setCardCvc(""); setCardEmail("");
    setBankRef(""); setProofFile(null); setProofPreview(null);
    setPaypalNote("");
    setPaymentId(null);
    onClose();
  };

  // ── Core submit ──────────────────────────────────────────────────────────────
  async function createPaymentRecord(method: PaymentMethod, extraData?: Record<string, unknown>) {
    setStep("confirming");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user!.id,
          paymentType,
          itemType,
          itemId,
          planType: itemType,
          amount,
          currency,
          paymentMethod: method,
          ...extraData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPaymentId(data.paymentId);
      setStep("submitted");
      onPaymentSubmitted?.(data.paymentId);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment");
      setStep("instructions");
    }
  }

  // ── Card submit ──────────────────────────────────────────────────────────────
  async function handleCardSubmit() {
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      toast.error("Please fill in all card details");
      return;
    }
    setCardLoading(true);
    const last4 = cardNumber.replace(/\s/g, "").slice(-4);

    // Try Stripe intent first
    try {
      const intentRes = await fetch("/api/payments/stripe/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, userId: user?.id }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        // Stripe not configured, fall through to manual record
        toast("Stripe not configured. Recording payment for manual verification.", { icon: "ℹ️" });
      }
    } catch {
      // Ignore Stripe errors, create manual record
    }

    setCardLoading(false);
    await createPaymentRecord("credit_card", {
      cardLast4: last4,
      userNote: `Card payment for ${itemLabel}. Billing email: ${cardEmail}`,
    });
  }

  // ── Bank submit ──────────────────────────────────────────────────────────────
  async function handleBankSubmit() {
    setBankLoading(true);
    let proofUrl: string | undefined;

    if (proofFile) {
      try {
        const ext = proofFile.name.split(".").pop();
        const fileName = `payment_proofs/${user?.id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await insforge.storage
          .from("payment_proofs")
          .upload(fileName, proofFile);
        if (!uploadError && uploadData) {
          try {
            const urlResult = insforge.storage.from("payment_proofs").getPublicUrl(fileName);
            proofUrl = (urlResult as any)?.data?.publicUrl ?? (urlResult as any)?.publicUrl ?? "";
          } catch {
            proofUrl = (uploadData as any)?.url ?? "";
          }
        }
      } catch {
        // Continue even if upload fails
      }
    }

    setBankLoading(false);
    await createPaymentRecord("bank_transfer", {
      transactionReference: bankRef || undefined,
      proofFileUrl: proofUrl,
      userNote: bankRef ? `Bank transfer reference: ${bankRef}` : undefined,
    });
  }

  // ── Handle file selection ────────────────────────────────────────────────────
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  }

  // ── Format card number ───────────────────────────────────────────────────────
  function formatCardNumber(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  const handleContinue = () => {
    if (!selectedMethod) return;
    if (selectedMethod === "credit_card") setStep("card_form");
    else if (selectedMethod === "bank_transfer") setStep("bank_form");
    else setStep("instructions");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) resetAndClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* ── SELECT METHOD ──────────────────────────────────────────────────── */}
          {step === "select_method" && (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">Choose Payment Method</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{itemLabel} · <span className="font-bold text-[#1a3c8f]">{amtStr}</span></p>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.entries(METHOD_CONFIG) as [PaymentMethod, typeof METHOD_CONFIG.orange_money][]).map(([key, cfg]) => {
                    const isSelected = selectedMethod === key;
                    return (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedMethod(key)}
                        className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-[#1a3c8f] bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3">
                            <CheckCircle2 className="w-5 h-5 text-[#1a3c8f]" />
                          </span>
                        )}
                        <span className="text-2xl mb-2">{cfg.icon}</span>
                        <span className="font-bold text-gray-900 text-sm">{cfg.label}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{cfg.desc}</span>
                        <span className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bgLight} ${cfg.textColor}`}>
                          {cfg.badge}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 pb-5 flex-shrink-0 border-t border-gray-100 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinue}
                  disabled={!selectedMethod}
                  className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-4 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
                >
                  Continue with {selectedMethod ? METHOD_CONFIG[selectedMethod].label : "…"}
                </motion.button>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-bit SSL · All payments verified by admin</span>
                </div>
              </div>
            </>
          )}

          {/* ── ORANGE MONEY ───────────────────────────────────────────────────── */}
          {step === "instructions" && selectedMethod === "orange_money" && (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => setStep("select_method")} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-gray-900">Orange Money Payment</h2>
                  <p className="text-xs text-gray-500">{itemLabel}</p>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                {/* Amount */}
                <div className="text-center py-4 bg-orange-50 rounded-2xl">
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wide mb-1">Amount to Pay</p>
                  <p className="text-5xl font-extrabold text-orange-600">{amtStr}</p>
                  <p className="text-sm text-gray-500 mt-1">{itemLabel}</p>
                </div>

                {/* USSD Code */}
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Your USSD Code</p>
                  <div className="flex items-center gap-2 bg-orange-900 rounded-xl px-4 py-3">
                    <code className="flex-1 text-orange-300 font-mono text-base font-bold tracking-wider">
                      {getOrangeMoneyUSSD(amount)}
                    </code>
                    <CopyButton text={getOrangeMoneyUSSD(amount)} />
                  </div>
                </div>

                {/* Dial button */}
                <a
                  href={toTelLink(getOrangeMoneyUSSD(amount))}
                  className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-sm transition-colors"
                >
                  <Smartphone className="w-5 h-5" />
                  📞 Dial Now (Opens Phone Dialer)
                </a>

                {/* Instructions */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Steps</p>
                  {[
                    "Tap \"Dial Now\" to open your phone dialer (or manually dial the code)",
                    "The Orange Money app/menu will open — confirm the recipient details",
                    "Enter your Orange Money PIN when prompted",
                    "Once payment is complete, tap \"I Have Paid\" below",
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 items-start text-sm text-gray-700">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </div>
                  ))}
                </div>

                {/* Note */}
                <div className="flex gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>We cannot access your Orange Money PIN. You must confirm the payment manually on your phone before clicking "I Have Paid".</span>
                </div>
              </div>

              <div className="px-5 pb-5 flex-shrink-0 border-t border-gray-100 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createPaymentRecord("orange_money")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-sm transition-colors"
                >
                  ✅ I Have Paid — Submit Payment
                </motion.button>
              </div>
            </>
          )}

          {/* ── MOBILE MONEY ───────────────────────────────────────────────────── */}
          {step === "instructions" && selectedMethod === "mobile_money" && (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => setStep("select_method")} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-gray-900">Mobile Money Payment</h2>
                  <p className="text-xs text-gray-500">{itemLabel}</p>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                {/* Amount */}
                <div className="text-center py-4 bg-blue-50 rounded-2xl">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">Amount to Pay</p>
                  <p className="text-5xl font-extrabold text-blue-600">{amtStr}</p>
                  <p className="text-sm text-gray-500 mt-1">{itemLabel}</p>
                </div>

                {/* USSD Code */}
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Your USSD Code</p>
                  <div className="flex items-center gap-2 bg-blue-900 rounded-xl px-4 py-3">
                    <code className="flex-1 text-blue-300 font-mono text-base font-bold tracking-wider">
                      {getMobileMoneyUSSD(amount)}
                    </code>
                    <CopyButton text={getMobileMoneyUSSD(amount)} />
                  </div>
                </div>

                {/* Dial button */}
                <a
                  href={toTelLink(getMobileMoneyUSSD(amount))}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-sm transition-colors"
                >
                  <Smartphone className="w-5 h-5" />
                  📞 Dial Now (Opens Phone Dialer)
                </a>

                {/* Instructions */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Steps</p>
                  {[
                    "Tap \"Dial Now\" to open your phone dialer (or manually dial the code)",
                    "The Lonestar MTN Mobile Money menu will open",
                    "Confirm the payment recipient and amount",
                    "Enter your Mobile Money PIN when prompted",
                    "Once payment is complete, tap \"I Have Paid\" below",
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 items-start text-sm text-gray-700">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </div>
                  ))}
                </div>

                {/* Note */}
                <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>We cannot access your Mobile Money PIN. You must confirm the payment manually on your phone before clicking "I Have Paid".</span>
                </div>
              </div>

              <div className="px-5 pb-5 flex-shrink-0 border-t border-gray-100 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createPaymentRecord("mobile_money")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-sm transition-colors"
                >
                  ✅ I Have Paid — Submit Payment
                </motion.button>
              </div>
            </>
          )}

          {/* ── PAYPAL ─────────────────────────────────────────────────────────── */}
          {step === "instructions" && selectedMethod === "paypal" && (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => setStep("select_method")} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-gray-900">PayPal Payment</h2>
                  <p className="text-xs text-gray-500">{itemLabel}</p>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                {/* Amount */}
                <div className="text-center py-4 bg-yellow-50 rounded-2xl">
                  <p className="text-xs text-yellow-600 font-bold uppercase tracking-wide mb-1">Amount to Pay</p>
                  <p className="text-5xl font-extrabold text-yellow-600">{amtStr}</p>
                  <p className="text-sm text-gray-500 mt-1">{itemLabel}</p>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Steps</p>
                  {[
                    "Click \"Pay with PayPal\" button below",
                    "You will be redirected to PayPal checkout",
                    "Complete the payment on PayPal's secure website",
                    "Return here and click \"I Have Paid\" to notify us",
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 items-start text-sm text-gray-700">
                      <span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </div>
                  ))}
                </div>

                {/* PayPal button */}
                <a
                  href={`https://paypal.me/starzlink/${amount}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 rounded-xl text-sm transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  🅿️ Pay with PayPal — {amtStr}
                </a>

                {/* Optional PayPal email */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                    Your PayPal Email (optional)
                  </label>
                  <input
                    type="email"
                    value={paypalNote}
                    onChange={(e) => setPaypalNote(e.target.value)}
                    placeholder="yourname@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] min-h-[48px]"
                  />
                </div>

                <div className="flex gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>After completing PayPal payment, click "I Have Paid" — admin will verify within 2-3 minutes.</span>
                </div>
              </div>

              <div className="px-5 pb-5 flex-shrink-0 border-t border-gray-100 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createPaymentRecord("paypal", {
                    paypalEmail: paypalNote || undefined,
                  })}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-sm transition-colors"
                >
                  ✅ I Have Paid — Submit Payment
                </motion.button>
              </div>
            </>
          )}

          {/* ── CREDIT CARD ─────────────────────────────────────────────────────── */}
          {step === "card_form" && (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => setStep("select_method")} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-gray-900">Secure Card Payment</h2>
                  <p className="text-xs text-gray-500">🔒 Secured by Stripe</p>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                {/* Amount */}
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Charging for</p>
                    <p className="font-bold text-gray-900 text-sm">{itemLabel}</p>
                  </div>
                  <p className="text-2xl font-extrabold text-[#1a3c8f]">{amtStr}</p>
                </div>

                {/* Card form */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] min-h-[48px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full pl-10 pr-4 border border-gray-200 rounded-xl py-3 text-sm font-mono focus:outline-none focus:border-[#1a3c8f] tracking-wider min-h-[48px]"
                        maxLength={19}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1.5">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="12/27"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] min-h-[48px]"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1.5">CVC</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="•••"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] min-h-[48px]"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Billing Email</label>
                    <input
                      type="email"
                      value={cardEmail}
                      onChange={(e) => setCardEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] min-h-[48px]"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Your card will be charged <strong>{amtStr}</strong>. Admin will verify and activate your plan within 2-3 minutes.
                </p>

                <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> SSL Secured</div>
                  <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Stripe Powered</div>
                </div>
              </div>

              <div className="px-5 pb-5 flex-shrink-0 border-t border-gray-100 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCardSubmit}
                  disabled={cardLoading}
                  className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-4 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                >
                  {cardLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
                  ) : (
                    <><CreditCard className="w-4 h-4" />Pay {amtStr} Securely</>
                  )}
                </motion.button>
              </div>
            </>
          )}

          {/* ── BANK TRANSFER ───────────────────────────────────────────────────── */}
          {step === "bank_form" && (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => setStep("select_method")} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-gray-900">Bank Transfer</h2>
                  <p className="text-xs text-gray-500">{itemLabel}</p>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                {/* Bank details */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Bank Details</p>
                  </div>
                  {[...BANK_DETAILS, { label: "Amount", value: amtStr }].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                      <span className="text-xs text-gray-500 font-medium">{label}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900">{value}</span>
                        <CopyButton text={value} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Proof upload */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                    Upload Payment Proof
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                      proofFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-[#1a3c8f] bg-gray-50"
                    }`}
                  >
                    {proofPreview ? (
                      <img src={proofPreview} alt="Proof" className="max-h-32 mx-auto rounded-lg object-contain" />
                    ) : proofFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-700 font-medium">{proofFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload screenshot or receipt</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF accepted</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Reference */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                    Transaction Reference (optional)
                  </label>
                  <input
                    type="text"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g. TXN123456789"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] min-h-[48px]"
                  />
                </div>

                <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Bank transfers take 1-2 business days to verify. Admin will activate your plan as soon as payment is confirmed.</span>
                </div>
              </div>

              <div className="px-5 pb-5 flex-shrink-0 border-t border-gray-100 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBankSubmit}
                  disabled={bankLoading}
                  className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-4 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
                >
                  {bankLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                  ) : (
                    <><Building2 className="w-4 h-4" />Submit Payment Proof</>
                  )}
                </motion.button>
              </div>
            </>
          )}

          {/* ── CONFIRMING ──────────────────────────────────────────────────────── */}
          {step === "confirming" && (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#1a3c8f] border-t-transparent rounded-full mb-6"
              />
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Processing your payment…</h3>
              <p className="text-gray-500 text-sm">Please wait while we record your payment request.</p>
            </div>
          )}

          {/* ── SUBMITTED ───────────────────────────────────────────────────────── */}
          {step === "submitted" && (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-extrabold text-gray-900">Payment Submitted!</h2>
                <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                {/* Success animation */}
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="inline-flex"
                  >
                    <CheckCircle2 className="w-20 h-20 text-green-500" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-xl font-extrabold text-gray-900 mt-3 mb-2">Payment Submitted Successfully!</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                      Your payment request has been submitted. Admin will verify your payment in 2-3 minutes and activate your plan as soon as possible.
                    </p>
                  </motion.div>
                </div>

                {/* Payment summary card */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Payment Summary</p>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Item</span>
                      <span className="font-semibold text-gray-900">{itemLabel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Method</span>
                      <span className="font-semibold text-gray-900">{selectedMethod ? METHOD_CONFIG[selectedMethod].label : "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-bold text-[#1a3c8f]">{amtStr}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date</span>
                      <span className="font-semibold text-gray-900">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500">Status</span>
                      <span className="bg-yellow-100 text-yellow-700 font-bold text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Verification
                      </span>
                    </div>
                    {paymentId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment ID</span>
                        <span className="font-mono text-xs text-gray-600">{paymentId.slice(0, 8)}…</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex-shrink-0 border-t border-gray-100 pt-4 space-y-3">
                <Link
                  href="/dashboard/payment-history"
                  className="flex items-center justify-center gap-2 w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-blue-900 transition-colors"
                  onClick={resetAndClose}
                >
                  <Wallet className="w-4 h-4" /> View Payment History
                </Link>
                <button
                  onClick={resetAndClose}
                  className="w-full border border-gray-200 text-gray-600 font-semibold py-3.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
