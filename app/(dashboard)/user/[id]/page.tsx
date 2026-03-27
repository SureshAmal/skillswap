"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, BookOpen, Award, Clock, MessageCircle,
  ArrowLeft, CheckCircle, CalendarDays, Star
} from "lucide-react";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  university: string | null;
  major: string | null;
  credits: number;
  avatarUrl: string | null;
  createdAt: string;
  completedSessionsCount: number;
  skills: { id: string; type: string; level: string; skill: { name: string; category: string } }[];
  certificates: { id: string; title: string; issuer: string; verified: boolean; skill: { name: string } }[];
};

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="animate-pulse"><CardContent className="h-64" /></Card>
          <Card className="lg:col-span-2 animate-pulse"><CardContent className="h-64" /></Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium">User not found</p>
        <Link href="/explore" className="text-primary hover:underline text-sm mt-2 inline-block">
          Back to Explore
        </Link>
      </div>
    );
  }

  const teachSkills = user.skills.filter((s) => s.type === "TEACH");
  const learnSkills = user.skills.filter((s) => s.type === "LEARN");
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <FadeIn>
        <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile sidebar */}
        <FadeIn delay={0.05}>
          <Card>
            <CardContent className="pt-8 pb-6">
              <div className="flex flex-col items-center text-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-24 w-24 mb-4 rounded-full object-cover border-4 border-primary/20" />
                ) : (
                  <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <h2 className="text-xl font-bold">{user.name}</h2>
                {user.university && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <GraduationCap className="h-4 w-4" />
                    {user.university}{user.major ? ` · ${user.major}` : ""}
                  </p>
                )}
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{user.bio}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 w-full mt-5 pt-5 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold">{teachSkills.length}</p>
                    <p className="text-xs text-muted-foreground">Teaching</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{user.completedSessionsCount}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{user.certificates.length}</p>
                    <p className="text-xs text-muted-foreground">Certs</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" /> Member since {memberSince}
                </div>

                {/* Message button */}
                <Link href={`/messages?user=${user.id}&name=${encodeURIComponent(user.name)}`} className="w-full mt-5">
                  <Button className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Right column: Skills + Certificates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teachSkills.length === 0 && learnSkills.length === 0 ? (
                  <p className="text-muted-foreground">This user hasn&apos;t listed any skills yet.</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {teachSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">Can Teach</p>
                        <div className="space-y-2">
                          {teachSkills.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                              <span className="font-medium text-sm">{s.skill.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary/10 text-primary border-0 text-xs">{s.level}</Badge>
                                <span className="text-xs text-muted-foreground">{s.skill.category}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {learnSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-accent mb-3 uppercase tracking-wider">Wants to Learn</p>
                        <div className="space-y-2">
                          {learnSkills.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                              <span className="font-medium text-sm">{s.skill.name}</span>
                              <Badge variant="outline" className="border-accent/30 text-accent text-xs">{s.level}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Certificates */}
          <FadeIn delay={0.15}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" style={{ color: "#fdcb6e" }} /> Certificates
                </CardTitle>
                <CardDescription>Verified skill certifications</CardDescription>
              </CardHeader>
              <CardContent>
                {user.certificates.length === 0 ? (
                  <p className="text-muted-foreground">No certificates yet.</p>
                ) : (
                  <StaggerContainer className="space-y-2">
                    {user.certificates.map((c) => (
                      <StaggerItem key={c.id}>
                        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(253,203,110,0.15)" }}>
                              <Award className="h-4 w-4 text-accent-orange" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{c.title}</p>
                              <p className="text-xs text-muted-foreground">{c.issuer} · {c.skill.name}</p>
                            </div>
                          </div>
                          <Badge
                            className={c.verified
                              ? "bg-emerald-50 text-emerald-600 border-0 text-xs"
                              : "text-xs"
                            }
                            variant={c.verified ? "secondary" : "outline"}
                          >
                            {c.verified && <CheckCircle className="h-3 w-3 mr-1" />}
                            {c.verified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Availability / Additional Info */}
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" /> Swap with {user.name.split(" ")[0]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <p className="font-medium text-sm">Time Credits</p>
                    </div>
                    <p className="text-2xl font-bold">{user.credits}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Available credits for learning</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <p className="font-medium text-sm">Completed Sessions</p>
                    </div>
                    <p className="text-2xl font-bold">{user.completedSessionsCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Successful skill swaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
