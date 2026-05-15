"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, RefreshCw, Sparkles, ChevronDown, Copy, CheckCheck,
  Calculator, Briefcase, GraduationCap, BookOpen, Phone, Share2,
  Minimize2, ExternalLink, Loader2, Bot
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Quick action chips ─────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: Calculator, label: "Calculate GPA", color: "bg-purple-50 border-purple-200 text-purple-700", prompt: "Help me calculate my GPA and recommend scholarships" },
  { icon: GraduationCap, label: "Find Scholarships", color: "bg-blue-50 border-blue-200 text-blue-700", prompt: "Show me available scholarships for Liberian students" },
  { icon: Briefcase, label: "Improve my CV", color: "bg-green-50 border-green-200 text-green-700", prompt: "How can I improve my CV to get more opportunities?" },
  { icon: Share2, label: "Study Abroad", color: "bg-orange-50 border-orange-200 text-orange-700", prompt: "What fully funded study abroad programs are available?" },
  { icon: BookOpen, label: "Application Letter", color: "bg-teal-50 border-teal-200 text-teal-700", prompt: "Help me write a strong application letter for a scholarship" },
  { icon: Sparkles, label: "Find Internships", color: "bg-pink-50 border-pink-200 text-pink-700", prompt: "What internship opportunities are available on StarzLink?" },
];

// ── Render markdown-style links and bold ──────────────────────────────────────
function MessageContent({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
        if (linkMatch) {
          const [, label, href] = linkMatch;
          const isExternal = href.startsWith("http");
          if (isExternal) return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer"
              className="text-[#1a3c8f] font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-blue-700 break-all">
              {label}<ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          );
          return (
            <Link key={i} href={href}
              className="text-[#1a3c8f] font-semibold underline underline-offset-2 hover:text-blue-700">
              {label}
            </Link>
          );
        }
        if (boldMatch) return <strong key={i} className="font-bold text-gray-900">{boldMatch[1]}</strong>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Typing dots ────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-0.5">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-[#1a3c8f]/40"
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

// ── Bot avatar ─────────────────────────────────────────────────────────────────
function BotAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const px = size === "md" ? 40 : 28;
  const cls = size === "md" ? "w-10 h-10" : "w-7 h-7";
  return (
    <div className={`${cls} rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0`}>
      <Image src="/images/logo.jpg" alt="StarzLink" width={px} height={px}
        className="w-full h-full object-contain p-0.5"
        onError={e => {
          const t = e.target as HTMLImageElement;
          t.style.display = "none";
          if (t.parentElement) t.parentElement.innerHTML = '<span class="text-[#1a3c8f] font-black text-xs">S</span>';
        }} />
    </div>
  );
}

// ── Main ChatBot ───────────────────────────────────────────────────────────────
export default function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const typeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `starzlink_chat_${user?.id ?? "visitor"}`;

  // Load chat history
  useEffect(() => {
    try {
      const store = user ? localStorage : sessionStorage;
      const saved = store.getItem(storageKey);
      if (saved) {
        const parsed: any[] = JSON.parse(saved);
        setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch {}
    // Show welcome tooltip after 3s
    const t = setTimeout(() => setShowWelcome(true), 3000);
    return () => clearTimeout(t);
  }, [storageKey]);

  // Persist history
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      const store = user ? localStorage : sessionStorage;
      store.setItem(storageKey, JSON.stringify(messages.slice(-50)));
    } catch {}
  }, [messages, storageKey, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typewriterText, isLoading]);

  // Unread badge
  useEffect(() => {
    if (!isOpen && messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setHasUnread(true);
    }
    if (isOpen) setHasUnread(false);
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, isMinimized]);

  // Outside click closes
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isOpen) return;
      const btn = document.getElementById("slchat-btn");
      if (btn?.contains(e.target as Node)) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Typewriter effect
  const runTypewriter = useCallback((fullText: string, onDone: (t: string) => void) => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    let i = 0;
    setTypewriterText("");
    const speed = fullText.length > 300 ? 8 : 15; // ms per character
    typeTimerRef.current = setInterval(() => {
      i++;
      setTypewriterText(fullText.slice(0, i));
      if (i >= fullText.length) {
        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
        onDone(fullText);
        setTypewriterText("");
      }
    }, speed);
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setTypewriterText("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          userName: user?.full_name?.split(" ")[0] ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const aiText: string = data.content ?? "";
      setIsLoading(false);

      // Run typewriter, then save to messages
      runTypewriter(aiText, (full) => {
        const botMsg: Message = {
          id: `a_${Date.now()}`,
          role: "assistant",
          content: full,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      setIsLoading(false);
      setTypewriterText("");
      setMessages(prev => [...prev, {
        id: `e_${Date.now()}`,
        role: "assistant",
        content: `Sorry, something went wrong. Please try again or [contact us](/contact) directly. 📞 +231 770 787 020`,
        timestamp: new Date(),
      }]);
    }
  }, [messages, user, isLoading, runTypewriter]);

  const clearChat = () => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    setMessages([]);
    setTypewriterText("");
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const timeStr = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const isTyping = isLoading || !!typewriterText;

  // ── Panel dimensions — responsive ────────────────────────────────────────────
  // Mobile: full width, slides from bottom; Desktop: fixed 380px floating panel

  return (
    <>
      {/* ── Floating toggle button ─────────────────────────────────────────── */}
      {/* bottom-[88px] on mobile keeps button above the 64px bottom nav + spacing */}
      <div className="fixed bottom-[88px] right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-2">
        {/* Welcome tooltip */}
        <AnimatePresence>
          {showWelcome && !isOpen && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 mr-1 max-w-[180px]"
            >
              <button onClick={() => setShowWelcome(false)} className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                <X className="w-3 h-3 text-gray-500" />
              </button>
              <p className="text-sm font-bold text-gray-900 leading-tight">👋 Need help?</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">I can find scholarships, calculate GPA & more!</p>
              {/* Arrow */}
              <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <button
          id="slchat-btn"
          onClick={() => { setIsOpen(v => !v); setIsMinimized(false); setShowWelcome(false); }}
          className="relative w-14 h-14 bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open StarzLink AI Assistant"
        >
          <AnimatePresence mode="wait">
            {isOpen
              ? <motion.div key="c" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.18 }}><X className="w-6 h-6" /></motion.div>
              : <motion.div key="o" initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.18 }}><Sparkles className="w-6 h-6" /></motion.div>
            }
          </AnimatePresence>

          {/* Unread dot */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">1</span>
            </span>
          )}

          {/* Pulse ring */}
          {!isOpen && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-[#1a3c8f] pointer-events-none"
              animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          )}
        </button>
      </div>

      {/* ── Chat panel ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop — only covers area above panel */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-[9997] sm:hidden"
              style={{ bottom: "72px" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={panelRef}
              /* Mobile: sits above bottom nav (160px from bottom); Desktop: floating panel */
              className={[
                "fixed z-[9998] flex flex-col bg-white overflow-hidden shadow-2xl border border-gray-100",
                // Mobile: full width, above bottom nav and AI button
                "bottom-[160px] left-3 right-3 rounded-[18px]",
                // Desktop: floating panel above button, fixed width
                "sm:bottom-[88px] sm:right-6 sm:left-auto sm:rounded-2xl sm:w-[380px]",
              ].join(" ")}
              style={{
                height: isMinimized
                  ? "auto"
                  : "min(72vh, 520px)",
                maxHeight: "min(72vh, 520px)",
              }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.8 }}
            >
              {/* ── Header ─────────────────────────────────────────────────────── */}
              <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] px-4 py-3.5 flex items-center gap-3 flex-shrink-0">

                <BotAvatar size="md" />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight">StarzLink Assistant</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-blue-200 text-xs truncate">Online · AI powered by Groq</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => setIsMinimized(v => !v)}
                    className="p-2 rounded-xl hover:bg-white/15 text-blue-200 hover:text-white transition-colors"
                    title={isMinimized ? "Expand" : "Minimize"}>
                    {isMinimized
                      ? <ChevronDown className="w-4 h-4 rotate-180" />
                      : <Minimize2 className="w-4 h-4" />}
                  </button>
                  {messages.length > 0 && (
                    <button onClick={clearChat}
                      className="p-2 rounded-xl hover:bg-white/15 text-blue-200 hover:text-white transition-colors"
                      title="Clear chat">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/15 text-blue-200 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* ── Messages ─────────────────────────────────────────────── */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 space-y-4 bg-gray-50/60 scroll-smooth">

                    {/* Welcome / empty state */}
                    {messages.length === 0 && !isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="text-center pt-2 pb-1">
                          <BotAvatar size="md" />
                          <div className="mt-3">
                            <h3 className="font-extrabold text-gray-900 text-base">
                              Hi{user?.full_name ? ` ${user.full_name.split(" ")[0]}` : ""}! 👋
                            </h3>
                            <p className="text-gray-500 text-sm mt-1 leading-relaxed max-w-[280px] mx-auto">
                              I'm your StarzLink AI assistant. Ask me about scholarships, calculate your GPA, or explore opportunities!
                            </p>
                          </div>
                        </div>

                        {/* Quick action grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {QUICK_ACTIONS.map(a => (
                            <button key={a.label} onClick={() => sendMessage(a.prompt)}
                              className={`flex items-center gap-2 ${a.color} border rounded-xl px-3 py-2.5 text-left transition-all hover:scale-[1.02] active:scale-95 group`}>
                              <a.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-xs font-semibold leading-tight">{a.label}</span>
                            </button>
                          ))}
                        </div>

                        <p className="text-center text-[10px] text-gray-400">
                          {user ? "💾 Conversations saved to your account" : "🔑 Log in to save conversations"}
                        </p>
                      </motion.div>
                    )}

                    {/* Messages */}
                    {messages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        {msg.role === "assistant"
                          ? <BotAvatar />
                          : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a3c8f] to-blue-400 flex items-center justify-center flex-shrink-0 self-end">
                              <span className="text-white text-xs font-bold">
                                {user?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
                              </span>
                            </div>
                          )
                        }

                        {/* Bubble */}
                        <div className={`group flex flex-col gap-1 max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                          <div className={`relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                            msg.role === "user"
                              ? "bg-[#1a3c8f] text-white rounded-tr-sm"
                              : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm"
                          }`}>
                            <div className="whitespace-pre-wrap">
                              {msg.role === "assistant"
                                ? <MessageContent text={msg.content} />
                                : msg.content}
                            </div>

                            {/* Copy on hover */}
                            {msg.role === "assistant" && (
                              <button
                                onClick={() => copyMessage(msg.id, msg.content)}
                                className="absolute -top-2.5 -right-2.5 opacity-0 group-hover:opacity-100 bg-white border border-gray-200 rounded-full p-1 shadow transition-opacity"
                              >
                                {copiedId === msg.id
                                  ? <CheckCheck className="w-3 h-3 text-green-500" />
                                  : <Copy className="w-3 h-3 text-gray-400" />}
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 px-1">{timeStr(msg.timestamp)}</span>
                        </div>
                      </motion.div>
                    ))}

                    {/* Loading / typewriter */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2"
                      >
                        <BotAvatar />
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[82%]">
                          {isLoading && !typewriterText
                            ? <TypingDots />
                            : (
                              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                <MessageContent text={typewriterText} />
                                <motion.span
                                  className="inline-block w-0.5 h-[1em] bg-[#1a3c8f] ml-0.5 align-middle"
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                />
                              </div>
                            )}
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* ── Follow-up chips ───────────────────────────────────────── */}
                  {messages.length > 0 && messages.length <= 4 && !isTyping && (
                    <div className="px-3 sm:px-4 py-2 border-t border-gray-100 bg-white flex gap-2 overflow-x-auto flex-shrink-0"
                      style={{ scrollbarWidth: "none" }}>
                      {["Calculate GPA 📊", "Find scholarships 🎓", "Study abroad ✈️", "Contact info 📞"].map(s => (
                        <button key={s} onClick={() => sendMessage(s)}
                          className="flex-shrink-0 text-xs font-medium text-[#1a3c8f] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 active:scale-95 transition-all whitespace-nowrap">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── Input area ────────────────────────────────────────────── */}
                  <div className="border-t border-gray-100 bg-white px-3 sm:px-4 pt-3 pb-4 sm:pb-3 flex-shrink-0">
                    <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#1a3c8f] focus-within:bg-white transition-all">
                      <textarea
                        ref={inputRef}
                        value={input}
                        rows={1}
                        disabled={isLoading}
                        onChange={e => {
                          setInput(e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about scholarships, GPA, opportunities…"
                        className="flex-1 bg-transparent text-sm text-gray-900 resize-none focus:outline-none placeholder:text-gray-400 leading-relaxed disabled:opacity-50 min-h-[22px] max-h-24"
                        style={{ height: "22px" }}
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        className="flex-shrink-0 w-9 h-9 bg-[#1a3c8f] rounded-xl flex items-center justify-center hover:bg-blue-900 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isLoading
                          ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                          : <Send className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 mt-1.5">
                      Enter ↵ to send · Shift+Enter for new line
                    </p>
                  </div>
                </>
              )}

              {/* Minimized bar */}
              {isMinimized && (
                <div className="px-4 py-3 bg-white flex items-center justify-between border-t border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-[#1a3c8f]" /> Chat minimized
                  </p>
                  <button onClick={() => setIsMinimized(false)}
                    className="text-xs font-bold text-[#1a3c8f] hover:underline">
                    Open ↑
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
