"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, RefreshCw, Sparkles, ChevronDown,
  Copy, CheckCheck, Calculator, Briefcase, GraduationCap,
  BookOpen, Phone, Share2, Bot, User as UserIcon, Loader2,
  ExternalLink, Minimize2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// ── Quick actions shown on empty state ────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: GraduationCap, label: "Find Scholarships", prompt: "Show me available scholarships for Liberian students" },
  { icon: Calculator, label: "Calculate My GPA", prompt: "Help me calculate my GPA and recommend scholarships" },
  { icon: Briefcase, label: "Browse Internships", prompt: "What internship opportunities are available on StarzLink?" },
  { icon: Share2, label: "Study Abroad", prompt: "What fully funded study abroad programs are available?" },
  { icon: Phone, label: "Contact Info", prompt: "What are the contact details for StarzLink?" },
  { icon: BookOpen, label: "How to Get Started", prompt: "How do I get started on StarzLink and find opportunities?" },
];

// ── Markdown link renderer ─────────────────────────────────────────────────────
function renderMessageContent(content: string) {
  // Split on [text](url) pattern
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const [, text, href] = linkMatch;
      const isExternal = href.startsWith("http");
      if (isExternal) {
        return (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer"
            className="text-[#1a3c8f] font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-blue-700">
            {text}<ExternalLink className="w-3 h-3" />
          </a>
        );
      }
      return (
        <Link key={i} href={href}
          className="text-[#1a3c8f] font-semibold underline underline-offset-2 hover:text-blue-700">
          {text}
        </Link>
      );
    }
    // Format line breaks
    return <span key={i}>{part}</span>;
  });
}

// ── Typing dots ────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 bg-[#1a3c8f]/50 rounded-full"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ── Main ChatBot ───────────────────────────────────────────────────────────────
export default function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const storageKey = `starzlink_chat_${user?.id || "visitor"}`;

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch {}
  }, [storageKey]);

  // Save to localStorage whenever messages change (only for logged-in users)
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      if (user) {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50)));
      } else {
        // Visitors: only keep session (will be cleared on page refresh via shorter store)
        sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-20)));
      }
    } catch {}
  }, [messages, storageKey, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Unread badge when closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") setHasUnread(true);
    }
    if (isOpen) setHasUnread(false);
  }, [messages, isOpen]);

  // Outside click closes the panel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const toggle = document.getElementById("chatbot-toggle-btn");
        if (toggle && toggle.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          userName: user?.full_name?.split(" ")[0] || null,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Failed to get response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setStreamingText("");
    } catch (err) {
      setIsLoading(false);
      setStreamingText("");
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again or [contact us](/contact) directly.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    }
  }, [messages, user, isLoading]);

  // ── Clear chat ────────────────────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([]);
    setStreamingText("");
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
  };

  // ── Copy message ──────────────────────────────────────────────────────────────
  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Handle Enter key ──────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const timeStr = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* ── Floating toggle button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Greeting tooltip — shows first time */}
        <AnimatePresence>
          {!isOpen && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 max-w-[200px] text-right"
            >
              <p className="text-sm font-semibold text-gray-900">Hi! 👋</p>
              <p className="text-xs text-gray-500 mt-0.5">Ask me about scholarships, jobs, and more!</p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          id="chatbot-toggle-btn"
          onClick={() => { setIsOpen(v => !v); setIsMinimized(false); }}
          className="relative w-14 h-14 bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          aria-label="Open StarzLink Assistant"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sparkles className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-[9px] font-bold">1</span>
            </motion.div>
          )}

          {/* Pulse ring */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#1a3c8f]"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </button>
      </div>

      {/* ── Chat Panel ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            style={{
              width: "min(calc(100vw - 2rem), 380px)",
              height: isMinimized ? "auto" : "min(calc(100vh - 120px), 600px)",
            }}
          >
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Logo as bot avatar */}
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/logo.jpg"
                    alt="StarzLink"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">StarzLink Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-blue-200 text-xs">Online · Powered by AI</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Minimize */}
                <button onClick={() => setIsMinimized(v => !v)}
                  className="p-1.5 hover:bg-white/15 rounded-lg text-blue-200 hover:text-white transition-colors"
                  title={isMinimized ? "Expand" : "Minimize"}>
                  {isMinimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                {/* Clear chat */}
                {messages.length > 0 && (
                  <button onClick={clearChat}
                    className="p-1.5 hover:bg-white/15 rounded-lg text-blue-200 hover:text-white transition-colors"
                    title="Clear conversation">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                {/* Close */}
                <button onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg text-blue-200 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* ── Messages area ─────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50 scroll-smooth">

                  {/* Welcome state */}
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mx-auto mb-3 overflow-hidden">
                        <Image src="/images/logo.jpg" alt="StarzLink" width={64} height={64} className="w-full h-full object-contain"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; const parent = (e.target as HTMLImageElement).parentElement; if (parent) parent.innerHTML = '<span class="text-[#1a3c8f] font-black text-xl">S</span>'; }} />
                      </div>
                      <h3 className="font-extrabold text-gray-900 mb-1">Hello{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}! 👋</h3>
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                        I'm your StarzLink AI assistant. I can help you find scholarships, calculate your GPA, discover opportunities, and more!
                      </p>

                      {/* Quick action chips */}
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {QUICK_ACTIONS.map(action => (
                          <button
                            key={action.label}
                            onClick={() => sendMessage(action.prompt)}
                            className="flex items-start gap-2 bg-white border border-gray-200 hover:border-[#1a3c8f] hover:bg-blue-50 rounded-xl p-2.5 text-left transition-colors group"
                          >
                            <action.icon className="w-4 h-4 text-[#1a3c8f] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-gray-700 leading-tight">{action.label}</span>
                          </button>
                        ))}
                      </div>

                      <p className="text-[10px] text-gray-400 mt-3">
                        {user ? "💾 Your conversations are saved" : "🔒 Login to save your conversations"}
                      </p>
                    </div>
                  )}

                  {/* Message list */}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center overflow-hidden ${msg.role === "user" ? "bg-[#1a3c8f]" : "bg-white border border-gray-100 shadow-sm"}`}>
                        {msg.role === "user" ? (
                          <span className="text-white text-xs font-bold">{user?.full_name?.charAt(0)?.toUpperCase() || "U"}</span>
                        ) : (
                          <Image src="/images/logo.jpg" alt="Bot" width={28} height={28} className="w-full h-full object-contain"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; const p = (e.target as HTMLImageElement).parentElement; if (p) p.innerHTML = '<span class="text-[#1a3c8f] text-xs font-bold">S</span>'; }} />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`group max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#1a3c8f] text-white rounded-tr-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                        }`}>
                          <div className="whitespace-pre-wrap break-words">
                            {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
                          </div>

                          {/* Copy button */}
                          {msg.role === "assistant" && (
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-full p-1 shadow-sm"
                            >
                              {copiedId === msg.id ? <CheckCheck className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 px-1">{timeStr(msg.timestamp)}</span>
                      </div>
                    </div>
                  ))}

                  {/* Streaming message */}
                  {(isLoading || streamingText) && (
                    <div className="flex gap-2.5">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                        <Image src="/images/logo.jpg" alt="Bot" width={28} height={28} className="w-full h-full object-contain"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; const p = (e.target as HTMLImageElement).parentElement; if (p) p.innerHTML = '<span class="text-[#1a3c8f] text-xs font-bold">S</span>'; }} />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm px-3.5 py-2.5 max-w-[85%]">
                        {isLoading && !streamingText ? (
                          <TypingDots />
                        ) : (
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                            {renderMessageContent(streamingText)}
                            <motion.span
                              className="inline-block w-0.5 h-4 bg-[#1a3c8f] ml-0.5 align-middle"
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ── Suggested follow-ups (after first response) ─────────────── */}
                {messages.length > 0 && messages.length < 4 && !isLoading && !streamingText && (
                  <div className="px-4 py-2 border-t border-gray-100 bg-white flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
                    {[
                      "Calculate my GPA 📊",
                      "Find scholarships 🎓",
                      "Study abroad options ✈️",
                      "Get contact info 📞",
                    ].map(s => (
                      <button key={s} onClick={() => sendMessage(s)}
                        className="text-xs font-medium text-[#1a3c8f] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-blue-100 transition-colors flex-shrink-0">
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Input area ────────────────────────────────────────────────── */}
                <div className="border-t border-gray-100 bg-white px-3 py-3 flex-shrink-0">
                  <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#1a3c8f] transition-colors">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about scholarships, GPA, opportunities…"
                      rows={1}
                      disabled={isLoading}
                      className="flex-1 bg-transparent text-sm text-gray-900 resize-none focus:outline-none placeholder:text-gray-400 min-h-[24px] max-h-[100px] leading-relaxed disabled:opacity-50"
                      style={{ height: "24px" }}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="flex-shrink-0 w-8 h-8 bg-[#1a3c8f] rounded-lg flex items-center justify-center hover:bg-blue-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">
                    StarzLink AI · Press Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </>
            )}

            {/* Minimized view */}
            {isMinimized && (
              <div className="px-4 py-2.5 bg-white border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">Chat minimized</p>
                <button onClick={() => setIsMinimized(false)} className="text-xs font-semibold text-[#1a3c8f] hover:underline">
                  Open
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
