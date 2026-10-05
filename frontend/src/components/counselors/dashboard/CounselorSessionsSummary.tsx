import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchWithAuth, API_BASE } from "@/lib/api";

interface Booking {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
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

interface UpcomingSession {
  id: string;
  student: string;
  time: string;
  focus: string;
}

const CounselorSessionsSummary = () => {
  const [sessions, setSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/booking/counselor/appointments`);
        if (res.ok) {
          const data = await res.json();
          const bookings: Booking[] = data.data || [];

          // Filter upcoming confirmed sessions
          const upcoming = bookings
            .filter(booking => {
              const slotDate = new Date(booking.slotId.startTime);
              return slotDate > new Date() && booking.status === 'confirmed';
            })
            .sort((a, b) => new Date(a.slotId.startTime).getTime() - new Date(b.slotId.startTime).getTime())
            .slice(0, 10) // Show up to 10 upcoming sessions
            .map(booking => ({
              id: booking._id,
              student: `${booking.user.firstName} ${booking.user.lastName}`,
              time: formatTime(booking.slotId.startTime),
              focus: booking.notes || `${booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} session`,
            }));

          setSessions(upcoming);
        } else {
          console.error('Failed to fetch bookings');
          setSessions([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingSessions();
  }, []);

  const formatTime = (startTime: string) => {
    const date = new Date(startTime);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return diffMins <= 0 ? "Now" : `In ${diffMins} minutes`;
    } else if (diffHours < 24) {
      return `Today ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  return (
    <Card className="rounded-3xl border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Upcoming sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No upcoming sessions</div>
          ) : (
            <ul className="space-y-4">
              {sessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/20 bg-muted/10 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{session.student.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-tight">{session.student}</p>
                      <p className="text-xs text-muted-foreground">{session.focus}</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-primary">{session.time}</p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CounselorSessionsSummary;