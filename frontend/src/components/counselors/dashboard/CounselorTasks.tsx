import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const DEFAULT_TASKS = [
  {
    id: "bio",
    title: "Finalize public profile",
    description: "Add your specialties, experience, and short bio.",
  },
  {
    id: "availability",
    title: "Confirm next week availability",
    description: "Review existing slots and open new ones for students.",
  },
  {
    id: "followups",
    title: "Send follow-up notes",
    description: "Share key takeaways and resources with recent sessions.",
  },
];

const CounselorTasks = () => {
  const [completed, setCompleted] = useState<string[]>([]);

  return (
    <Card className="rounded-3xl border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Actions for today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {DEFAULT_TASKS.map((task) => {
            const isDone = completed.includes(task.id);
            return (
              <li key={task.id} className="flex items-start gap-3 rounded-2xl border border-border/20 bg-muted/10 p-3">
                <Checkbox
                  id={task.id}
                  checked={isDone}
                  onCheckedChange={(checked) => {
                    setCompleted((prev) =>
                      checked ? [...prev, task.id] : prev.filter((id) => id !== task.id)
                    );
                  }}
                />
                <label htmlFor={task.id} className="flex flex-col">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-sm text-muted-foreground">{task.description}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <Button onClick={() => setCompleted(DEFAULT_TASKS.map((task) => task.id))} className="w-full">
          Mark all complete
        </Button>
      </CardContent>
    </Card>
  );
};

export default CounselorTasks;