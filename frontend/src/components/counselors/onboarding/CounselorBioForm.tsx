import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SPECIALTIES = ["Anxiety", "Stress", "Career", "Relationships", "Burnout"];

const CounselorBioForm = () => {
  const [bio, setBio] = useState("Dedicated to supporting students navigating high-pressure academic environments.");
  const [focusAreas, setFocusAreas] = useState<string[]>(["Anxiety", "Career"]);
  const [yearsExperience, setYearsExperience] = useState("5");

  const toggleFocus = (name: string) => {
    setFocusAreas((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleSubmit = () => {
    console.info("Saving counselor bio", { bio, focusAreas, yearsExperience });
  };

  return (
    <Card className="rounded-3xl border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Professional summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="experience">Years of experience</Label>
          <Input
            id="experience"
            type="number"
            min={0}
            value={yearsExperience}
            onChange={(event) => setYearsExperience(event.target.value)}
            className="rounded-xl border-border/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">About you</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            className="min-h-[140px] rounded-2xl border-border/30"
            placeholder="Share your approach and how you support students."
          />
          <p className="text-xs text-muted-foreground">
            Students will see this in the counseling marketplace.
          </p>
        </div>

        <div className="space-y-3">
          <Label>Focus areas</Label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((item) => {
              const isActive = focusAreas.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleFocus(item)}
                  className="rounded-2xl border border-border/30 px-3 py-1 text-sm font-medium"
                >
                  <Badge variant={isActive ? "default" : "outline"} className="rounded-xl">
                    {item}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="rounded-xl">
          Save profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CounselorBioForm;