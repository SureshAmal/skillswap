"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
      case "CANCELLED": return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      case "SCHEDULED": return <CalendarDays className="h-3.5 w-3.5 text-blue-500" />;
      default: return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">Manage your skill swap sessions</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="pt-6 h-32" /></Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No sessions yet</p>
            <p className="text-sm text-muted-foreground">Explore skills and book your first session!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{s.skill.name}</CardTitle>
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  {statusIcon(s.status)}
                  {s.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {s.role === "teacher" ? `Teaching ${s.learner.name}` : `Learning from ${s.teacher.name}`}
                </p>
                {s.scheduledAt && (
                  <p className="text-xs text-muted-foreground">
                    Scheduled: {new Date(s.scheduledAt).toLocaleDateString()} at {new Date(s.scheduledAt).toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
