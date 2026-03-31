"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  MessageCircle,
  Coins,
  CalendarDays,
  Video,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type AnalyticsData = {
  user: { name: string; credits: number; createdAt: string };
  stats: {
    totalCompleted: number;
    completedTeach: number;
    completedLearn: number;
    pendingCount: number;
    scheduledCount: number;
    unreadMessages: number;
    credits: number;
  };
  upcoming: {
    id: string;
    skill: string;
    with: string;
    role: "teacher" | "learner";
    scheduledAt: string;
  }[];
  creditTimeline: { date: string; earned: number; spent: number }[];
  badges: { name: string; icon: string; description: string }[];
};

export default function OverviewPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-24" />
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="animate-pulse"><CardContent className="pt-6 h-64" /></Card>
          <Card className="animate-pulse"><CardContent className="pt-6 h-64" /></Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "Credits",
      value: data.stats.credits,
      icon: Coins,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Sessions Completed",
      value: data.stats.totalCompleted,
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Scheduled",
      value: data.stats.scheduledCount,
      icon: CalendarDays,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Unread Messages",
      value: data.stats.unreadMessages,
      icon: MessageCircle,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {data.user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your SkillSwap activity overview
          </p>
        </div>
      </FadeIn>

      {/* Stat Cards */}
      <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StaggerItem key={stat.title}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-xl ${stat.bg}`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.title}
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Credit Activity Chart */}
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                Credit Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.creditTimeline.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.creditTimeline}>
                    <defs>
                      <linearGradient
                        id="earnedGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(142, 76%, 36%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(142, 76%, 36%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="spentGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(0, 84%, 60%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(0, 84%, 60%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="earned"
                      stroke="hsl(142, 76%, 36%)"
                      fill="url(#earnedGrad)"
                      strokeWidth={2}
                      name="Earned"
                    />
                    <Area
                      type="monotone"
                      dataKey="spent"
                      stroke="hsl(0, 84%, 60%)"
                      fill="url(#spentGrad)"
                      strokeWidth={2}
                      name="Spent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                    <p>Complete sessions to see your credit activity</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Upcoming Sessions */}
        <FadeIn delay={0.2}>
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Upcoming Sessions
                </CardTitle>
                <Link
                  href="/sessions"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {data.upcoming.length > 0 ? (
                <div className="space-y-3">
                  {data.upcoming.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors group"
                    >
                      <div
                        className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 ${
                          s.role === "teacher"
                            ? "bg-emerald-500/10"
                            : "bg-primary/10"
                        }`}
                      >
                        {s.role === "teacher" ? (
                          <BookOpen className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <GraduationCap className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {s.skill}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.role === "teacher" ? "Teaching" : "Learning from"}{" "}
                          {s.with}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium">
                          {new Date(s.scheduledAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(s.scheduledAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://meet.jit.si/skillswap-${s.id}`,
                            "_blank"
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        title="Join Video Call"
                      >
                        <Video className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                    <p>No upcoming sessions</p>
                    <Link
                      href="/explore"
                      className="text-primary text-xs hover:underline mt-1 inline-block"
                    >
                      Browse skills →
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Badges & Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Badges */}
        <FadeIn delay={0.25}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {data.badges.map((badge) => (
                    <div
                      key={badge.name}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{badge.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete sessions to earn badges!
                </p>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/explore"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium">Find Skills</span>
                </Link>
                <Link
                  href="/sessions"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CalendarDays className="h-5 w-5 text-emerald-500" />
                  </div>
                  <span className="text-xs font-medium">My Sessions</span>
                </Link>
                <Link
                  href="/messages"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-5 w-5 text-indigo-500" />
                  </div>
                  <span className="text-xs font-medium">Messages</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Coins className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="text-xs font-medium">Settings</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Teaching vs Learning Split */}
      <FadeIn delay={0.35}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Teaching vs Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Teaching</span>
                  <span className="font-semibold">
                    {data.stats.completedTeach}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                    style={{
                      width: `${
                        data.stats.totalCompleted > 0
                          ? (data.stats.completedTeach /
                              data.stats.totalCompleted) *
                            100
                          : 50
                      }%`,
                    }}
                  />
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-primary/20 text-primary"
              >
                {data.stats.totalCompleted} total
              </Badge>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Learning</span>
                  <span className="font-semibold">
                    {data.stats.completedLearn}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700"
                    style={{
                      width: `${
                        data.stats.totalCompleted > 0
                          ? (data.stats.completedLearn /
                              data.stats.totalCompleted) *
                            100
                          : 50
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
