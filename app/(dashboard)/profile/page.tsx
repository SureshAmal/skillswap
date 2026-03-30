import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Award,
  Clock,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      skills: { include: { skill: true } },
      certificates: { include: { skill: true } },
    },
  });

  if (!user) return null;

  const teachSkills = user.skills.filter((s) => s.type === "TEACH");
  const learnSkills = user.skills.filter((s) => s.type === "LEARN");
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Your public profile</p>
        </div>
        <Link
          href="/settings"
          className="text-sm text-primary hover:underline flex items-center gap-0.5"
        >
          Edit Profile <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: Profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage
                  src={user.avatarUrl || undefined}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.university && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {user.university}
                  {user.major ? ` · ${user.major}` : ""}
                </p>
              )}
              {user.bio && (
                <p className="text-sm mt-3 text-muted-foreground">{user.bio}</p>
              )}
              <div className="flex items-center gap-1.5 mt-3 text-sm rounded-lg bg-primary/10 text-primary px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">{user.credits} Time Credits</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Skills + Certificates */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Skills I Teach
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teachSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No teaching skills added
                  </p>
                ) : (
                  <div className="space-y-2">
                    {teachSkills.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{s.skill.name}</span>
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">
                          {s.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-accent" /> Skills I Want to
                  Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {learnSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No learning skills added
                  </p>
                ) : (
                  <div className="space-y-2">
                    {learnSkills.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{s.skill.name}</span>
                        <Badge
                          variant="outline"
                          className="text-xs border-accent/30 text-accent"
                        >
                          {s.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" style={{ color: "#fdcb6e" }} />{" "}
                Certificates
              </CardTitle>
              <CardDescription>Verified skill certifications</CardDescription>
            </CardHeader>
            <CardContent>
              {user.certificates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No certificates yet. Complete sessions to earn them!
                </p>
              ) : (
                <div className="space-y-2">
                  {user.certificates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{c.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.issuer} · {c.skill.name}
                        </p>
                      </div>
                      <Badge
                        variant={c.verified ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {c.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
