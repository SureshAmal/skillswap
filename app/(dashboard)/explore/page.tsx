"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { FadeIn, StaggerItem, StaggerContainer } from "@/components/motion";
import Link from "next/link";

// Text Measurement
import { useTextMeasurement } from "@/hooks/useTextMeasurement";

type ExploreUser = {
  id: string;
  name: string;
  bio: string | null;
  university: string | null;
  major: string | null;
  avatarUrl: string | null;
  credits: number;
  skills: { type: string; skill: { name: string; category: string } }[];
  matchingSkills: string[];
};

const defaultCategories = [
  "All",
  "Programming",
  "Design",
  "Music",
  "Languages",
  "Math",
  "Science",
  "Business",
];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Data and Pagination state
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [categories, setCategories] = useState<string[]>(defaultCategories);

  // Measurement and layout refs
  const parentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  
  const [containerWidth, setContainerWidth] = useState(0);
  const [columns, setColumns] = useState(3);
  
  const { isReady, measureTextHeight } = useTextMeasurement(
    "14px Inter, system-ui, sans-serif"
  ); // text-sm for bio

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Initial Fetch Effect
  useEffect(() => {
    let active = true;
    const fetchUsers = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/users?q=${encodeURIComponent(query)}&category=${encodeURIComponent(
          activeCategory
        )}&limit=20`
      );
      if (res.ok && active) {
        const data = await res.json();
        setUsers(data.users);
        setCursor(data.nextCursor);
        setHasNextPage(!!data.nextCursor);
      }
      if (active) setLoading(false);
    };
    const debounce = setTimeout(fetchUsers, 300);
    return () => { active = false; clearTimeout(debounce); };
  }, [query, activeCategory]);

  // Load More logic
  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const res = await fetch(
      `/api/users?q=${encodeURIComponent(query)}&category=${encodeURIComponent(
        activeCategory
      )}&limit=20&cursor=${cursor}`
    );
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => [...prev, ...data.users]);
      setCursor(data.nextCursor);
      setHasNextPage(!!data.nextCursor);
    }
    setLoadingMore(false);
  }, [cursor, loadingMore, query, activeCategory]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!observerRef.current || !hasNextPage || loadingMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, loadMore]);

  // Layout observer
  useEffect(() => {
    if (!parentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setContainerWidth(width);
      if (width < 768) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2); 
      } else {
        setColumns(3);
      }
    });
    observer.observe(parentRef.current);
    
    const initialWidth = parentRef.current.offsetWidth;
    setContainerWidth(initialWidth);
    if (initialWidth < 768) setColumns(1);
    else if (initialWidth < 1024) setColumns(2);
    else setColumns(3);

    return () => observer.disconnect();
  }, [loading, users.length]);

  // Dynamically calculate heights using Pretext and distribute cards evenly into Masonry columns
  const masonryColumns = useMemo(() => {
    if (users.length === 0) return [];
    
    const cols: ExploreUser[][] = Array.from({ length: columns }, () => []);
    const colHeights = Array(columns).fill(0);
    
    users.forEach(user => {
      let minColIndex = 0;
      let minHeight = colHeights[0];
      for (let i = 1; i < columns; i++) {
        if (colHeights[i] < minHeight) {
          minHeight = colHeights[i];
          minColIndex = i;
        }
      }
      
      const textWidth = Math.max((containerWidth / columns) - 64, 100);
      const bioHeight = (user.bio && isReady && containerWidth > 0) 
                         ? measureTextHeight(user.bio, textWidth, 20) 
                         : 20;
      
      const teachSkillsCount = user.skills.filter(s => s.type === "TEACH").length;
      const learnSkillsCount = user.skills.filter(s => s.type === "LEARN").length;
      
      let baseHeight = 110; 
      if (teachSkillsCount > 0) baseHeight += 48;
      if (learnSkillsCount > 0) baseHeight += 48;
      if (user.matchingSkills.length > 0) baseHeight += 32;

      const totalHeight = baseHeight + bioHeight + 16; 
      
      cols[minColIndex].push(user);
      colHeights[minColIndex] += totalHeight;
    });
    
    return cols;
  }, [users, columns, containerWidth, isReady, measureTextHeight]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header Area */}
      <div className="shrink-0 space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Explore Skills</h1>
            <p className="text-muted-foreground mt-1">
              Find peers who teach what you want to learn
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
            <Input
              placeholder="Search by name, bio, skill, or university..."
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
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-48" />
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
            <p className="text-muted-foreground">
              Try a different search term or browse all categories.
            </p>
          </div>
        </FadeIn>
      ) : (
        <div ref={parentRef} className="pt-4 flex flex-col gap-6">
          <StaggerContainer className="flex items-start gap-4">
            {masonryColumns.map((col, colIndex) => (
              <div 
                key={`col-${colIndex}`} 
                className="flex-1 space-y-4 flex flex-col min-w-0"
              >
                {col.map((user) => {
                  const teachSkills = user.skills.filter((s) => s.type === "TEACH");
                  const learnSkills = user.skills.filter((s) => s.type === "LEARN");
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2);

                  return (
                    <StaggerItem key={user.id}>
                      <Link href={`/user/${user.id}`} className="block w-full">
                        <Card className="hover:border-primary/30 transition-all hover:shadow-md cursor-pointer group h-full">
                          <CardHeader className="flex flex-row items-center gap-4 pb-3">
                            <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0">
                              <AvatarImage
                                src={user.avatarUrl || undefined}
                                alt={user.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg">{user.name}</CardTitle>
                              {user.university && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {user.university}
                                    {user.major ? ` · ${user.major}` : ""}
                                  </span>
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold bg-muted px-2.5 py-1 rounded-full text-foreground pt-1">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {user.credits} <span className="hidden sm:inline">credits</span>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {user.bio && (
                              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                                {user.bio}
                              </p>
                            )}
                            
                            {user.matchingSkills.length > 0 && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-md w-fit font-medium">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                Matches your learning needs: {user.matchingSkills.join(", ")}
                              </div>
                            )}

                            <div className="flex flex-col gap-3">
                              {teachSkills.length > 0 && (
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                                    <BookOpen className="h-3.5 w-3.5" /> Can teach
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {teachSkills.slice(0, 8).map((s, i) => (
                                      <Badge
                                        key={i}
                                        className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-0"
                                      >
                                        {s.skill.name}
                                      </Badge>
                                    ))}
                                    {teachSkills.length > 8 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{teachSkills.length - 8}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {learnSkills.length > 0 && (
                                <div className="flex-1 mt-1 pt-3 border-t border-border/50">
                                  <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                                    Wants to learn
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {learnSkills.slice(0, 8).map((s, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="border-accent/30 text-accent hover:bg-accent/5 hover:border-accent/50 hover:text-accent"
                                      >
                                        {s.skill.name}
                                      </Badge>
                                    ))}
                                    {learnSkills.length > 8 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{learnSkills.length - 8}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {teachSkills.length === 0 && learnSkills.length === 0 && (
                              <p className="text-sm text-muted-foreground italic">
                                No skills listed yet
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </div>
            ))}
          </StaggerContainer>

          {/* Infinite Scroll Trigger */}
          {hasNextPage && (
            <div ref={observerRef} className="w-full flex justify-center py-6">
              {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
