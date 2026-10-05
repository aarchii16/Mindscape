import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { getCachedUser } from "@/lib/auth";
import { fetchWithAuth, API_BASE } from "@/lib/api";

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

export default function StudentChatPage() {
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

          // Check if counselor information is available
          if (latestBooking.counselorId && latestBooking.counselorId._id) {
            // Only update if counselor changed or not set
            if (!bookedCounselor || bookedCounselor._id !== latestBooking.counselorId._id) {
              setBookedCounselor({
                firstName: latestBooking.counselorId.firstName,
                lastName: latestBooking.counselorId.lastName,
                _id: latestBooking.counselorId._id
              });

              // Find or create chat session with this counselor
              await findOrCreateChatSession(latestBooking.counselorId._id);
            }
          } else {
            console.error('Counselor information not available for booking:', latestBooking);
          }
        } else if (bookedCounselor) {
          // If no confirmed bookings but we had a counselor, clear it
          setBookedCounselor(null);
          setChatSession(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Poll for bookings every 30 seconds to catch new bookings
    const bookingPollInterval = setInterval(fetchBookings, 30000);

    return () => clearInterval(bookingPollInterval);
  }, [user]);

  // Find or create chat session with counselor
  const findOrCreateChatSession = async (counselorId: string): Promise<ChatSession | null> => {
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
          return existingSession;
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
        return newSession;
      } else {
        console.error('Failed to create chat session:', await createRes.text());
        return null;
      }
    } catch (error) {
      console.error('Failed to find/create chat session:', error);
      return null;
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
    let sessionToUse = chatSession;
    if (!sessionToUse) {
      await findOrCreateChatSession(bookedCounselor._id);
      sessionToUse = chatSession;
      // If still no session after creation attempt, return
      if (!sessionToUse) return;
    }

    setSending(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/chat/sessions/${sessionToUse._id}/messages`, {
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
        await fetchChatSession(sessionToUse._id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </Card>
        </div>
      </div>
    );
  }

  if (!bookedCounselor) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="h-96 flex flex-col items-center justify-center text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Counseling Session</h2>
            <p className="text-muted-foreground mb-4">
              You need to book a confirmed session with a counselor to start chatting.
              If you've recently booked a session, please refresh the page or contact support if the issue persists.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/booking'}>
                Book a Session
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {bookedCounselor.firstName[0]}{bookedCounselor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  Chat with {bookedCounselor.firstName} {bookedCounselor.lastName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your counselor</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {chatSession?.messages && chatSession.messages.length > 0 ? (
                  chatSession.messages.map((message) => {
                    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                    const isFromStudent = senderId === user?._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isFromStudent ? "justify-end" : "justify-start"  // Student messages on RIGHT, counselor messages on LEFT
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isFromStudent
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          }`}
                        >
                          <p>{message.content}</p>
                          <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground/80">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
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

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === "Enter" && !sending && handleSend()}
                  className="flex-1"
                  disabled={sending}
                />
                <Button
                  onClick={handleSend}
                  size="sm"
                  disabled={sending || !newMessage.trim()}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}