"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { FadeIn } from "@/components/motion";

type Conversation = {
  userId: string;
  name: string;
  lastMessage: string;
  unread: number;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
};

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const preselectedUser = searchParams.get("user");
  const preselectedName = searchParams.get("name");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(preselectedUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages/conversations")
      .then((r) => r.json())
      .then((data) => {
        let convos: Conversation[] = data.conversations || [];
        // If we have a preselected user not in existing conversations, add them
        if (preselectedUser && preselectedName && !convos.find((c) => c.userId === preselectedUser)) {
          convos = [{ userId: preselectedUser, name: preselectedName, lastMessage: "", unread: 0 }, ...convos];
        }
        setConversations(convos);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [preselectedUser, preselectedName]);

  useEffect(() => {
    if (!selectedUser) return;
    fetch(`/api/messages?userId=${selectedUser}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(() => {});
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selectedUser, content: newMessage }),
    });
    setNewMessage("");
    const res = await fetch(`/api/messages?userId=${selectedUser}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const selectedConversation = conversations.find((c) => c.userId === selectedUser);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Chat with your peers</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-240px)] min-h-[500px]">
          {/* Conversations List */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <MessageCircle className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-medium mb-1">No conversations yet</p>
                  <p className="text-sm text-muted-foreground">Visit someone&apos;s profile to start chatting!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => {
                    const initials = conv.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                    return (
                      <button
                        key={conv.userId}
                        onClick={() => setSelectedUser(conv.userId)}
                        className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${
                          selectedUser === conv.userId ? "bg-muted" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{conv.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage || "No messages yet"}</p>
                        </div>
                        {conv.unread > 0 && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {conv.unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <CardHeader className="pb-3 border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedUser(null)} className="md:hidden text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {selectedConversation?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-base">{selectedConversation?.name ?? "Chat"}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No messages yet. Say hello!</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === selectedUser ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[75%] ${
                          msg.senderId === selectedUser
                            ? "bg-muted"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.senderId === selectedUser ? "text-muted-foreground" : "text-primary-foreground/60"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </CardContent>
                <div className="p-4 border-t flex gap-3 shrink-0">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="h-11 text-base"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="icon" className="h-11 w-11 shrink-0">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-lg mb-1">Select a conversation</p>
                  <p className="text-muted-foreground">Pick someone from the left to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
