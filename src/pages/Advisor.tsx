import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import AdvisorOnboarding from "@/components/advisor/AdvisorOnboarding";
import ChatFeedback from "@/components/advisor/ChatFeedback";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UserContext {
  state: string;
  businessType: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-advisor`;
const INSIGHTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-chat-insights`;

export default function Advisor() {
  const { t, language } = useLanguage();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const isStreamingRef = useRef(false);
  const hasScrolledToStartRef = useRef(false);

  // Scroll to the start of the latest assistant message, not the bottom
  const scrollToAssistantStart = useCallback(() => {
    const el = scrollContainerRef.current;
    const msgEl = lastAssistantRef.current;
    if (!el || !msgEl) return;
    if (!isNearBottomRef.current) return;

    if (isStreamingRef.current && !hasScrolledToStartRef.current) {
      // First chunk: scroll so the new message starts at top of visible area with some padding
      const msgTop = msgEl.offsetTop - el.offsetTop;
      el.scrollTop = msgTop - 12;
      hasScrolledToStartRef.current = true;
    } else if (!isStreamingRef.current) {
      // Not streaming (user message etc): scroll to bottom
      el.scrollTop = el.scrollHeight;
    }
    // During streaming after first scroll: don't auto-scroll, let user read from top of message
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 120;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  useEffect(() => {
    scrollToAssistantStart();
  }, [messages, scrollToAssistantStart]);

  // Mobile keyboard: adjust layout using visualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onResize = () => {
      const offsetFromBottom = window.innerHeight - vv.height - vv.offsetTop;
      document.documentElement.style.setProperty("--kb-offset", `${Math.max(0, offsetFromBottom)}px`);
    };

    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();

    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
      document.documentElement.style.setProperty("--kb-offset", "0px");
    };
  }, []);

  const handleOnboardingComplete = (ctx: UserContext) => {
    setUserContext(ctx);
    setMessages([{ role: "assistant", content: t("advisor.welcome"), timestamp: new Date() }]);
  };

  const chips = [t("advisor.chip1"), t("advisor.chip2"), t("advisor.chip3"), t("advisor.chip4")];

  const maybeExtractInsights = async (allMessages: Message[]) => {
    const userMsgCount = allMessages.filter((m) => m.role === "user").length;
    if (userMsgCount < 2) return;
    try {
      await fetch(INSIGHTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          userContext,
        }),
      });
    } catch {}
  };

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    // Force scroll to bottom on new user message, reset streaming flags
    isNearBottomRef.current = true;
    isStreamingRef.current = false;
    hasScrolledToStartRef.current = false;

    const userMsg: Message = { role: "user", content: messageText, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    isStreamingRef.current = true;

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
          userContext,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "Failed to get response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last !== updatedMessages[0]) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar, timestamp: new Date() }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {}
        }
      }

      const newCount = exchangeCount + 1;
      setExchangeCount(newCount);
      if (newCount >= 2) {
        setMessages((prev) => {
          maybeExtractInsights(prev);
          return prev;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Arre yaar, kuch technical problem aa rahi hai. Thodi der mein phir try kar ya Team Suvee ko WhatsApp kar de. 🙏`, timestamp: new Date() },
      ]);
    }

    isStreamingRef.current = false;
    setIsLoading(false);
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!userContext) {
    return (
      <div
        className="flex items-center justify-center px-4 overflow-y-auto"
        style={{ height: "calc(100dvh - 4rem)" }}
      >
        <AdvisorOnboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "calc(100dvh - 4rem)",
        paddingBottom: "var(--kb-offset, 0px)",
      }}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-2.5">
        <div className="container flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xl shadow-lg">
            🧔
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-base font-bold text-foreground leading-tight">{t("advisor.title")}</h1>
            <p className="truncate text-[11px] text-muted-foreground">
              📍 {userContext.state} · {userContext.businessType === "new" ? "🌱 New" : userContext.businessType === "wholesaler" ? "📦 Wholesaler" : "🏪 Retailer"}
              {" · FREE"}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-bold text-green-600">
            ● ONLINE
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-none px-4 py-4"
      >
        <div className="mx-auto max-w-3xl space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${msg.role === "assistant" ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-secondary"}`}>
                  {msg.role === "assistant" ? "🧔" : <User className="h-3.5 w-3.5 text-secondary-foreground" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card text-card-foreground shadow-sm rounded-tl-sm"}`}>
                  <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className={`text-[10px] ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                    {msg.role === "assistant" && i > 0 && (
                      <ChatFeedback messageContent={msg.content} userState={userContext.state} />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm">
                🧔
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card px-3.5 py-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Dada soch raha hai...</span>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick chips inside messages area */}
          {messages.length <= 1 && !isLoading && (
            <div className="flex flex-wrap gap-2 pt-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:border-accent"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-card px-4 py-2.5">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("advisor.placeholder")}
              className="flex-1 text-sm"
              maxLength={500}
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-1 hidden text-center text-[10px] text-muted-foreground/50 md:block">
            Powered by Suvee Fashion · AI advice for your kurti business
          </p>
        </div>
      </div>
    </div>
  );
}
