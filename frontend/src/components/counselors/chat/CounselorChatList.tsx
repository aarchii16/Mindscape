import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";
import { fetchWithAuth, API_BASE } from "@/lib/api";

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
  messages: Array<{
    sender: string;
    content: string;
    timestamp: string;
    isRead: boolean;
  }>;
  updatedAt: string;
}

interface CounselorChatListProps {
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

const CounselorChatList = ({ activeThreadId, onSelectThread }: CounselorChatListProps) => {
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChatSessions = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/chat/sessions`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatSessions();

    // Set up polling for real-time updates
    const interval = setInterval(fetchChatSessions, 3000);

    return () => clearInterval(interval);
  }, [fetchChatSessions]);

  const filteredThreads = threads.filter((thread) => {
    if (!query) return true;
    const otherParticipant = thread.participants.find(p => p.role === 'student');
    if (!otherParticipant) return false;
    const fullName = `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase();
    return fullName.includes(query.toLowerCase()) || otherParticipant.username.toLowerCase().includes(query.toLowerCase());
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getPreview = (messages: any[]) => {
    if (messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.length > 50 ? lastMessage.content.substring(0, 50) + '...' : lastMessage.content;
  };

  const hasUnread = (messages: any[]) => {
    return messages.some(msg => !msg.isRead);
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border/30 bg-background/80">
      <div className="border-b border-border/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search students"
            className="rounded-xl border-border/30 bg-muted/20 pl-9"
          />
        </div>
      </div>
      <ScrollArea className="h-full">
        <ul className="space-y-1 p-2">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No chat sessions found
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isActive = activeThreadId === thread._id;
              const otherParticipant = thread.participants.find(p => p.role === 'student');
              const studentName = otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown Student';
              const unread = hasUnread(thread.messages);

              return (
                <li key={thread._id}>
                  <button
                    type="button"
                    onClick={() => onSelectThread(thread._id)}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-2xl border border-transparent px-3 py-2 text-left transition",
                      isActive ? "border-primary/40 bg-primary/10" : "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{studentName}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(thread.updatedAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{getPreview(thread.messages)}</p>
                    {unread && <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" />}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </ScrollArea>
    </div>
  );
};

export default CounselorChatList;