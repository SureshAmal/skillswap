"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Virtualization and Measurement
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMessageMeasurement } from "@/hooks/useMessageMeasurement";

type Conversation = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  lastMessage: string;
  unread: number;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
};

export default function MessagesScreen() {
  const searchParams = useSearchParams();
  const preselectedUser = searchParams.get("user");
  const preselectedName = searchParams.get("name");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(
    preselectedUser,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const selectedUserRef = useRef(selectedUser);

  // Virtualization Setup
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const { isReady, measure } = useMessageMeasurement();

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Track parent width for accurate text boundary calculations
  useEffect(() => {
    if (!parentRef.current || !selectedUser) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(parentRef.current);
    
    // Initial measure
    setContainerWidth(parentRef.current.offsetWidth);

    return () => observer.disconnect();
  }, [selectedUser]);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      if (!isReady || containerWidth === 0) return 60; // Fallback 
      return measure(messages[index].content, containerWidth);
    },
    overscan: 10,
  });

  // A helper to scroll firmly to the bottom of the virtualized list
  const scrollToBottom = () => {
    if (messages.length > 0) {
      setTimeout(() => {
        rowVirtualizer.scrollToIndex(messages.length - 1, { align: "end" });
      }, 50);
    }
  };

  useEffect(() => {
    const fetchConvos = () => {
      fetch("/api/messages/conversations")
        .then((r) => r.json())
        .then((data) => {
          let convos: Conversation[] = data.conversations || [];
          if (
            preselectedUser &&
            preselectedName &&
            !convos.find((c) => c.userId === preselectedUser)
          ) {
            convos = [
              {
                userId: preselectedUser,
                name: preselectedName,
                avatarUrl: null,
                lastMessage: "",
                unread: 0,
              },
              ...convos,
            ];
          }
          setConversations(convos);
          setCurrentUserId(data.currentUserId);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchConvos();
    const interval = setInterval(fetchConvos, 5000);
    return () => clearInterval(interval);
  }, [preselectedUser, preselectedName]);

  useEffect(() => {
    if (!selectedUser) return;
    fetch(`/api/messages?userId=${selectedUser}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        scrollToBottom();
      })
      .catch(() => {});
  }, [selectedUser]);

  const latestMessageTimeRef = useRef<string | null>(null);
  useEffect(() => {
    latestMessageTimeRef.current = messages.length > 0 ? messages[messages.length - 1].createdAt : null;
  }, [messages]);

  // Vercel Serverless-compatible Polling Mechanism
  useEffect(() => {
    if (!selectedUser) return;
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const after = latestMessageTimeRef.current ? `&after=${latestMessageTimeRef.current}` : '';
        const r = await fetch(`/api/messages?userId=${selectedUser}${after}`);
        const data = await r.json();

        if (isMounted && data.messages && data.messages.length > 0) {
          setMessages((prev) => {
            const next = [...prev, ...data.messages];
            setTimeout(() => {
              rowVirtualizer.scrollToIndex(next.length - 1, { align: "end" });
            }, 50);
            return next;
          });

          // Refetch conversations just to update the sidebar cleanly on new messages
          fetch("/api/messages/conversations")
            .then((res) => res.json())
            .then((c) => {
              if (isMounted) setConversations(c.conversations || []);
            });
        }
      } catch {
        /* ignore error */
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(fetchLatest, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selectedUser, content: newMessage }),
    });
    setNewMessage("");
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => {
        const next = [...prev, data.message];
        // Ensure scroll to bottom on local update
        setTimeout(() => rowVirtualizer.scrollToIndex(next.length - 1, { align: "end" }), 50);
        return next;
      });

      // Update our own conversations list to reflect the last message we just explicitly sent
      setConversations((prev) => {
        const existing = prev.find((c) => c.userId === selectedUser);
        if (existing) {
          return prev.map((c) =>
            c.userId === selectedUser
              ? { ...c, lastMessage: data.message.content }
              : c,
          );
        }
        return prev;
      });
    }
  };

  const clearChat = async (userId: string) => {
    if (!confirm("Are you sure you want to clear this entire chat history?"))
      return;
    const res = await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: userId }),
    });
    if (res.ok) {
      setMessages([]);
      setConversations((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, lastMessage: "" } : c)),
      );
    }
  };

  const deleteMessage = async (msgId: string) => {
    const res = await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: msgId }),
    });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.userId === selectedUser,
  );

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
          <Card
            className={`md:col-span-1 overflow-hidden flex-col ${selectedUser ? "hidden md:flex" : "flex"}`}
          >
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <MessageCircle className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-medium mb-1">No conversations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Visit someone&apos;s profile to start chatting!
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => {
                    const initials = conv.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2);
                    return (
                      <button
                        key={conv.userId}
                        onClick={() => setSelectedUser(conv.userId)}
                        className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${
                          selectedUser === conv.userId ? "bg-muted" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={conv.avatarUrl || undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{conv.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage || "No messages yet"}
                          </p>
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
          <Card
            className={`md:col-span-2 flex-col overflow-hidden ${!selectedUser ? "hidden md:flex" : "flex"}`}
          >
            {selectedUser ? (
              <>
                <CardHeader className="pb-3 border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="md:hidden text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <Link
                        href={`/user/${selectedUser}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={selectedConversation?.avatarUrl || undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {selectedConversation?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-base">
                          {selectedConversation?.name ?? "Chat"}
                        </CardTitle>
                      </Link>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearChat(selectedUser)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* --- VIRTUALIZED CHAT CONTAINER --- */}
                <CardContent 
                  ref={parentRef}
                  className="flex-1 overflow-y-auto p-4"
                >
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        No messages yet. Say hello!
                      </p>
                    </div>
                  )}
                  
                  {messages.length > 0 && (
                    <div
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const msg = messages[virtualRow.index];
                        return (
                          <div
                            key={msg.id}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              transform: `translateY(${virtualRow.start}px)`,
                              paddingBottom: '12px'
                            }}
                            className={`flex group ${
                              msg.senderId === currentUserId ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="flex items-end gap-2 max-w-[80%]">
                              {msg.senderId === currentUserId && (
                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all rounded-full hover:bg-destructive/10 shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                              <div
                                className={`relative rounded-2xl px-4 py-2.5 min-w-[85px] w-fit ${
                                  msg.senderId === currentUserId
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                                }`}
                              >
                                <div className="text-sm break-words whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none [&_pre]:bg-black/20 [&_pre]:rounded-lg [&_pre]:p-2 [&_pre]:text-xs [&_code]:text-xs [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0 [&_a]:text-inherit [&_a]:underline">
                                  <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                                </div>
                                <p
                                  className={`text-[10px] mt-1 text-right whitespace-nowrap ${
                                    msg.senderId === currentUserId ? "text-primary-foreground/60" : "text-muted-foreground"
                                  }`}
                                >
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
                {/* --------------------------------- */}

                <div className="p-4 border-t flex gap-3 shrink-0">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="h-11 text-base"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    size="icon"
                    className="h-11 w-11 shrink-0"
                  >
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
                  <p className="font-medium text-lg mb-1">
                    Select a conversation
                  </p>
                  <p className="text-muted-foreground">
                    Pick someone from the left to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
