"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, GraduationCap, BookOpen, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import Link from "next/link";

type ExploreUser = {
  id: string;
  name: string;
  university: string | null;
  major: string | null;
  avatarUrl: string | null;
  skills: { type: string; skill: { name: string; category: string } }[];
};

const categories = ["All", "Programming", "Design", "Music", "Languages", "Math", "Science", "Business"];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const res = await fetch(`/api/users?q=${encodeURIComponent(query)}&category=${encodeURIComponent(activeCategory)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
      setLoading(false);
    };
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query, activeCategory]);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Skills</h1>
          <p className="text-muted-foreground mt-1">Find peers who teach what you want to learn</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
          <Input
            placeholder="Search by name, skill, or university..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 text-base"
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-52" />
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <FadeIn>
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold text-lg mb-1">No matches found</p>
            <p className="text-muted-foreground">Try a different search term or browse all categories.</p>
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const teachSkills = user.skills.filter((s) => s.type === "TEACH");
            const learnSkills = user.skills.filter((s) => s.type === "LEARN");
            const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

            return (
              <StaggerItem key={user.id}>
                <Link href={`/user/${user.id}`}>
                  <Card className="hover:border-primary/30 transition-all hover:shadow-md cursor-pointer group h-full">
                    <CardHeader className="flex flex-row items-center gap-3 pb-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20 shrink-0">
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{user.name}</CardTitle>
                        {user.university && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {user.university}{user.major ? ` · ${user.major}` : ""}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {teachSkills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1 font-medium">
                            <BookOpen className="h-3.5 w-3.5" /> Can teach
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {teachSkills.slice(0, 4).map((s, i) => (
                              <Badge key={i} className="bg-primary/10 text-primary border-0 text-xs">{s.skill.name}</Badge>
                            ))}
                            {teachSkills.length > 4 && (
                              <Badge variant="outline" className="text-xs">+{teachSkills.length - 4}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {learnSkills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Wants to learn</p>
                          <div className="flex flex-wrap gap-1.5">
                            {learnSkills.slice(0, 4).map((s, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-accent/30 text-accent">{s.skill.name}</Badge>
                            ))}
                            {learnSkills.length > 4 && (
                              <Badge variant="outline" className="text-xs">+{learnSkills.length - 4}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {teachSkills.length === 0 && learnSkills.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No skills listed yet</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
