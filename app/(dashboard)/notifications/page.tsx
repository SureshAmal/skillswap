"use client";

import { useState, useEffect } from "react";
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
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

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

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <StaggerContainer className="space-y-2">
          {notifications.map((n) => (
            <StaggerItem key={n.id}>
              <Card
                className={`transition-colors ${n.read ? "opacity-60" : "border-primary/20"}`}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    {iconForType(n.type)}
                  </div>
                  <div className="flex-1">
                    <p
                      className={
                        n.read ? "text-muted-foreground" : "font-medium"
                      }
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
                    <span className="h-3 w-3 rounded-full bg-primary shrink-0" />
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
