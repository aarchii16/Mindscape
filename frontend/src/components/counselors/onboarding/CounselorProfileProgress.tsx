import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { id: "bio", label: "Bio & specialties", completed: true },
  { id: "documents", label: "Credentials uploaded", completed: false },
  { id: "availability", label: "Availability set", completed: false },
  { id: "policies", label: "Policies acknowledged", completed: true },
];

const CounselorProfileProgress = () => {
  const completed = STEPS.filter((step) => step.completed).length;
  const percent = Math.round((completed / STEPS.length) * 100);

  return (
    <Card className="rounded-3xl border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Profile completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percent} className="h-2" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-primary">{percent}% complete</span>
          <span className="text-muted-foreground">{4 - completed} steps remaining</span>
        </div>
        <ul className="space-y-3 text-sm">
          {STEPS.map((step) => (
            <li
              key={step.id}
              className="flex items-center justify-between rounded-2xl border border-border/20 bg-muted/10 px-3 py-2"
            >
              <span>{step.label}</span>
              <span className={step.completed ? "text-emerald-500" : "text-muted-foreground"}>
                {step.completed ? "Completed" : "Pending"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CounselorProfileProgress;