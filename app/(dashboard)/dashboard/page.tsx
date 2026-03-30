import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  TrendingUp,
  Users,
  Award,
  Search,
  ArrowRight,
  BookOpen,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      skills: { include: { skill: true } },
      sessionsAsTeacher: { take: 5, orderBy: { createdAt: "desc" } },
      sessionsAsLearner: { take: 5, orderBy: { createdAt: "desc" } },
    },
  });

  const teachSkills = user?.skills.filter((s) => s.type === "TEACH") ?? [];
  const learnSkills = user?.skills.filter((s) => s.type === "LEARN") ?? [];
  const totalSessions =
    (user?.sessionsAsTeacher.length ?? 0) +
    (user?.sessionsAsLearner.length ?? 0);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your skills
          </p>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Search className="h-[18px] w-[18px]" /> Find a swap
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">
              {user?.credits ?? 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Credits</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">
              {teachSkills.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Teaching</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(253,203,110,0.15)" }}
          >
            <Target className="h-5 w-5 text-accent-orange" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">
              {learnSkills.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Learning</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(232,67,147,0.1)" }}
          >
            <Trophy className="h-5 w-5 text-accent-pink" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{totalSessions}</p>
            <p className="text-sm text-muted-foreground mt-1">Sessions</p>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Your Skills
              </CardTitle>
              <Link
                href="/settings"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {teachSkills.length === 0 && learnSkills.length === 0 ? (
              <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-5">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">No skills added yet</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Go to{" "}
                    <Link
                      href="/settings"
                      className="text-primary hover:underline"
                    >
                      Settings
                    </Link>{" "}
                    to add what you can teach and want to learn.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {teachSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                      I can teach
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {teachSkills.map((s) => (
                        <Badge
                          key={s.id}
                          className="bg-primary/10 text-primary border-0 hover:bg-primary/20 text-sm px-3 py-1"
                        >
                          {s.skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {learnSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wider">
                      I want to learn
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {learnSkills.map((s) => (
                        <Badge
                          key={s.id}
                          variant="outline"
                          className="border-accent/30 text-accent text-sm px-3 py-1"
                        >
                          {s.skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Link
              href="/explore"
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium leading-none">Find peers</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover skill matches
                </p>
              </div>
            </Link>
            <Link
              href="/sessions"
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <CalendarDays className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium leading-none">My sessions</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upcoming & past swaps
                </p>
              </div>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(253,203,110,0.15)" }}
              >
                <Users className="h-5 w-5 text-accent-orange" />
              </div>
              <div>
                <p className="font-medium leading-none">Edit profile</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Update skills & info
                </p>
              </div>
            </Link>
            <Link
              href="/certificates"
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(232,67,147,0.1)" }}
              >
                <Award className="h-5 w-5 text-accent-pink" />
              </div>
              <div>
                <p className="font-medium leading-none">Certificates</p>
                <p className="text-sm text-muted-foreground mt-1">
                  View your achievements
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {totalSessions === 0 ? (
              <p className="text-muted-foreground">
                No activity yet. Start by exploring skills and booking a
                session!
              </p>
            ) : (
              <div className="space-y-3">
                {user?.sessionsAsTeacher.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                    <p className="text-muted-foreground">
                      Teaching session ·{" "}
                      <span className="text-foreground font-medium">
                        {s.status.toLowerCase()}
                      </span>
                    </p>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {user?.sessionsAsLearner.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-accent shrink-0" />
                    <p className="text-muted-foreground">
                      Learning session ·{" "}
                      <span className="text-foreground font-medium">
                        {s.status.toLowerCase()}
                      </span>
                    </p>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {[
                { done: !!user?.name, label: "Create your account" },
                {
                  done: !!(user?.university || user?.bio),
                  label: "Complete your profile",
                },
                {
                  done: teachSkills.length > 0,
                  label: "Add a skill you can teach",
                },
                {
                  done: learnSkills.length > 0,
                  label: "Add a skill you want to learn",
                },
                {
                  done: totalSessions > 0,
                  label: "Book your first swap session",
                },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${step.done ? "border-primary bg-primary" : "border-border"}`}
                  >
                    {step.done && (
                      <svg
                        className="h-3.5 w-3.5 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <p
                    className={`${step.done ? "line-through text-muted-foreground" : "font-medium"}`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
