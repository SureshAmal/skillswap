"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
  skills: { id: string; type: string; level: string; skill: { id: string; name: string; category: string } }[];
  certificates: { id: string; title: string; issuer: string; verified: boolean; skill: { name: string } }[];
};

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleBookSession = async () => {
    if (!selectedSkillId || !scheduledAt || !user) return;
    setBookingStatus("loading");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.id,
          skillId: selectedSkillId,
          scheduledAt: new Date(scheduledAt).toISOString(),
        })
      });
      if (res.ok) {
        setBookingStatus("success");
        setTimeout(() => setBookingOpen(false), 2000);
      } else {
        setBookingStatus("error");
      }
    } catch {
      setBookingStatus("error");
    }
  };

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

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 w-full mt-5">
                  <Link href={`/messages?user=${user.id}&name=${encodeURIComponent(user.name)}`} className="w-full">
                    <Button variant="outline" className="w-full h-9">
                      <MessageCircle className="mr-2 h-4 w-4" /> Message
                    </Button>
                  </Link>
                  <Button onClick={() => setBookingOpen(true)} className="w-full h-9 bg-primary/20 hover:bg-primary/30 text-primary hover:text-primary border-0">
                    <CalendarDays className="mr-2 h-4 w-4" /> Book Swap
                  </Button>
                </div>
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
      {/* Booking Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <FadeIn className="w-full max-w-md">
            <Card className="shadow-2xl border-primary/20">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-xl">Book Session with {user.name}</CardTitle>
                <CardDescription>Select a skill you want to learn and propose a time.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {bookingStatus === "success" ? (
                  <div className="py-6 text-center space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4 scale-in-center">
                      <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">Swap Requested!</p>
                    <p className="text-sm text-muted-foreground">They have been notified and will review your request soon.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Skill</label>
                      <select 
                        value={selectedSkillId} 
                        onChange={(e) => setSelectedSkillId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="" disabled>Choose a skill they teach...</option>
                        {teachSkills.map(s => (
                          <option key={s.skill.id} value={s.skill.id}>{s.skill.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Proposed Date & Time</label>
                      <div className="relative">
                        <Input 
                          type="datetime-local" 
                          value={scheduledAt}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledAt(e.target.value)}
                          className="w-full pl-9"
                        />
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    {bookingStatus === "error" && (
                      <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded text-center">Something went wrong. Please try again.</p>
                    )}

                    <div className="flex justify-end gap-2 pt-4 mt-2">
                      <Button variant="ghost" onClick={() => setBookingOpen(false)}>Cancel</Button>
                      <Button onClick={handleBookSession} disabled={!selectedSkillId || !scheduledAt || bookingStatus === "loading"}>
                        {bookingStatus === "loading" ? "Scheduling..." : "Send Request"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
