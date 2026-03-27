"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, GraduationCap, BookOpen } from "lucide-react";

type ExploreUser = {
  id: string;
  name: string;
  university: string | null;
  major: string | null;
  skills: { type: string; skill: { name: string; category: string } }[];
};

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
      setLoading(false);
    };
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
        <p className="text-muted-foreground">Find peers and discover new skills</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, skill, or university..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-40" />
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const teachSkills = user.skills.filter((s) => s.type === "TEACH");
            const learnSkills = user.skills.filter((s) => s.type === "LEARN");
            const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

            return (
              <Card key={user.id} className="hover:border-foreground/20 transition-colors">
                <CardHeader className="flex flex-row items-center gap-3 pb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm">{user.name}</CardTitle>
                    {user.university && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <GraduationCap className="h-3 w-3" />
                        {user.university}{user.major ? ` · ${user.major}` : ""}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teachSkills.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> Can teach
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {teachSkills.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{s.skill.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {learnSkills.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Wants to learn</p>
                      <div className="flex flex-wrap gap-1.5">
                        {learnSkills.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{s.skill.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
