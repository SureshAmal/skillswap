"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Plus, X, Upload } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", bio: "", university: "", major: "" });
  const [newSkill, setNewSkill] = useState({ name: "", type: "TEACH", level: "Intermediate" });
  const [skills, setSkills] = useState<{ id: string; type: string; level: string; skill: { name: string } }[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile({ name: data.user.name, bio: data.user.bio || "", university: data.user.university || "", major: data.user.major || "" });
          setSkills(data.user.skills || []);
        }
      });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) setMessage("Profile saved!");
    else setMessage("Error saving profile");
    setSaving(false);
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) return;
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSkill),
    });
    if (res.ok) {
      const data = await res.json();
      setSkills([...skills, data.userSkill]);
      setNewSkill({ name: "", type: "TEACH", level: "Intermediate" });
    }
  };

  const removeSkill = async (id: string) => {
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    setSkills(skills.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your public profile information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell others about yourself..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="university">University</Label>
              <Input id="university" value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="major">Major</Label>
              <Input id="major" value={profile.major} onChange={(e) => setProfile({ ...profile, major: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Manage skills you teach and want to learn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Skills */}
          {skills.length > 0 && (
            <div className="space-y-2">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={s.type === "TEACH" ? "secondary" : "outline"} className="text-xs">{s.type}</Badge>
                    <span className="text-sm">{s.skill.name}</span>
                    <span className="text-xs text-muted-foreground">· {s.level}</span>
                  </div>
                  <Button variant="ghost" size="icon-xs" onClick={() => removeSkill(s.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Skill */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">Skill Name</Label>
              <Input value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="e.g., React, Python, Guitar" />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <select
                value={newSkill.type}
                onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value })}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
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
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
            <Button onClick={addSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Upload a profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
