"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Video,
  LayoutGrid,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FadeIn, StaggerItem, StaggerContainer } from "@/components/motion";
import Link from "next/link";
import { useTextMeasurement } from "@/hooks/useTextMeasurement";

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
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();

  // View mode toggle
  const [viewMode, setViewMode] = useState<"masonry" | "calendar">("masonry");

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Review dialog state
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Masonry context
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const { isReady, measureTextHeight } = useTextMeasurement("14px Inter, system-ui, sans-serif");

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!parentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setContainerWidth(width);
      if (width < 768) setColumns(1);
      else if (width < 1024) setColumns(2);
      else setColumns(3);
    });
    observer.observe(parentRef.current);

    const initialWidth = parentRef.current.offsetWidth;
    setContainerWidth(initialWidth);
    if (initialWidth < 768) setColumns(1);
    else if (initialWidth < 1024) setColumns(2);
    else setColumns(3);

    return () => observer.disconnect();
  }, [loading, sessions.length]);

  const handleStatusChange = async (sessionId: string, newStatus: string) => {
    // If completing, show the review dialog
    if (newStatus === "COMPLETED") {
      setUpdating(sessionId);
      try {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId ? { ...s, status: newStatus } : s
            )
          );
          // Open review dialog
          setReviewSessionId(sessionId);
          setReviewRating(0);
          setReviewComment("");
        }
      } finally {
        setUpdating(null);
      }
      return;
    }

    setUpdating(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, status: newStatus } : s
          )
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleSchedule = async (sessionId: string) => {
    if (!scheduleDate) return;
    setUpdating(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: scheduleDate.toISOString(),
          status: "SCHEDULED",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, status: "SCHEDULED", scheduledAt: data.session.scheduledAt }
              : s
          )
        );
        setSchedulingId(null);
        setScheduleDate(undefined);
      }
    } finally {
      setUpdating(null);
    }
  };

  const submitReview = async () => {
    if (!reviewSessionId || reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: reviewSessionId,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });
    } catch {
      // silently handle
    } finally {
      setSubmittingReview(false);
      setReviewSessionId(null);
    }
  };

  const statusConfig: Record<
    string,
    { icon: React.ReactNode; color: string; bg: string }
  > = {
    COMPLETED: {
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    CANCELLED: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/40",
    },
    SCHEDULED: {
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    PENDING: {
      icon: <Clock className="h-3.5 w-3.5" />,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
  };

  const filters = ["all", "SCHEDULED", "PENDING", "COMPLETED", "CANCELLED"];
  const filteredSessions =
    filter === "all" ? sessions : sessions.filter((s) => s.status === filter);

  // Masonry layout
  const masonryColumns = useMemo(() => {
    if (filteredSessions.length === 0) return [];

    const cols: Session[][] = Array.from({ length: columns }, () => []);
    const colHeights = Array(columns).fill(0);

    filteredSessions.forEach((s) => {
      let minColIndex = 0;
      let minHeight = colHeights[0];
      for (let i = 1; i < columns; i++) {
        if (colHeights[i] < minHeight) {
          minHeight = colHeights[i];
          minColIndex = i;
        }
      }

      let cardHeight = 160;
      const titleWidth = Math.max((containerWidth / columns) - 130, 80);
      const titleHeight = isReady ? measureTextHeight(s.skill.name, titleWidth, 20) : 20;
      cardHeight += titleHeight;

      if (s.status === "PENDING" && s.role === "learner" && schedulingId === s.id) {
        cardHeight += 380;
      } else if (
        (s.status === "PENDING" && s.role === "teacher") ||
        (s.status === "PENDING" && s.role === "learner") ||
        s.status === "SCHEDULED"
      ) {
        cardHeight += 60;
      }

      cols[minColIndex].push(s);
      colHeights[minColIndex] += cardHeight + 16;
    });

    return cols;
  }, [filteredSessions, columns, containerWidth, isReady, measureTextHeight, schedulingId]);

  // Calendar helpers
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const sessionsByDay = useMemo(() => {
    const map = new Map<number, Session[]>();
    filteredSessions.forEach((s) => {
      if (!s.scheduledAt) return;
      const d = new Date(s.scheduledAt);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(s);
      }
    });
    return map;
  }, [filteredSessions, calYear, calMonth]);

  const renderSessionCard = (s: Session) => {
    const config = statusConfig[s.status] || statusConfig.PENDING;
    return (
      <StaggerItem key={s.id}>
        <Card className="hover:border-primary/20 transition-all hover:shadow-sm h-full flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-semibold break-words leading-tight flex-1">
              {s.skill.name}
            </CardTitle>
            <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${config.color} ${config.bg}`}>
              {config.icon}
              {s.status}
            </span>
          </CardHeader>
          <CardContent className="space-y-2 flex-1 flex flex-col">
            <div className="flex-1 space-y-2">
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
                  ? `${new Date(s.scheduledAt).toLocaleDateString()} at ${new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`
                  : "Date TBD"}
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                {s.role === "teacher" ? "Teaching" : "Learning"}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t h-fit shrink-0">
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
              {s.status === "PENDING" && s.role === "learner" && schedulingId !== s.id && (
                <Button size="sm" variant="outline" onClick={() => setSchedulingId(s.id)} className="w-full">
                  <CalendarDays className="mr-2 h-4 w-4" /> Schedule Session
                </Button>
              )}
              {s.status === "PENDING" && s.role === "learner" && schedulingId === s.id && (
                <div className="w-full space-y-2">
                  <DateTimePicker value={scheduleDate} onChange={setScheduleDate} minDate={new Date()} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSchedule(s.id)} disabled={!scheduleDate || updating === s.id} className="flex-1">Confirm</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSchedulingId(null); setScheduleDate(undefined); }} className="flex-1">Cancel</Button>
                  </div>
                </div>
              )}
              {s.status === "SCHEDULED" && (
                <div className="w-full flex gap-2">
                  <Button size="sm" onClick={() => window.open(`https://meet.jit.si/skillswap-${s.id}`, '_blank')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Video className="mr-1.5 h-3.5 w-3.5" /> Join Video
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(s.id, "COMPLETED")} disabled={updating === s.id} className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Complete
                  </Button>
                </div>
              )}
              {s.status === "COMPLETED" && (
                <Button size="sm" variant="ghost" onClick={() => { setReviewSessionId(s.id); setReviewRating(0); setReviewComment(""); }} className="w-full text-amber-600 hover:bg-amber-50">
                  <Star className="mr-1.5 h-3.5 w-3.5" /> Leave a Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    );
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-80px)]">
      <div className="shrink-0 space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Sessions</h1>
              <p className="text-muted-foreground mt-1">Track your skill swap sessions</p>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("masonry")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "masonry" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" /> Calendar
              </button>
            </div>
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
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-32" />
            </Card>
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
      ) : viewMode === "masonry" ? (
        /* ======= MASONRY VIEW ======= */
        <div ref={parentRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 pb-10">
          <StaggerContainer className="flex items-start gap-4">
            {masonryColumns.map((col: Session[], colIndex: number) => (
              <div key={`col-${colIndex}`} className="flex-1 space-y-4 flex flex-col min-w-0">
                {col.map((s: Session) => renderSessionCard(s))}
              </div>
            ))}
          </StaggerContainer>
        </div>
      ) : (
        /* ======= CALENDAR VIEW ======= */
        <div className="flex-1 overflow-y-auto min-h-0 pb-10">
          <FadeIn>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <CardTitle className="text-base">{monthName}</CardTitle>
                  <button
                    onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {dayNames.map((d) => (
                    <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[80px] rounded-lg bg-muted/30" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const daySessions = sessionsByDay.get(day) || [];
                    const isToday =
                      new Date().getDate() === day &&
                      new Date().getMonth() === calMonth &&
                      new Date().getFullYear() === calYear;

                    return (
                      <div
                        key={day}
                        className={`min-h-[60px] sm:min-h-[80px] rounded-lg border p-1 transition-colors ${
                          isToday
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/30 hover:border-border/60"
                        }`}
                      >
                        <div className={`text-[10px] sm:text-xs font-medium mb-0.5 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {daySessions.slice(0, 2).map((s) => {
                            const config = statusConfig[s.status] || statusConfig.PENDING;
                            return (
                              <div
                                key={s.id}
                                className={`text-[8px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium ${config.bg} ${config.color}`}
                                title={`${s.skill.name} — ${s.role === "teacher" ? "Teaching" : "Learning from"} ${s.role === "teacher" ? s.learner.name : s.teacher.name}`}
                              >
                                {s.skill.name}
                              </div>
                            );
                          })}
                          {daySessions.length > 2 && (
                            <div className="text-[8px] sm:text-[10px] text-muted-foreground font-medium pl-1">
                              +{daySessions.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* ======= REVIEW DIALOG ======= */}
      {reviewSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <FadeIn className="w-full max-w-md">
            <Card className="shadow-2xl border-primary/20">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Rate this Session
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  How was your experience? Your review helps build trust.
                </p>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (reviewHover || reviewRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reviewRating === 0 ? "Select a rating" : 
                     reviewRating === 1 ? "Poor" :
                     reviewRating === 2 ? "Fair" :
                     reviewRating === 3 ? "Good" :
                     reviewRating === 4 ? "Great" : "Excellent!"}
                  </p>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment (optional)</label>
                  <Input
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={submitReview}
                    disabled={reviewRating === 0 || submittingReview}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setReviewSessionId(null)}
                    className="flex-1"
                  >
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
