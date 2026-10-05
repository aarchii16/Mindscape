import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, CheckCircle2 } from "lucide-react";

const DEFAULT_DOCUMENTS = [
  {
    id: "license",
    name: "State counseling license",
    status: "Verified",
    updatedAt: "Mar 1, 2025",
  },
  {
    id: "certification",
    name: "Trauma-informed training",
    status: "Pending review",
    updatedAt: "Feb 22, 2025",
  },
];

const CounselorDocumentsSection = () => {
  const [documents] = useState(DEFAULT_DOCUMENTS);

  return (
    <Card className="rounded-3xl border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-2xl border border-dashed border-border/40 bg-muted/10 p-4 text-center">
          <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">Upload new credential</p>
          <p className="text-xs text-muted-foreground">PDF, PNG, or JPG up to 10MB</p>
          <Button className="mt-2 rounded-xl" variant="outline">
            Select file
          </Button>
        </div>

        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="space-y-2 rounded-2xl border border-border/30 bg-background/80 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{document.name}</p>
                  <p className="text-xs text-muted-foreground">Updated {document.updatedAt}</p>
                </div>
                <Badge
                  className={
                    document.status === "Verified"
                      ? "rounded-xl bg-emerald-500/10 text-emerald-600"
                      : "rounded-xl bg-amber-500/10 text-amber-600"
                  }
                >
                  {document.status}
                </Badge>
              </div>
              <Progress value={document.status === "Verified" ? 100 : 60} className="h-1" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Compliance team reviews new uploads within 2 business days.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CounselorDocumentsSection;