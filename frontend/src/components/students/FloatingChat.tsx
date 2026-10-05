import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { getCachedUser } from "@/lib/auth";
import { fetchWithAuth, API_BASE } from "@/lib/api";

interface Message {
  _id: string;
  sender: {
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

interface Booking {
  _id: string;
  counselorId: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  slotId: {
    startTime: string;
    endTime: string;
    type: string;
  };
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [bookedCounselor, setBookedCounselor] = useState<{firstName: string, lastName: string, _id: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const user = getCachedUser();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && chatSession?.messages) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chatSession?.messages]);

  // Fetch student's bookings to get counselor info
  useEffect(() => {
    const fetchBookings = async () => {
      if (user?.role !== 'student') {
        setLoading(false);
        return;
      }

      try {
        const res = await fetchWithAuth(`${API_BASE}/api/booking/appointments`);
        if (res.ok) {
          const data = await res.json();
          const bookings: Booking[] = data.data || [];

          // Find the most recent confirmed booking
          const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
          if (confirmedBookings.length > 0) {
            // Sort by most recent
            const sortedBookings = confirmedBookings.sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const latestBooking = sortedBookings[0];
            setBookedCounselor({
              firstName: latestBooking.counselorId.firstName,
              lastName: latestBooking.counselorId.lastName,
              _id: latestBooking.counselorId._id
            });

            // Find or create chat session with this counselor
            await findOrCreateChatSession(latestBooking.counselorId._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Find or create chat session with counselor
  const findOrCreateChatSession = async (counselorId: string) => {
    try {
      const sessionsRes = await fetchWithAuth(`${API_BASE}/api/chat/sessions`);
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        const sessions: ChatSession[] = sessionsData.data || [];

        // Find session with this counselor
        const existingSession = sessions.find(session =>
          session.participants.some(p => p._id === counselorId && p.role === 'counselor')
        );

        if (existingSession) {
          setChatSession(existingSession);
          startPolling(existingSession._id);
          return;
        }
      }

      // If no existing session, try to create one
      console.log('No existing chat session found. Creating new chat session...');
      const createRes = await fetchWithAuth(`${API_BASE}/api/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: counselorId,
          type: 'student-counselor',
          title: `Chat with ${bookedCounselor?.firstName} ${bookedCounselor?.lastName}`
        }),
      });

      if (createRes.ok) {
        const newSessionData = await createRes.json();
        const newSession = newSessionData.data;
        setChatSession(newSession);
        startPolling(newSession._id);
        console.log('Chat session created successfully');
      } else {
        console.log('Failed to create chat session. Counselor may need to initiate contact.');
      }
    } catch (error) {
      console.error('Failed to find/create chat session:', error);
    }
  };

  // Start polling for new messages
  const startPolling = (sessionId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    pollIntervalRef.current = setInterval(() => {
      fetchChatSession(sessionId);
    }, 3000); // Poll every 3 seconds
  };

  // Fetch chat session messages
  const fetchChatSession = async (sessionId: string) => {
    if (chatLoading) return;

    setChatLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/chat/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setChatSession(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat session:', error);
    } finally {
      setChatLoading(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !bookedCounselor || sending) return;

    // If no chat session exists, try to create one first
    if (!chatSession) {
      await findOrCreateChatSession(bookedCounselor._id);
      // If still no session after creation attempt, return
      if (!chatSession) return;
    }

    setSending(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/chat/sessions/${chatSession._id}/messages`, {
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
        // Fetch updated messages immediately
        await fetchChatSession(chatSession._id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Only show if student has booked a counselor
  if (user?.role !== 'student' || !bookedCounselor || loading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-80 h-96 shadow-xl border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chat with {bookedCounselor.firstName} {bookedCounselor.lastName}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-64 px-4">
              <div className="space-y-3">
                {chatSession?.messages && chatSession.messages.length > 0 ? (
                  chatSession.messages.map((message) => {
                    const isStudent = message.sender._id === user?._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isStudent ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            isStudent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="font-medium text-xs mb-1 opacity-75">
                            {isStudent ? "You" : `${bookedCounselor.firstName} ${bookedCounselor.lastName}`}
                          </p>
                          <p>{message.content}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      {chatSession
                        ? "No messages yet. Start the conversation!"
                        : "Chat session being initialized. Send a message to begin!"
                      }
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === "Enter" && !sending && handleSend()}
                  className="flex-1"
                  disabled={sending}
                />
                <Button onClick={handleSend} size="sm" disabled={sending || !newMessage.trim()}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FloatingChat;