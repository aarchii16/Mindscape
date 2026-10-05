import { useMemo, useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchWithAuth, API_BASE } from "@/lib/api";

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  type: string;
  isAvailable: boolean;
  notes?: string;
}

const CounselorAvailabilityPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    type: 'therapy' as 'therapy' | 'coaching' | 'consultation',
    notes: '',
  });

  const formattedDate = useMemo(
    () =>
      selectedDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [selectedDate]
  );

  // Fetch slots for the selected date
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const dayStr = selectedDate.toISOString().split('T')[0];
      const queryParams = `startDate=${dayStr}&endDate=${dayStr}`;
      console.log('Fetching slots with params:', queryParams);

      const res = await fetchWithAuth(`${API_BASE}/api/booking/counselor/slots?${queryParams}`);

      if (res.ok) {
        const data = await res.json();
        console.log('Fetched slots:', data);
        setSlots(data.data || []);
      } else {
        const errorText = await res.text();
        console.error('Failed to fetch slots:', res.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate]);

  // Group slots by time periods
  const groupedSlots = useMemo(() => {
    const result: Record<string, Slot[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    slots.forEach(slot => {
      const hour = new Date(slot.startTime).getHours();
      if (hour >= 6 && hour < 12) {
        result.morning.push(slot);
      } else if (hour >= 12 && hour < 17) {
        result.afternoon.push(slot);
      } else {
        result.evening.push(slot);
      }
    });

    return result;
  }, [slots]);

  // Calculate total slots
  const totalSlots = useMemo(() => {
    return Object.values(groupedSlots).reduce((total, slots) => total + slots.length, 0);
  }, [groupedSlots]);

  const handleAddSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      alert('Please enter both start and end times for the slot.');
      return;
    }

    try {
      // Create proper Date objects by combining selected date with time inputs
      const [startHour, startMinute] = newSlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = newSlot.endTime.split(':').map(Number);

      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      console.log('Creating slot with:', {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: newSlot.type,
        notes: newSlot.notes,
      });

      const res = await fetchWithAuth(`${API_BASE}/api/booking/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          type: newSlot.type,
          notes: newSlot.notes,
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Slot created successfully:', data);
        setNewSlot({
          startTime: '',
          endTime: '',
          type: 'therapy',
          notes: '',
        });
        setIsAddSlotOpen(false);
        fetchSlots(); // Refresh the slots
      } else {
        const error = await res.json();
        console.error('Failed to create slot:', error);
        alert(error.message || 'Failed to create slot');
      }
    } catch (error) {
      console.error('Error creating slot:', error);
      alert('Failed to create slot');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <Card className="rounded-3xl border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle>Pick a day</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(value) => value && setSelectedDate(value)}
            disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
            className="rounded-3xl border border-border/30 bg-background/80"
          />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/40 shadow-sm">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Slots on {formattedDate}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Toggle session windows and open more availability as needed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-xl">{totalSlots} slots</Badge>
            <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl">Add slot</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Time Slot</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startTime" className="text-right">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endTime" className="text-right">
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={newSlot.type}
                      onValueChange={(value: 'therapy' | 'coaching' | 'consultation') =>
                        setNewSlot(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="therapy">Therapy</SelectItem>
                        <SelectItem value="coaching">Coaching</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      placeholder="Optional notes"
                      value={newSlot.notes}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, notes: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddSlotOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSlot}>
                    Add Slot
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <div className="text-center py-8">Loading slots...</div>
          ) : (
            Object.entries(groupedSlots).map(([period, periodSlots]) => (
              <div key={period} className="space-y-3 rounded-2xl border border-border/20 bg-muted/10 p-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {period}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {periodSlots.length} {periodSlots.length === 1 ? "slot" : "slots"}
                  </p>
                </div>
                <Separator />
                {periodSlots.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {periodSlots.map((slot) => {
                      const startTime = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const endTime = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isBooked = !slot.isAvailable;
                      return (
                        <div
                          key={slot._id}
                          className={cn(
                            "flex flex-col gap-1 rounded-2xl border border-border/30 px-4 py-3",
                            isBooked ? "bg-muted text-muted-foreground" : "bg-background"
                          )}
                        >
                          <span className="text-sm font-medium">
                            {startTime} - {endTime}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {slot.type}
                          </span>
                          {slot.notes && (
                            <span className="text-xs text-muted-foreground italic">
                              "{slot.notes}"
                            </span>
                          )}
                          {isBooked && (
                            <Badge variant="secondary" className="w-fit rounded-lg text-xs">Booked</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No slots scheduled for this period</p>
                    <p className="text-xs mt-1">Add slots using the "Add slot" button above</p>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CounselorAvailabilityPage;