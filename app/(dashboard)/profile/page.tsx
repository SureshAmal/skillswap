import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Award, Clock, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Your public profile</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.university && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {user.university}{user.major ? ` · ${user.major}` : ""}
                </p>
              )}
              {user.bio && <p className="text-sm mt-2">{user.bio}</p>}
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{user.credits} Time Credits</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Skills I Teach
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teachSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teaching skills added</p>
            ) : (
              <div className="space-y-2">
                {teachSkills.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-sm">{s.skill.name}</span>
                    <Badge variant="secondary" className="text-xs">{s.level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Skills I Want to Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learnSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No learning skills added</p>
            ) : (
              <div className="space-y-2">
                {learnSkills.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-sm">{s.skill.name}</span>
                    <Badge variant="outline" className="text-xs">{s.level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4" /> Certificates
          </CardTitle>
          <CardDescription>Verified skill certifications</CardDescription>
        </CardHeader>
        <CardContent>
          {user.certificates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No certificates yet</p>
          ) : (
            <div className="space-y-2">
              {user.certificates.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.issuer} · {c.skill.name}</p>
                  </div>
                  <Badge variant={c.verified ? "secondary" : "outline"} className="text-xs">
                    {c.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
