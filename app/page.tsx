"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Award, Clock, MessageCircle, RefreshCcw, Users, Zap, BookOpen, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <RefreshCcw className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SkillSwap</span>
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
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          100% free for university students
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Learn anything.<br />
          <span className="text-primary">Teach anything.</span><br />
          No money needed.
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Swap skills with fellow students — you teach what you know, learn what you need, and earn Time Credits along the way.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register" className={buttonVariants({ size: "lg", className: "text-base px-6 py-3 h-auto" })}>
            Start Swapping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link href="/explore" className={buttonVariants({ variant: "outline", size: "lg", className: "text-base px-6 py-3 h-auto" })}>
            Browse Skills
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-center mb-2">How it works</h2>
          <p className="text-center text-muted-foreground mb-12">Three simple steps to start swapping</p>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center border-2 border-transparent hover:border-primary/20 transition-colors">
              <CardContent className="pt-8 pb-6 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <span className="inline-block text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">Step 1</span>
                <h3 className="font-bold text-lg">List Your Skills</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us what you can teach (guitar? calculus? cooking?) and what you want to learn.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-primary/20 transition-colors">
              <CardContent className="pt-8 pb-6 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <span className="inline-block text-xs font-bold text-accent bg-accent/10 rounded-full px-2 py-0.5">Step 2</span>
                <h3 className="font-bold text-lg">Find Your Match</h3>
                <p className="text-sm text-muted-foreground">
                  Browse peers, find someone who teaches what you need & wants what you know.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-primary/20 transition-colors">
              <CardContent className="pt-8 pb-6 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(253,203,110,0.15)" }}>
                  <Zap className="h-7 w-7 text-accent-orange" />
                </div>
                <span className="inline-block text-xs font-bold text-accent-orange rounded-full px-2 py-0.5" style={{ background: "rgba(253,203,110,0.15)" }}>Step 3</span>
                <h3 className="font-bold text-lg">Swap & Earn</h3>
                <p className="text-sm text-muted-foreground">
                  Meet up (online or IRL), teach each other, and earn Time Credits + certificates!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">University Peers</h3>
              <p className="text-xs text-muted-foreground">Connect with students at your campus</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-sm">Time Credits</h3>
              <p className="text-xs text-muted-foreground">Teach 1 hour, learn 1 hour — fair and simple</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(253,203,110,0.15)" }}>
                <Award className="h-6 w-6 text-accent-orange" />
              </div>
              <h3 className="font-semibold text-sm">Certificates</h3>
              <p className="text-xs text-muted-foreground">Get verified badges for your skills</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(232,67,147,0.1)" }}>
                <MessageCircle className="h-6 w-6 text-accent-pink" />
              </div>
              <h3 className="font-semibold text-sm">In-app Chat</h3>
              <p className="text-xs text-muted-foreground">Message your swap partners directly</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to start swapping?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">Join thousands of students already sharing skills on SkillSwap.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-primary font-bold rounded-xl px-6 py-3 hover:bg-white/90 transition-colors">
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
