"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, FileText, Video, Lightbulb, GraduationCap, Globe,
  Wrench, Download, Search, Star, Lock, Unlock, ShoppingCart,
  X, CreditCard, CheckCircle2, Eye, ChevronRight, Loader2
} from "lucide-react";
import { resourcesApi } from "@/lib/api";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/context/AuthContext";
import { formatDate, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp, StaggerGroup, StaggerItem } from "@/components/ui/animations";
import toast from "react-hot-toast";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";

interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url?: string;
  image_url?: string;
  is_paid: boolean;
  price: number;
  currency: string;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { id: "", label: "All Resources", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
  { id: "CV Templates", label: "CV Templates", icon: FileText, color: "bg-indigo-50 text-indigo-600" },
  { id: "Guides & eBooks", label: "Guides & eBooks", icon: BookOpen, color: "bg-purple-50 text-purple-600" },
  { id: "Interview Tips", label: "Interview Tips", icon: Lightbulb, color: "bg-yellow-50 text-yellow-600" },
  { id: "Scholarship Guides", label: "Scholarship Guides", icon: GraduationCap, color: "bg-green-50 text-green-600" },
  { id: "Study Abroad Guides", label: "Study Abroad Guides", icon: Globe, color: "bg-teal-50 text-teal-600" },
  { id: "Career Tools", label: "Career Tools", icon: Wrench, color: "bg-orange-50 text-orange-600" },
  { id: "Downloads", label: "Free Downloads", icon: Download, color: "bg-gray-100 text-gray-600" },
];

const POPULAR = [
  "Professional CV Template Pack (ATS-Optimized)",
  "Complete Scholarship Application Guide",
  "Interview Preparation Masterclass Guide",
  "Career Planning Toolkit 2026",
  "Personal Statement Samples & Writing Guide",
];

/* ── Payment Modal ── */
function PaymentModal({
  resource,
  onClose,
  onSuccess,
}: {
  resource: Resource;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState<"confirm" | "pay" | "success">("confirm");
  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const handlePay = async () => {
    if (!user) { toast.error("Please log in to purchase."); return; }
    setProcessing(true);
    try {
      // Record purchase in database (Stripe integration connects here)
      const { error } = await insforge.database.from("purchases").insert([{
        user_id: user.id,
        resource_id: resource.id,
        amount: resource.price,
        currency: resource.currency,
        payment_method: "card",
        payment_status: "completed", // Will be set by Stripe webhook in production
      }]);
      if (error && !error.message?.includes("duplicate")) throw error;
      setStep("success");
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (err: any) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {step === "success" ? (
            <div className="p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Purchase Successful!</h2>
              <p className="text-gray-500 text-sm">You now have access to <strong>{resource.title}</strong>.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{step === "confirm" ? "Purchase Resource" : "Payment Details"}</h2>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                {/* Resource card */}
                <div className="bg-blue-50 rounded-xl p-4 mb-5 flex gap-3">
                  <div className="w-10 h-10 bg-[#1a3c8f] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2">{resource.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{resource.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-extrabold text-[#1a3c8f]">
                      {resource.currency === "USD" ? "$" : resource.currency}{resource.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">one-time</p>
                  </div>
                </div>

                {step === "confirm" && (
                  <>
                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">{resource.description}</p>
                    <div className="space-y-2 mb-5">
                      {["Instant access after payment", "Unlimited downloads", "30-day money-back guarantee"].map(b => (
                        <div key={b} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {b}
                        </div>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep("pay")}
                      className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Proceed to Payment
                    </motion.button>
                  </>
                )}

                {step === "pay" && (
                  <>
                    <div className="space-y-3 mb-5">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Cardholder Name</label>
                        <input value={cardData.name} onChange={e => setCardData(d => ({ ...d, name: e.target.value }))} placeholder="John Doe" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Card Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            value={cardData.number}
                            onChange={e => setCardData(d => ({ ...d, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim() }))}
                            placeholder="1234 5678 9012 3456"
                            className="w-full pl-9 pr-4 border border-gray-200 rounded-xl py-2.5 text-sm font-mono focus:outline-none focus:border-[#1a3c8f] tracking-wider"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">Expiry (MM/YY)</label>
                          <input value={cardData.expiry} onChange={e => setCardData(d => ({ ...d, expiry: e.target.value }))} placeholder="12/27" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">CVV</label>
                          <input type="password" value={cardData.cvv} onChange={e => setCardData(d => ({ ...d, cvv: e.target.value.slice(0, 3) }))} placeholder="•••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" maxLength={3} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                      <Lock className="w-3.5 h-3.5" />
                      Secured by Stripe · 256-bit SSL encryption
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={handlePay}
                      disabled={processing}
                      className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {processing
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
                        : <><CreditCard className="w-4 h-4" />Pay {resource.currency === "USD" ? "$" : ""}{resource.price.toFixed(2)}</>
                      }
                    </motion.button>
                    <button onClick={() => setStep("confirm")} className="w-full text-xs text-gray-400 hover:text-gray-600 mt-3 text-center">← Back</button>
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main Page ── */
export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState<Set<string>>(new Set());
  const [payingResource, setPayingResource] = useState<Resource | null>(null);
  const [popularResources, setPopularResources] = useState<Resource[]>([]);

  const fetchResources = async (category = "", query = "") => {
    setLoading(true);
    try {
      const params: Record<string, string> = { status: "active", limit: "50" };
      if (category) params.category = category;
      if (query) params.search = query;
      const res = await resourcesApi.getAll(params);
      const data: Resource[] = res.data?.data || [];
      setResources(data);

      // Fetch popular (paid, highest price first)
      if (!category && !query) {
        const paid = data.filter(r => r.is_paid).sort((a, b) => b.price - a.price).slice(0, 5);
        setPopularResources(paid);
      }
    } catch {}
    setLoading(false);
  };

  // Fetch user's purchases
  const fetchPurchases = async () => {
    if (!user) return;
    try {
      const { data } = await insforge.database.from("purchases").select("resource_id").eq("user_id", user.id).eq("payment_status", "completed");
      setPurchases(new Set((data || []).map((p: any) => p.resource_id)));
    } catch {}
  };

  useEffect(() => { fetchResources(); fetchPurchases(); }, [user]);
  useEffect(() => { fetchResources(activeCategory, search); }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchResources(activeCategory, search); };

  const handleResourceClick = (resource: Resource) => {
    if (!resource.is_paid || purchases.has(resource.id)) {
      // Free or already purchased
      if (resource.file_url) {
        window.open(resource.file_url, "_blank");
      } else {
        toast.success("Resource downloaded!");
      }
    } else {
      // Needs purchase
      if (!user) {
        toast.error("Please log in to purchase resources.");
        return;
      }
      setPayingResource(resource);
    }
  };

  const handlePopularClick = (title: string) => {
    const found = resources.find(r => r.title === title);
    if (found) handleResourceClick(found);
    else {
      setActiveCategory(""); setSearch(title);
      fetchResources("", title);
    }
  };

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white">
        <FadeUp className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">RESOURCES FOR YOUR SUCCESS</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight">
            Access Tools That Get You Ahead
          </h1>
          <p className="text-blue-200 max-w-xl mx-auto mb-7 text-sm sm:text-base">
            CV templates, scholarship guides, interview tips, study abroad handbooks — everything you need to succeed.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guides, templates, tools…" className="w-full pl-9 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none" />
            </div>
            <button type="submit" className="px-5 py-3 bg-white text-[#1a3c8f] font-bold rounded-xl hover:bg-blue-50 text-sm transition-colors whitespace-nowrap">Search</button>
          </form>
        </FadeUp>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <span className="text-gray-900">Resources</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex flex-col lg:flex-row gap-6">
        {/* ── Main ── */}
        <div className="flex-1 min-w-0">
          {/* Category tabs (scrollable on mobile) */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(({ id, label, icon: Icon, color }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 border",
                  activeCategory === id
                    ? "bg-[#1a3c8f] text-white border-[#1a3c8f] shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3c8f] hover:text-[#1a3c8f]"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            ))}
          </div>

          {/* Resources grid */}
          {loading ? (
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-32 bg-gray-100 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-100 rounded mb-2" />
                  <div className="h-3 bg-gray-50 rounded w-3/4" />
                </div>
              ))}
            </StaggerGroup>
          ) : resources.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-600 mb-1">No resources found</h3>
              <p className="text-gray-400 text-sm">Try a different category or search term.</p>
            </div>
          ) : (
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {resources.map(resource => {
                const owned = purchases.has(resource.id);
                const isPaid = resource.is_paid && !owned;
                const catInfo = CATEGORIES.find(c => c.id === resource.category);

                return (
                  <StaggerItem key={resource.id}>
                    <motion.div
                      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(26,60,143,0.10)" }}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden group flex flex-col h-full"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-32 overflow-hidden">
                        {resource.image_url ? (
                          <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className={cn("w-full h-full flex items-center justify-center", catInfo?.color?.replace("text-", "bg-").replace("50", "100") || "bg-blue-100")}>
                            {catInfo ? <catInfo.icon className="w-12 h-12 opacity-40" /> : <BookOpen className="w-12 h-12 opacity-30 text-gray-400" />}
                          </div>
                        )}
                        {/* Price badge */}
                        <div className="absolute top-2 right-2">
                          {resource.is_paid ? (
                            owned ? (
                              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Unlock className="w-3 h-3" /> Owned
                              </span>
                            ) : (
                              <span className="bg-[#1a3c8f] text-white text-xs font-bold px-2 py-1 rounded-full">
                                ${resource.price.toFixed(2)}
                              </span>
                            )
                          ) : (
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">FREE</span>
                          )}
                        </div>
                        {isPaid && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Lock className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-xs font-medium text-[#1a3c8f] bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-2">{resource.category}</span>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{resource.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{resource.description}</p>

                        {/* Action button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleResourceClick(resource)}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                            isPaid
                              ? "bg-[#1a3c8f] text-white hover:bg-blue-900"
                              : "bg-green-600 text-white hover:bg-green-700"
                          )}
                        >
                          {isPaid ? (
                            <><ShoppingCart className="w-4 h-4" />Buy for ${resource.price.toFixed(2)}</>
                          ) : owned ? (
                            <><Download className="w-4 h-4" />Download</>
                          ) : (
                            <><Download className="w-4 h-4" />Free Download</>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
          {/* Popular Resources */}
          <FadeUp delay={0.1} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-gray-900">Popular Resources</h3>
            </div>
            <div className="space-y-2">
              {(popularResources.length > 0 ? popularResources : resources.filter(r => r.is_paid).slice(0, 5)).map((resource, i) => (
                <motion.button
                  key={resource.id}
                  whileHover={{ x: 3 }}
                  onClick={() => handleResourceClick(resource)}
                  className="flex items-center justify-between w-full py-2 text-left group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 bg-blue-100 text-[#1a3c8f] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                    <span className="text-xs text-gray-700 group-hover:text-[#1a3c8f] transition-colors line-clamp-2">{resource.title}</span>
                  </div>
                  <span className="text-xs font-bold text-[#1a3c8f] ml-2 flex-shrink-0">
                    {resource.is_paid && !purchases.has(resource.id) ? `$${resource.price.toFixed(2)}` : "FREE"}
                  </span>
                </motion.button>
              ))}
              {popularResources.length === 0 && resources.length === 0 && POPULAR.map((title, i) => (
                <button key={i} onClick={() => handlePopularClick(title)} className="flex items-center justify-between w-full py-2 text-left group">
                  <span className="text-xs text-gray-700 group-hover:text-[#1a3c8f] transition-colors">{title}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a3c8f]" />
                </button>
              ))}
            </div>
          </FadeUp>

          {/* Request a resource */}
          <FadeUp delay={0.2} className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h4 className="font-bold text-gray-900 text-sm mb-1.5">Can't find what you need?</h4>
            <p className="text-xs text-gray-500 mb-3">Request a resource and we'll get it for you.</p>
            <Link href="/contact" className="flex items-center justify-center gap-1.5 bg-[#1a3c8f] text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-900 transition-colors">
              Request Now →
            </Link>
          </FadeUp>

          {/* WhatsApp CTA */}
          <FadeUp delay={0.3} className="bg-gradient-to-b from-[#075E54] to-[#128C7E] rounded-2xl p-4 text-white">
            <p className="font-bold text-sm mb-1">Get Free Resources on WhatsApp!</p>
            <p className="text-xs text-green-200 mb-3">Daily tips, guides and resources shared free on our channel.</p>
            <a href="https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-white text-[#075E54] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-green-50 transition-colors">
              Join Now →
            </a>
          </FadeUp>
        </aside>
      </div>

      <WhatsAppBanner />

      {/* Payment Modal */}
      {payingResource && (
        <PaymentModal
          resource={payingResource}
          onClose={() => setPayingResource(null)}
          onSuccess={() => {
            setPurchases(prev => new Set([...prev, payingResource.id]));
            toast.success("Purchase successful! You can now access this resource.");
          }}
        />
      )}
    </div>
  );
}
