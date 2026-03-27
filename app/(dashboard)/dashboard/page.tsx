import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Search, TrendingUp, Users, Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const linkBtn = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground";
const linkBtnPrimary = "inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-2.5 h-7 text-[0.8rem] font-medium whitespace-nowrap transition-all";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name ?? session.email}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Credits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.credits ?? 0}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Skills Teaching</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachSkills.length}</div>
            <p className="text-xs text-muted-foreground">Active skills offered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Skills Learning</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learnSkills.length}</div>
            <p className="text-xs text-muted-foreground">Skills you want</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Earned so far</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Skills</CardTitle>
            <CardDescription>Skills you teach and want to learn</CardDescription>
          </CardHeader>
          <CardContent>
            {teachSkills.length === 0 && learnSkills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  You haven&apos;t added any skills yet
                </p>
                <Link href="/settings" className={linkBtnPrimary}>
                  Add Skills
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {teachSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Teaching</p>
                    <div className="flex flex-wrap gap-2">
                      {teachSkills.map((s) => (
                        <Badge key={s.id} variant="secondary">{s.skill.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {learnSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Learning</p>
                    <div className="flex flex-wrap gap-2">
                      {learnSkills.map((s) => (
                        <Badge key={s.id} variant="outline">{s.skill.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with SkillSwap</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/explore" className={cn(linkBtn, "justify-start")}>
              <Search className="mr-2 h-4 w-4" />
              Find peers to swap with
            </Link>
            <Link href="/sessions" className={cn(linkBtn, "justify-start")}>
              <CalendarDays className="mr-2 h-4 w-4" />
              View your sessions
            </Link>
            <Link href="/settings" className={cn(linkBtn, "justify-start")}>
              <Users className="mr-2 h-4 w-4" />
              Complete your profile
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
