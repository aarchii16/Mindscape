import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
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

const CounselorBookingsPage = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate stats from bookings
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const upcomingBookings = bookings.filter(b => {
      const slotDate = new Date(b.slotId.startTime);
      return slotDate > new Date() && b.status === 'confirmed';
    }).length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    return {
      totalBookings,
      confirmedBookings,
      upcomingBookings,
      cancelledBookings
    };
  }, [bookings]);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_BASE}/api/booking/counselor/appointments`);

      if (res.ok) {
        const data = await res.json();
        console.log('Fetched bookings data:', data);
        setBookings(data.data || []);
      } else {
        const errorText = await res.text();
        console.error('Failed to fetch bookings:', res.status, errorText);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (filterStatus === "all") return bookings;
    return bookings.filter((booking) => booking.status.toLowerCase() === filterStatus.toLowerCase());
  }, [filterStatus, bookings]);

  const toggleSelection = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((existing) => existing !== id)));
  };

  const performBulkAction = (action: string) => {
    console.info(`Performing ${action} for`, selected);
  };

  const formatDate = (booking: Booking) => {
    const date = new Date(booking.slotId.startTime);
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getFocusArea = (booking: Booking) => {
    // Use notes as focus area, or provide default based on type
    return booking.notes || `${booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} session`;
  };

  const getSessionType = (booking: Booking) => {
    // Map slot type to display format
    const typeMap: { [key: string]: string } = {
      'therapy': 'In-person',
      'consultation': 'Virtual',
      'coaching': 'Virtual'
    };
    return typeMap[booking.slotId.type] || 'Virtual';
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/40 shadow-sm">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Booking pipeline</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track all upcoming student sessions, confirmations, and follow-ups.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] rounded-xl border-border/30">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
            <Button className="rounded-xl" onClick={() => performBulkAction("send-check-in")} disabled={!selected.length}>
              Send check-in
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => performBulkAction("reschedule")}
              disabled={!selected.length}
            >
              Request reschedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[420px] rounded-2xl">
            <Table>
              <TableCaption>Bookings pulled from counselor availability.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selected.length === filtered.length && filtered.length > 0}
                      indeterminate={selected.length > 0 && selected.length < filtered.length}
                      onCheckedChange={(checked) =>
                        setSelected(checked ? filtered.map((booking) => booking.id) : [])
                      }
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Focus</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((booking) => (
                    <TableRow key={booking._id} className="bg-background/60">
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(booking._id)}
                          onCheckedChange={(checked) => toggleSelection(booking._id, Boolean(checked))}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {`${booking.user.firstName} ${booking.user.lastName}`}
                      </TableCell>
                      <TableCell>{getFocusArea(booking)}</TableCell>
                      <TableCell>{formatDate(booking)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-lg">
                          {getSessionType(booking)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-lg",
                            booking.status.toLowerCase() === "confirmed" && "bg-emerald-500/10 text-emerald-600",
                            booking.status.toLowerCase() === "cancelled" && "bg-red-500/10 text-red-600",
                            booking.status.toLowerCase() === "rescheduled" && "bg-amber-500/10 text-amber-600"
                          )}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="rounded-lg">
                            Notes
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-lg">
                            Message
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalBookings}</p>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Confirmed Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.confirmedBookings}</p>
            <p className="text-xs text-muted-foreground">Active confirmed appointments</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Cancellations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.cancelledBookings}</p>
            <p className="text-xs text-muted-foreground">Cancelled appointments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CounselorBookingsPage;