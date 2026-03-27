"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Plus, X, Upload, User, GraduationCap, BookOpen, Palette } from "lucide-react";
import { FadeIn } from "@/components/motion";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", bio: "", university: "", major: "", avatarUrl: "" });
  const [newSkill, setNewSkill] = useState({ name: "", type: "TEACH", level: "Intermediate", hasCert: false, certTitle: "", certIssuer: "" });
  const [skills, setSkills] = useState<{ id: string; type: string; level: string; skill: { name: string } }[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile({ name: data.user.name, bio: data.user.bio || "", university: data.user.university || "", major: data.user.major || "", avatarUrl: data.user.avatarUrl || "" });
          setSkills(data.user.skills || []);
        }
      });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark");
    setTheme(newTheme);
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) setMessage("Profile saved successfully!");
    else setMessage("Error saving profile");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) return;

    const payload: any = {
      name: newSkill.name,
      type: newSkill.type,
      level: newSkill.level,
    };

    if (newSkill.type === "TEACH" && newSkill.hasCert && newSkill.certTitle && newSkill.certIssuer) {
      payload.certificate = {
        title: newSkill.certTitle,
        issuer: newSkill.certIssuer,
      };
    }

    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      setSkills([...skills, data.userSkill]);
      setNewSkill({ name: "", type: "TEACH", level: "Intermediate", hasCert: false, certTitle: "", certIssuer: "" });
      // Reset the upload button if present
      const btn = document.getElementById("cert-upload-btn");
      if (btn) {
        btn.innerText = "Attach File";
        btn.classList.remove("text-emerald-500", "border-emerald-500", "bg-emerald-50", "dark:bg-emerald-950");
      }
    }
  };

  const removeSkill = async (id: string) => {
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    setSkills(skills.filter((s) => s.id !== id));
  };

  const teachSkills = skills.filter((s) => s.type === "TEACH");
  const learnSkills = skills.filter((s) => s.type === "LEARN");

  return (
    <div className="space-y-5">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, skills, and preferences</p>
        </div>
      </FadeIn>

      {/* Two-column grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left column: Profile + Avatar */}
        <div className="space-y-5">
          <FadeIn delay={0.05}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Profile Info
                </CardTitle>
                <CardDescription>This is what other students see when they find you</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-xs">Full Name</Label>
                  <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="bio" className="text-xs">Bio</Label>
                  <Input id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="CS major who loves building web apps..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="university" className="text-xs flex items-center gap-1"><GraduationCap className="h-3 w-3" /> University</Label>
                    <Input id="university" value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="major" className="text-xs flex items-center gap-1"><BookOpen className="h-3 w-3" /> Major</Label>
                    <Input id="major" value={profile.major} onChange={(e) => setProfile({ ...profile, major: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Button onClick={saveProfile} disabled={saving} size="sm">
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  {message && <p className="text-xs text-muted-foreground">{message}</p>}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Avatar + Appearance stacked in left column */}
          <FadeIn delay={0.15}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" /> Avatar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full object-cover shrink-0 border" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {profile.name ? profile.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "?"}
                    </div>
                  )}
                  <div>
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      className="hidden" 
                      accept="image/jpeg, image/png, image/gif" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newAvatarUrl = reader.result as string;
                            setProfile({ ...profile, avatarUrl: newAvatarUrl });
                            
                            // Auto-save just the avatar
                            fetch("/api/profile", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...profile, avatarUrl: newAvatarUrl }),
                            });

                            const btn = document.getElementById("upload-btn");
                            if (btn) {
                              btn.innerText = "Uploaded ✓";
                              btn.classList.add("text-emerald-500", "border-emerald-500");
                              setTimeout(() => {
                                btn.innerText = "Upload Image";
                                btn.classList.remove("text-emerald-500", "border-emerald-500");
                              }, 2000);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById("avatar-upload")?.click()}
                      id="upload-btn"
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Image
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" style={{ color: "#e84393" }} /> Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme === "dark" ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        theme === "dark" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Right column: Skills */}
        <FadeIn delay={0.1}>
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" /> My Skills
              </CardTitle>
              <CardDescription>What can you teach? What do you want to learn?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teaching */}
              {teachSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Teaching</p>
                  <div className="space-y-1.5">
                    {teachSkills.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">{s.skill.name}</Badge>
                          <span className="text-xs text-muted-foreground">{s.level}</span>
                        </div>
                        <button onClick={() => removeSkill(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning */}
              {learnSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wider">Learning</p>
                  <div className="space-y-1.5">
                    {learnSkills.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-accent/30 text-accent">{s.skill.name}</Badge>
                          <span className="text-xs text-muted-foreground">{s.level}</span>
                        </div>
                        <button onClick={() => removeSkill(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills.length === 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">No skills yet — add your first one below.</p>
                </div>
              )}

              <Separator />

              {/* Add Skill */}
              <div>
                <p className="text-sm font-medium mb-2">Add a new skill</p>
                <div className="grid gap-2">
                  <div>
                    <Label className="text-xs">Skill Name</Label>
                    <Input value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="React, Guitar, French..." />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <select
                        value={newSkill.type}
                        onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value })}
                        className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                      >
                        <option value="TEACH">Teach</option>
                        <option value="LEARN">Learn</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Level</Label>
                      <select
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                        className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Expert</option>
                      </select>
                    </div>
                  </div>

                  {/* Certification opt-in for TEACH skills */}
                  {newSkill.type === "TEACH" && (
                    <div className="mt-2 space-y-2 border rounded-lg p-3 bg-muted/40 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-semibold">Add Certification (Optional)</Label>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Showcase your formal expertise to learners</p>
                        </div>
                        <button 
                          onClick={() => setNewSkill({ ...newSkill, hasCert: !newSkill.hasCert })}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors shrink-0 ${newSkill.hasCert ? "bg-primary" : "bg-muted-foreground/30"}`}
                        >
                          <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${newSkill.hasCert ? "translate-x-4" : "translate-x-1"}`} />
                        </button>
                      </div>
                      
                      {newSkill.hasCert && (
                        <div className="space-y-2.5 pt-2 border-t mt-2 animate-in fade-in slide-in-from-top-1">
                          <div>
                            <Label className="text-xs">Certificate Title</Label>
                            <Input 
                              value={newSkill.certTitle} 
                              onChange={(e) => setNewSkill({ ...newSkill, certTitle: e.target.value })} 
                              placeholder="e.g. Meta Front-End Developer" 
                              className="h-8 text-xs mt-1" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Issuing Organization</Label>
                            <Input 
                              value={newSkill.certIssuer} 
                              onChange={(e) => setNewSkill({ ...newSkill, certIssuer: e.target.value })} 
                              placeholder="e.g. Coursera" 
                              className="h-8 text-xs mt-1" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Upload Document (PDF/Image)</Label>
                            <input 
                              type="file" 
                              id="cert-upload" 
                              className="hidden" 
                              accept=".pdf,image/jpeg,image/png" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const btn = document.getElementById("cert-upload-btn");
                                  if (btn) {
                                    btn.innerHTML = 'Attached ✓';
                                    btn.classList.add("text-emerald-500", "border-emerald-500", "bg-emerald-50", "dark:bg-emerald-950");
                                  }
                                }
                              }}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs h-8 border-dashed"
                              onClick={() => document.getElementById("cert-upload")?.click()}
                              id="cert-upload-btn"
                            >
                              <Upload className="h-3 w-3 mr-1.5" /> Attach File
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button onClick={addSkill} size="sm" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Add Skill
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
