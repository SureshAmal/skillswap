"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  MessageCircle,
  CalendarDays,
  Award,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerItem } from "@/components/motion";

// Virtualization & Measurement
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTextMeasurement } from "@/hooks/useTextMeasurement";

type Notification = {
  id: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Virtualizer refs and measurement
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const { isReady, measureTextHeight } = useTextMeasurement("16px Inter, system-ui, sans-serif");

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setCursor(data.nextCursor);
        setHasNextPage(!!data.nextCursor);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const res = await fetch(`/api/notifications?cursor=${cursor}`);
    if (res.ok) {
      const data = await res.json();
      setNotifications((prev) => [...prev, ...data.notifications]);
      setCursor(data.nextCursor);
      setHasNextPage(!!data.nextCursor);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    if (!observerRef.current || !hasNextPage || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, cursor]);

  // Track parent width precisely for pretext measurements
  useEffect(() => {
    if (!parentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(parentRef.current);
    setContainerWidth(parentRef.current.offsetWidth);
    return () => observer.disconnect();
  }, [loading]);

  const rowVirtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      if (!isReady || containerWidth === 0) return 96; // 96px fallback
      const n = notifications[index];
      // Text container width roughly = full width - padding(32px) - icon(40px) - gap(16px) - extra scrollbar buffer(20px) = 108px deduction
      const textWidth = Math.max(containerWidth - 108, 100);
      const textHeight = measureTextHeight(n.content, textWidth, 24);
      // Height structure:
      // padding: py-4 (32px)
      // timestamp: text-sm (20px) + mt-0.5 (2px)
      // bottom spatial gap between virtual elements: 8px
      return textHeight + 32 + 22 + 8;
    },
    overscan: 10,
  });

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const iconForType = (type: string) => {
    switch (type) {
      case "MESSAGE":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "SESSION_REQUEST":
        return <CalendarDays className="h-5 w-5 text-accent" />;
      case "CERTIFICATE_VERIFIED":
        return <Award className="h-5 w-5" style={{ color: "#fdcb6e" }} />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated on your activity
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                  {unreadCount} new
                </span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-20" />
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="text-center py-20">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="font-semibold text-lg mb-1">All caught up</p>
              <p className="text-muted-foreground">
                No notifications yet. We&apos;ll let you know when something
                happens!
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <div 
          ref={parentRef} 
          className="h-[calc(100vh-200px)] min-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const n = notifications[virtualRow.index];
              return (
                <div
                  key={n.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: "8px",
                  }}
                >
                  <StaggerItem>
                    <Card
                      className={`transition-colors h-full ${
                        n.read ? "opacity-60" : "border-primary/20"
                      }`}
                    >
                      <CardContent className="flex gap-4 py-4">
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          {iconForType(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`break-words ${
                              n.read ? "text-muted-foreground" : "font-medium"
                            }`}
                          >
                            {n.content}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString()} at{" "}
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="flex items-center justify-center pt-2">
                             <span className="h-3 w-3 rounded-full bg-primary shrink-0" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </StaggerItem>
                </div>
              );
            })}
          </div>
          {/* Infinite Scroll Trigger */}
          {hasNextPage && (
            <div ref={observerRef} className="w-full flex justify-center py-4">
              <span className="text-sm text-muted-foreground animate-pulse">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
