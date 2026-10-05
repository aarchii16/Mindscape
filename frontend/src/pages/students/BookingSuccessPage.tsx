import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar as CalendarIcon, Clock, User, Shield, Video, MapPin, Phone, MessageSquare, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";

// Map session type to icon and label to keep visuals consistent
const SESSION_TYPE_META: Record<string, { icon: LucideIcon; label: string }> = {
  "in-person": { icon: MapPin, label: "In-Person" },
  video: { icon: Video, label: "Video Call" },
  phone: { icon: Phone, label: "Phone Call" },
  chat: { icon: MessageSquare, label: "Text Chat" },
};

export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  // If navigated directly without state, send user back to booking
  useEffect(() => {
    if (!state || !state.date || !state.time) {
      navigate("/booking", { replace: true });
    }
  }, [state, navigate]);

  const sessionMeta = SESSION_TYPE_META[state?.type] || SESSION_TYPE_META["video"];
  const SessionIcon = sessionMeta.icon;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">Booking Successful</h1>
          <p className="text-lg text-muted-foreground">Your session has been scheduled. A confirmation has been recorded.</p>

          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <Badge variant="secondary" className="glass">
              <Shield className="w-3 h-3 mr-1" />
              Confidential & Secure
            </Badge>
            <Badge variant="secondary" className="glass">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Reserved Slot
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Summary Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{state?.counselorName || "Assigned Counselor"}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{state?.date ? new Date(state.date).toLocaleDateString() : ""}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{state?.time}</span>
              </div>
              <div className="flex items-center">
                <SessionIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{sessionMeta.label}</span>
              </div>

              {/* Optional details */}
              {state?.urgency && (
                <div className="pt-2">
                  <span className="text-xs text-muted-foreground">Urgency:</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {state.urgency === "normal" && "Normal - Within a week"}
                      {state.urgency === "urgent" && "Urgent - Within 24-48 hours"}
                      {state.urgency === "crisis" && "Crisis - Immediate attention needed"}
                    </Badge>
                  </div>
                </div>
              )}

              {!state?.anonymous && state?.name && (
                <div>
                  <span className="text-xs text-muted-foreground">Booked for:</span>
                  <div className="mt-1 text-sm">{state.name}{state?.email ? ` • ${state.email}` : ""}</div>
                </div>
              )}

              {state?.concern && (
                <div>
                  <span className="text-xs text-muted-foreground">Provided notes:</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{state.concern}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border/30">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Cost:</span>
                  <span className="text-success">Free for Students</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button className="rounded-xl hover-glass" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
                <Button variant="outline" className="rounded-xl hover-glass" onClick={() => navigate("/booking")}>Book Another Session</Button>
              </div>

              <div className="text-center pt-2">
                <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                  <Home className="w-4 h-4 mr-1" />
                  Return Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}