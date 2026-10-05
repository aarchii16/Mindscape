import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { fetchWithAuth, API_BASE } from "@/lib/api";
import { getCachedUser } from "@/lib/auth";

interface Message {
  _id: string;
  sender: string | {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatSession {
  _id: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
  }>;
  type: string;
  title: string;
  isActive: boolean;
  messages: Message[];
}

interface CounselorChatThreadProps {
  threadId: string | null;
}

const CounselorChatThread = ({ threadId }: CounselorChatThreadProps) => {
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const user = getCachedUser();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && chatSession?.messages) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chatSession?.messages]);

  useEffect(() => {
    if (threadId) {
      fetchChatSession();
    }
  }, [threadId]);

  // Start polling when threadId changes
  useEffect(() => {
    if (threadId) {
      startPolling(threadId);
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [threadId]);

  const startPolling = (sessionId: string) => {
    stopPolling(); // Clear any existing polling
    pollIntervalRef.current = setInterval(() => {
      fetchChatSession(sessionId);
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchChatSession = async (sessionId?: string) => {
    const id = sessionId || threadId;
    if (!id || chatLoading) return;

    setChatLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/chat/sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setChatSession(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat session:', error);
    } finally {
      setChatLoading(false);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !threadId || !user) return;

    setSending(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/chat/sessions/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage("");
        // Refetch the chat session to get the updated messages
        await fetchChatSession();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!threadId) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/10">
        <p className="text-sm text-muted-foreground">Select a conversation to view messages.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-border/30 bg-background/80">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/10">
        <p className="text-sm text-muted-foreground">Failed to load conversation.</p>
      </div>
    );
  }

  const otherParticipant = chatSession.participants.find(p => p._id !== user?._id);
  const messages = chatSession.messages;

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border/30 bg-background/80">
      <div className="border-b border-border/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {otherParticipant ? `${otherParticipant.firstName[0]}${otherParticipant.lastName[0]}` : 'UN'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">
              {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown Student'}
            </p>
            <p className="text-xs text-muted-foreground">Student conversation</p>
          </div>
        </div>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((message) => {
              const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
              const isFromCounselor = senderId === user?._id;
              return (
                <div
                  key={message._id}
                  className={
                    isFromCounselor
                      ? "flex justify-end"  // Counselor messages on RIGHT
                      : "flex justify-start"  // Student messages on LEFT
                  }
                >
                  <div
                    className={
                      isFromCounselor
                        ? "max-w-[75%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
                        : "max-w-[75%] rounded-2xl rounded-bl-sm border border-border/40 bg-muted/20 px-4 py-2 text-sm"
                    }
                  >
                    <p>{message.content}</p>
                    <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground/80">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border/20 p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 resize-none"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
            className="px-3"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CounselorChatThread;