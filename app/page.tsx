"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Award, Clock, MessageCircle, RefreshCcw, Users, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <RefreshCcw className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">SkillSwap</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Log in
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Share skills. Learn from peers.
          <br />
          <span className="text-muted-foreground">Earn Time Credits.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          The peer-to-peer platform where university students teach what they know
          and learn what they need — no money required.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/explore" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Explore Skills
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-semibold text-center mb-2">How it works</h2>
          <p className="text-center text-muted-foreground mb-12">Everything you need to start skill swapping</p>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">Find Peers</h3>
                <p className="text-sm text-muted-foreground">
                  Search for students at your university who have the skills you want to learn.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">Swap Skills</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule 1-on-1 sessions. Teach what you know, learn what you need.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">Earn & Grow</h3>
                <p className="text-sm text-muted-foreground">
                  Collect Time Credits and certificates as you teach. Build your verified skill profile.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">University Peers</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Verified Certificates</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time Credits</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">In-app Messaging</span>
          </div>
        </div>
      </section>
    </main>
  );
}
