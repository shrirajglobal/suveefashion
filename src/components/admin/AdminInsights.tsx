import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, TrendingUp, MapPin, MessageSquare } from "lucide-react";

interface ChatInsight {
  id: string;
  created_at: string;
  user_state: string | null;
  business_type: string | null;
  question_topic: string | null;
  question_summary: string | null;
  key_insight: string | null;
}

interface ChatFeedbackRow {
  id: string;
  created_at: string;
  message_content: string;
  rating: string;
  user_state: string | null;
}

export default function AdminInsights() {
  const [insights, setInsights] = useState<ChatInsight[]>([]);
  const [feedback, setFeedback] = useState<ChatFeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [insightsRes, feedbackRes] = await Promise.all([
      supabase.from("chat_insights").select("*").order("created_at", { ascending: false }).limit(50) as any,
      supabase.from("chat_feedback").select("*").order("created_at", { ascending: false }).limit(100) as any,
    ]);
    setInsights(insightsRes.data || []);
    setFeedback(feedbackRes.data || []);
    setLoading(false);
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading insights...</p>;

  // Compute stats
  const topicCounts: Record<string, number> = {};
  const stateCounts: Record<string, number> = {};
  insights.forEach((i) => {
    if (i.question_topic) topicCounts[i.question_topic] = (topicCounts[i.question_topic] || 0) + 1;
    if (i.user_state) stateCounts[i.user_state] = (stateCounts[i.user_state] || 0) + 1;
  });

  const thumbsUp = feedback.filter((f) => f.rating === "up").length;
  const thumbsDown = feedback.filter((f) => f.rating === "down").length;

  const topTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6 py-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-2xl font-bold">{insights.length}</p>
            <p className="text-xs text-muted-foreground">Total Chats Analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ThumbsUp className="mx-auto h-5 w-5 text-green-500" />
            <p className="mt-1 text-2xl font-bold">{thumbsUp}</p>
            <p className="text-xs text-muted-foreground">Positive Feedback</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ThumbsDown className="mx-auto h-5 w-5 text-red-500" />
            <p className="mt-1 text-2xl font-bold">{thumbsDown}</p>
            <p className="text-xs text-muted-foreground">Negative Feedback</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="mx-auto h-5 w-5 text-secondary" />
            <p className="mt-1 text-2xl font-bold">{Object.keys(stateCounts).length}</p>
            <p className="text-xs text-muted-foreground">Regions Covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics & Regions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-2">
                {topTopics.map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between">
                    <Badge variant="secondary">{topic}</Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" /> Top Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topStates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-2">
                {topStates.map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <Badge variant="outline">{state}</Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Chat Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">Insights will appear here as users chat with Dada</p>
          ) : (
            <div className="space-y-3">
              {insights.slice(0, 20).map((i) => (
                <div key={i.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap gap-2 mb-1">
                    {i.question_topic && <Badge variant="secondary" className="text-[10px]">{i.question_topic}</Badge>}
                    {i.user_state && <Badge variant="outline" className="text-[10px]">📍 {i.user_state}</Badge>}
                    {i.business_type && <Badge variant="outline" className="text-[10px]">{i.business_type}</Badge>}
                  </div>
                  {i.question_summary && <p className="text-sm font-medium text-foreground">{i.question_summary}</p>}
                  {i.key_insight && <p className="text-xs text-muted-foreground mt-1">💡 {i.key_insight}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(i.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
