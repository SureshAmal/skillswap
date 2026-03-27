"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, CheckCircle, XCircle, Sparkles, ArrowRight } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import Link from "next/link";

type Session = {
  id: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  skill: { name: string };
  teacher: { name: string };
  learner: { name: string };
  role: "teacher" | "learner";
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (sessionId: string, newStatus: string) => {
    setUpdating(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSessions((prev) => 
          prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    COMPLETED: { icon: <CheckCircle className="h-3.5 w-3.5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
    CANCELLED: { icon: <XCircle className="h-3.5 w-3.5" />, color: "text-red-500", bg: "bg-red-50" },
    SCHEDULED: { icon: <CalendarDays className="h-3.5 w-3.5" />, color: "text-primary", bg: "bg-primary/10" },
    PENDING: { icon: <Clock className="h-3.5 w-3.5" />, color: "text-amber-500", bg: "bg-amber-50" },
  };

  const filters = ["all", "SCHEDULED", "PENDING", "COMPLETED", "CANCELLED"];

  const filteredSessions = filter === "all" ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground mt-1">Track your skill swap sessions</p>
        </div>
      </FadeIn>

      {/* Filter pills */}
      <FadeIn delay={0.1}>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "All Sessions" : f.toLowerCase()}
            </button>
          ))}
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="pt-6 h-32" /></Card>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <FadeIn>
          <Card>
            <CardContent className="text-center py-20">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="font-semibold text-lg mb-1">
                {sessions.length === 0 ? "No sessions yet" : "No matching sessions"}
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                {sessions.length === 0
                  ? "Explore skills and book your first swap session!"
                  : "Try a different filter to see more sessions."}
              </p>
              {sessions.length === 0 && (
                <Link href="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Browse skills <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid gap-4 md:grid-cols-2">
          {filteredSessions.map((s) => {
            const config = statusConfig[s.status] || statusConfig.PENDING;
            return (
              <StaggerItem key={s.id}>
                <Card className="hover:border-primary/20 transition-all hover:shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold">{s.skill.name}</CardTitle>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color} ${config.bg}`}>
                      {config.icon}
                      {s.status}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      {s.role === "teacher" ? (
                        <>Teaching <span className="font-medium">{s.learner.name}</span></>
                      ) : (
                        <>Learning from <span className="font-medium">{s.teacher.name}</span></>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {s.scheduledAt
                        ? `${new Date(s.scheduledAt).toLocaleDateString()} at ${new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : "Date TBD"}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {s.role === "teacher" ? "Teaching" : "Learning"}
                    </Badge>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {s.status === "PENDING" && s.role === "teacher" && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(s.id, "SCHEDULED")} disabled={updating === s.id} className="w-full bg-primary/20 hover:bg-primary/30 text-primary border-0">
                            Accept
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(s.id, "CANCELLED")} disabled={updating === s.id} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                            Decline
                          </Button>
                        </>
                      )}
                      {s.status === "SCHEDULED" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(s.id, "COMPLETED")} disabled={updating === s.id} className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                        </Button>
                      )}
                      {s.status === "PENDING" && s.role === "learner" && (
                        <Button size="sm" variant="outline" disabled className="w-full opacity-50 border-dashed">
                          <Clock className="mr-2 h-4 w-4" /> Waiting for approval
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
