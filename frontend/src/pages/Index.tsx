import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchWithAuth, API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

const Index = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) return; // only show to logged-in users
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/users/profile`);
        const data = await res.json().catch(() => null);
        const assessments = data?.data?.wellness?.assessments;
        if (!assessments || assessments.length === 0) {
          setShowPrompt(true);
        } else {
          setShowPrompt(false);
        }
      } catch {}
    };
    init();
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />

      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Mental Health Assessment</DialogTitle>
            <DialogDescription>
              Take validated screenings to understand your mental health.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setShowPrompt(false)}>Close</Button>
            <Link to="/assessments">
              <Button className="rounded-xl hover:scale-105 transition-transform">Start Now</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
