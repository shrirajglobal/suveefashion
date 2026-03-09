import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  messageContent: string;
  userState?: string;
}

export default function ChatFeedback({ messageContent, userState }: Props) {
  const [rated, setRated] = useState<string | null>(null);

  const handleRate = async (rating: string) => {
    setRated(rating);
    try {
      await supabase.from("chat_feedback").insert({
        message_content: messageContent.slice(0, 500),
        rating,
        user_state: userState || null,
      } as any);
    } catch (e) {
      console.error("Feedback error:", e);
    }
  };

  if (rated) {
    return (
      <span className="text-[10px] text-muted-foreground">
        {rated === "up" ? "👍" : "👎"} Thanks!
      </span>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <button
        onClick={() => handleRate("up")}
        className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-green-500"
      >
        <ThumbsUp className="h-3 w-3" />
      </button>
      <button
        onClick={() => handleRate("down")}
        className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-red-500"
      >
        <ThumbsDown className="h-3 w-3" />
      </button>
    </div>
  );
}
