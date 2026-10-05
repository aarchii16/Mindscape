import { useMemo } from "react";
import CounselorOverviewCards from "@/components/counselors/dashboard/CounselorOverviewCards";
import CounselorTasks from "@/components/counselors/dashboard/CounselorTasks";
import CounselorSessionsSummary from "@/components/counselors/dashboard/CounselorSessionsSummary";

const CounselorDashboardPage = () => {
  const today = useMemo(() => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Today&apos;s Snapshot</h2>
        <p className="text-muted-foreground">{today}</p>
      </div>
      <CounselorOverviewCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <CounselorTasks />
        <CounselorSessionsSummary />
      </div>
    </div>
  );
};

export default CounselorDashboardPage;