import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Advisor() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("advisor.welcome"), timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chips = [
    t("advisor.chip1"),
    t("advisor.chip2"),
    t("advisor.chip3"),
    t("advisor.chip4"),
  ];

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = { role: "user", content: messageText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Mock AI response (will be replaced with edge function in Phase 2)
    setTimeout(() => {
      const mockResponses: Record<string, string> = {
        default: language === "hi"
          ? "यह एक बहुत अच्छा सवाल है! अभी हमारा AI सलाहकार सेटअप हो रहा है। जल्द ही हम आपको पूरी मदद दे पाएंगे। फिलहाल, WhatsApp पर Team Suvee से संपर्क करें। 🙏"
          : language === "bn"
          ? "এটি একটি খুব ভালো প্রশ্ন! এখন আমাদের AI পরামর্শদাতা সেটআপ হচ্ছে। শীঘ্রই আমরা আপনাকে সম্পূর্ণ সাহায্য করতে পারব। আপাতত, WhatsApp-এ Team Suvee-এর সাথে যোগাযোগ করুন। 🙏"
          : "That's a great question! Our AI business advisor is currently being set up. Soon we'll be able to help you with detailed answers. In the meantime, connect with Team Suvee on WhatsApp for instant help! 🙏",
      };

      const assistantMsg: Message = {
        role: "assistant",
        content: mockResponses.default,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 5rem)" }}>
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-maroon">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">{t("advisor.title")}</h1>
            <p className="text-xs text-muted-foreground">
              {language === "hi" ? "मुफ्त बिजनेस सलाह" : language === "bn" ? "বিনামূল্যে ব্যবসায়িক পরামর্শ" : "Free business advice for kurti retailers"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-background px-4 py-6">
        <div className="container max-w-3xl space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "assistant" ? "gradient-maroon" : "bg-secondary"
                }`}>
                  {msg.role === "assistant" ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-secondary-foreground" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card text-card-foreground shadow-sm rounded-tl-sm"
                  }`}
                >
                  <div className="prose prose-sm max-w-none text-sm [&_p]:m-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <p className={`mt-1 text-[10px] ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-maroon">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <div className="border-t border-border bg-card px-4 py-3">
          <div className="container max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="container max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("advisor.placeholder")}
              className="flex-1"
              maxLength={500}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
