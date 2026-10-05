import { useMemo } from "react";
import { getCachedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { CalendarPlus, MessageSquare, ArrowRight } from "lucide-react";

const CounselorHeader = () => {
  const navigate = useNavigate();
  const user = getCachedUser();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border/30 bg-background/70 px-4 py-3 backdrop-blur-lg">
      <div>
        <div className="text-sm text-muted-foreground">{greeting}</div>
        <h1 className="text-xl font-semibold tracking-tight">
          {user?.firstName ? `${user.firstName} ${user?.lastName ?? ""}` : "Counselor"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Stay organized by tracking profile completion, availability slots, and upcoming student sessions all in one place.
        </p>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <Button variant="outline" className="rounded-xl" onClick={() => navigate("/counselor/availability")}> 
          <CalendarPlus className="mr-2 h-4 w-4" />
          Manage Availability
        </Button>
        <Button className="rounded-xl" onClick={() => navigate("/counselor/chat")}> 
          <MessageSquare className="mr-2 h-4 w-4" />
          Open Messages
        </Button>
      </div>
      <Link
        to="/booking"
        className="md:hidden inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Bookings <ArrowRight className="h-4 w-4" />
      </Link>
    </header>
  );
};

export default CounselorHeader;