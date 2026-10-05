import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCachedUser } from "@/lib/auth";

const STAT_LABELS: Record<string, string> = {
  openSessions: "Open sessions",
  newRequests: "New requests",
  todaysSessions: "Today",
  satisfaction: "Satisfaction",
};

const CounselorOverviewCards = () => {
  const user = getCachedUser();
  const [stats, setStats] = useState({
    openSessions: 0,
    newRequests: 0,
    todaysSessions: 0,
    satisfaction: 94,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/booking/counselor/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching counselor stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.keys(stats).map((key) => (
          <Card key={key} className="rounded-3xl border-border/40 bg-background/80 shadow-sm backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {STAT_LABELS[key]}
              </CardTitle>
              {key === "newRequests" && <Badge variant="secondary">New</Badge>}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold animate-pulse bg-muted h-8 w-12 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Object.entries(stats).map(([key, value]) => (
        <Card key={key} className="rounded-3xl border-border/40 bg-background/80 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {STAT_LABELS[key]}
            </CardTitle>
            {key === "newRequests" && <Badge variant="secondary">New</Badge>}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {key === "satisfaction" ? `${value}%` : value}
            </div>
            {key === "todaysSessions" && (
              <p className="mt-2 text-xs text-muted-foreground">
                {user?.firstName ? `${user.firstName}, ` : ""}don&apos;t forget to join 10 minutes early.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CounselorOverviewCards;