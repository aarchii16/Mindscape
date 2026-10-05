import { Outlet } from "react-router-dom";
import CounselorSidebar from "@/components/counselors/CounselorSidebar";
import CounselorHeader from "@/components/counselors/CounselorHeader";

const CounselorLayout = () => (
  <div className="min-h-screen bg-muted/20">
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6">
      <CounselorSidebar />
      <div className="flex-1 space-y-6">
        <CounselorHeader />
        <section className="rounded-3xl border border-border/30 bg-background/80 p-6 shadow-sm backdrop-blur-lg">
          <Outlet />
        </section>
      </div>
    </div>
  </div>
);

export default CounselorLayout;