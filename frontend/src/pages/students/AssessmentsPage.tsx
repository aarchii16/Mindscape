import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchWithAuth, API_BASE } from "@/lib/api";
import { Frown, AlertTriangle, Zap } from "lucide-react";

// 10 questions each; answer values map 0-3 (Never=0 to Nearly every day=3)
const scale = [
  { label: "Never", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

const depressionQs = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things, such as reading or schoolwork",
  "Moving or speaking slowly or being fidgety/restless",
  "Thoughts that you would be better off dead, or of hurting yourself",
  "Feeling numb or empty",
];

const anxietyQs = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
  "Muscle tension",
  "Racing thoughts",
  "Difficulty sleeping due to worry",
];

const stressQs = [
  "In the last month, how often have you felt unable to control important things in your life?",
  "In the last month, how often have you felt confident about handling personal problems? (reverse)",
  "In the last month, how often have you felt that things were going your way? (reverse)",
  "In the last month, how often have you felt difficulties were piling up so high you could not overcome them?",
  "In the last month, how often have you been upset because of something that happened unexpectedly?",
  "In the last month, how often have you felt nervous and stressed?",
  "In the last month, how often have you felt anger or frustration you couldn't shake off?",
  "In the last month, how often have you felt that you were on top of things? (reverse)",
  "In the last month, how often have you been able to control irritations in your life? (reverse)",
  "In the last month, how often have you felt that problems were out of your control?",
];

function computeSum(values: number[]) {
  return values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

function computeCompositeFlexible(totals: number[]) {
  // Accept 1 to 3 totals (each 0-30), normalize to 0-100, invert (higher is better), average
  const parts = totals.map(t => 100 - (t / 30) * 100);
  const denom = parts.length || 1;
  return Math.round(parts.reduce((x, y) => x + y, 0) / denom);
}

type Mode = "menu" | "depression" | "anxiety" | "stress";

export default function AssessmentsPage() {
  // Answers (-1 = unanswered)
  const [depAnswers, setDepAnswers] = useState<number[]>(Array(10).fill(-1));
  const [anxAnswers, setAnxAnswers] = useState<number[]>(Array(10).fill(-1));
  const [strAnswers, setStrAnswers] = useState<number[]>(Array(10).fill(-1));

  const [mode, setMode] = useState<Mode>("menu");
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ dep: number; anx: number; stress: number; wellness: number } | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const depComplete = useMemo(() => depAnswers.every(v => v >= 0), [depAnswers]);
  const anxComplete = useMemo(() => anxAnswers.every(v => v >= 0), [anxAnswers]);
  const strComplete = useMemo(() => strAnswers.every(v => v >= 0), [strAnswers]);
  const allAnswered = depComplete && anxComplete && strComplete;
  const atLeastOneComplete = depComplete || anxComplete || strComplete;

  const current = useMemo(() => {
    if (mode === "depression") return { questions: depressionQs, answers: depAnswers, setAnswers: setDepAnswers };
    if (mode === "anxiety") return { questions: anxietyQs, answers: anxAnswers, setAnswers: setAnxAnswers };
    if (mode === "stress") return { questions: stressQs, answers: strAnswers, setAnswers: setStrAnswers };
    return null;
  }, [mode, depAnswers, anxAnswers, strAnswers]);

  const startTest = (m: Mode) => {
    if (m === "menu") return;
    setMode(m);
    // Jump to first unanswered if resuming
    if (m === "depression") setIdx(depAnswers.findIndex(v => v < 0) === -1 ? 0 : depAnswers.findIndex(v => v < 0));
    if (m === "anxiety") setIdx(anxAnswers.findIndex(v => v < 0) === -1 ? 0 : anxAnswers.findIndex(v => v < 0));
    if (m === "stress") setIdx(strAnswers.findIndex(v => v < 0) === -1 ? 0 : strAnswers.findIndex(v => v < 0));
    setShouldAnimate(false); // starting test should not animate yet
  };

  const answerCurrent = (val: number) => {
    if (!current) return;
    const next = [...current.answers];
    next[idx] = val;
    current.setAnswers(next);
    // Do NOT animate just for answer change
    setShouldAnimate(false);
  };

  const submitAll = async () => {
    // Allow submission if at least one test is completed
    if (!atLeastOneComplete) return;
    const dep = depComplete ? computeSum(depAnswers) : 0;
    const anx = anxComplete ? computeSum(anxAnswers) : 0;
    const stress = strComplete ? computeSum(strAnswers) : 0;

    const totals: number[] = [];
    if (depComplete) totals.push(dep);
    if (anxComplete) totals.push(anx);
    if (strComplete) totals.push(stress);

    const wellness = computeCompositeFlexible(totals);
    setSaving(true);
    try {
      // Backend requires numbers for all fields; send zeros for incomplete tests
      const res = await fetchWithAuth(`${API_BASE}/api/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depressionScore: dep,
          anxietyScore: anx,
          stressScore: stress,
          wellnessScore: wellness,
        })
      });

      // Show result regardless of save success to satisfy UX requirement
      if (!res.ok) {
        console.warn('Save failed but showing local result.');
      }
      setResult({ dep, anx, stress, wellness });
    } catch (e) {
      console.error(e);
      setResult({ dep, anx, stress, wellness });
    } finally {
      setSaving(false);
    }
  };

  const TestRunner = () => {
    if (!current) return null;
    const q = current.questions[idx];
    const answered = current.answers[idx] >= 0;
    const last = idx === current.questions.length - 1;

    return (
      <Card key={idx} className={shouldAnimate ? "glass-card animate-fade-up" : "glass-card"}>
        <CardHeader>
          <CardTitle className="text-center">
            {mode === 'depression' && 'Depression Screening'}
            {mode === 'anxiety' && 'Anxiety Screening'}
            {mode === 'stress' && 'Perceived Stress Scale'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Descriptions and labels */}
          {mode === 'depression' && (
            <p className="text-center text-muted-foreground">Assess symptoms of depression • 10 questions</p>
          )}
          {mode === 'anxiety' && (
            <p className="text-center text-muted-foreground">Evaluate anxiety symptoms • 10 questions</p>
          )}
          {mode === 'stress' && (
            <p className="text-center text-muted-foreground">Measure your perceived stress levels • 10 questions</p>
          )}
          <div className="text-sm text-muted-foreground text-center">Question {idx + 1}/10</div>
          <div className="max-w-xl mx-auto"><Progress value={Math.round(((idx + 0) / current.questions.length) * 100)} className="h-2" /></div>
          <div className="text-lg md:text-xl font-semibold text-center">{q}</div>

          {/* Vertical options with radio buttons */}
          <RadioGroup
            value={String(current.answers[idx] ?? '')}
            onValueChange={(v) => {
              const num = Number(v);
              if (!Number.isNaN(num)) answerCurrent(num);
            }}
            className="grid gap-3 max-w-md mx-auto"
          >
            {scale.map((opt) => (
              <label key={opt.label} className="flex items-center gap-3 p-3 rounded-xl border border-border/30 glass cursor-pointer">
                <RadioGroupItem value={String(opt.value)} />
                <span className="text-sm md:text-base">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => { setShouldAnimate(true); setIdx((v) => Math.max(0, v - 1)); }}
              disabled={idx === 0}
              className="rounded-xl"
            >
              Back
            </Button>
            {!last ? (
              <Button
                onClick={() => { setShouldAnimate(true); setIdx((v) => Math.min(current.questions.length - 1, v + 1)); }}
                disabled={!answered}
                className="rounded-xl transition-transform active:scale-95"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => { setShouldAnimate(true); setMode('menu'); }}
                disabled={!answered}
                className="rounded-xl"
              >
                Finish Test
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const Menu = () => (
    <div className="space-y-6 animate-fade-up">
      {/* Title and subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Mental Health Assessment</h1>
        <p className="text-xl text-muted-foreground">Take validated screenings to understand your mental health</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card hover-glass transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Frown /> Depression Screening (PHQ-9)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Assess symptoms of depression</p>
            <p className="text-xs text-muted-foreground mb-2">10 questions</p>
            <Button onClick={() => startTest('depression')} className="rounded-xl hover:scale-105 transition-transform">Start Assessment</Button>
          </CardContent>
        </Card>
        <Card className="glass-card hover-glass transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle /> Anxiety Screening (GAD-7)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Evaluate anxiety symptoms</p>
            <p className="text-xs text-muted-foreground mb-2">10 questions</p>
            <Button onClick={() => startTest('anxiety')} className="rounded-xl hover:scale-105 transition-transform">Start Assessment</Button>
          </CardContent>
        </Card>
        <Card className="glass-card hover-glass transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap /> Perceived Stress Scale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Measure your perceived stress levels</p>
            <p className="text-xs text-muted-foreground mb-2">10 questions</p>
            <Button onClick={() => startTest('stress')} className="rounded-xl hover:scale-105 transition-transform">Start Assessment</Button>
          </CardContent>
        </Card>
      </div>

      {/* Submit all section */}
      <div className="flex items-center justify-between">
        {!result ? (
          <div className="flex items-center gap-3">
            <Button disabled={!atLeastOneComplete || saving} onClick={submitAll} className="rounded-xl">
              {saving ? 'Saving...' : 'Calculate Wellness Score'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDepAnswers(Array(10).fill(-1));
                setAnxAnswers(Array(10).fill(-1));
                setStrAnswers(Array(10).fill(-1));
                setResult(null);
                setMode('menu');
                setIdx(0);
              }}
              className="rounded-xl"
            >
              Retake Assessment
            </Button>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-lg">Depression score: <Badge>{depComplete ? `${result.dep}/30` : '—'}</Badge></div>
              <div className="text-lg">Anxiety score: <Badge>{anxComplete ? `${result.anx}/30` : '—'}</Badge></div>
              <div className="text-lg">Stress score: <Badge>{strComplete ? `${result.stress}/30` : '—'}</Badge></div>
            </div>
            <div className="text-center text-2xl md:text-3xl font-extrabold">
              Wellness score: <span className="text-primary">{result.wellness}/100</span>
            </div>
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setDepAnswers(Array(10).fill(-1));
                  setAnxAnswers(Array(10).fill(-1));
                  setStrAnswers(Array(10).fill(-1));
                  setResult(null);
                  setMode('menu');
                  setIdx(0);
                }}
                className="rounded-xl"
              >
                Retake Assessment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {mode === 'menu' ? <Menu /> : <TestRunner />}
      </div>
    </div>
  );
}