"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

interface UseChatBotOptions {
  /** Stable per-user key so history persists correctly across sessions. */
  storageKey: string;
  /** Whether to persist to localStorage (signed-in) or sessionStorage (visitor). */
  persistent: boolean;
  /** First name (or similar) piped into the system prompt. */
  displayName?: string | null;
  /** Cap on history length pushed to the server. */
  historyLimit?: number;
}

/**
 * All chat state + network logic. UI-agnostic so the component stays presentational.
 * Consumes the streaming /api/chat endpoint — server sends UTF-8 text chunks.
 */
export function useChatBot({ storageKey, persistent, displayName, historyLimit = 14 }: UseChatBotOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Hydrate from storage on mount.
  useEffect(() => {
    try {
      const store = persistent ? localStorage : sessionStorage;
      const saved = store.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Array<Omit<ChatMessage, "timestamp"> & { timestamp: string }>;
      // Post-hydration state sync from browser storage — this pattern is
      // exactly what the setState-in-effect warning cautions against, but
      // there's no non-effect alternative that stays SSR-safe.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
    } catch {
      // corrupt/blocked storage — ignore
    }
  }, [storageKey, persistent]);

  // Persist (last 50 only, to bound storage growth).
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      const store = persistent ? localStorage : sessionStorage;
      store.setItem(storageKey, JSON.stringify(messages.slice(-50)));
    } catch {
      // storage may be full / unavailable — swallow
    }
  }, [messages, storageKey, persistent]);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setIsLoading(true);
      setStreamingText("");

      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.slice(-historyLimit).map((m) => ({ role: m.role, content: m.content })),
            userName: displayName ?? null,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let msg = `HTTP ${res.status}`;
          try {
            const err = await res.json();
            if (err?.error) msg = err.error;
          } catch { /* ignore */ }
          throw new Error(msg);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setStreamingText(full);
        }

        if (!full) throw new Error("Empty response");

        setMessages((prev) => [
          ...prev,
          { id: `a_${Date.now()}`, role: "assistant", content: full, timestamp: new Date() },
        ]);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          {
            id: `e_${Date.now()}`,
            role: "assistant",
            content: `Sorry, something went wrong. Please try again or [contact us](/contact) directly. 📞 +231 770 787 020`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setStreamingText("");
        abortRef.current = null;
      }
    },
    [messages, isLoading, displayName, historyLimit]
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingText("");
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
    } catch { /* ignore */ }
  }, [storageKey]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    streamingText,
    sendMessage,
    clearChat,
    stop,
    /** True while awaiting first byte OR while streaming tokens. */
    isTyping: isLoading || streamingText.length > 0,
  };
}
