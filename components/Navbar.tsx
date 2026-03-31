"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  MessageCircle,
  Bell,
  User,
  RefreshCcw,
  Menu,
  X,
  LogOut,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { title: "Overview", href: "/overview", icon: LayoutDashboard },
  { title: "Explore", href: "/explore", icon: Search },
  { title: "Sessions", href: "/sessions", icon: CalendarDays },
  { title: "Messages", href: "/messages", icon: MessageCircle },
];

const rightLinks = [
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark");
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <RefreshCcw className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SkillSwap</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <link.icon className="h-[18px] w-[18px]" />
                {link.title}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {rightLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-lg transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
                title={link.title}
              >
                <link.icon className="h-[18px] w-[18px]" />
              </Link>
            ))}

            <span className="w-px h-5 bg-border mx-1" />

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {[...navLinks, ...rightLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <link.icon className="h-[18px] w-[18px]" />
                {link.title}
              </Link>
            ))}

            <div className="my-2 border-t border-border mx-4" />

            <button
              onClick={() => {
                toggleTheme();
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
