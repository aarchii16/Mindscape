import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import CounselorChatList from "@/components/counselors/chat/CounselorChatList";
import CounselorChatThread from "@/components/counselors/chat/CounselorChatThread";
import CounselorChatComposer from "@/components/counselors/chat/CounselorChatComposer";

const CounselorChatPage = () => {
  const [activeThread, setActiveThread] = useState<string | null>(null);

  const handleSend = (message: string) => {
    console.info("Sending message", message, "to", activeThread);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Student communications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage Mindscape chat, email, and SMS updates in one workspace.
              </p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          <Tabs defaultValue="messages" className="space-y-4">
            <TabsList className="rounded-xl bg-muted/30 p-1">
              <TabsTrigger value="messages" className="rounded-lg">
                Messages
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-lg">
                Session notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="messages" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
                <CounselorChatList activeThreadId={activeThread} onSelectThread={setActiveThread} />
                <div className="flex h-[520px] flex-col gap-4">
                  <CounselorChatThread threadId={activeThread} />
                  <CounselorChatComposer onSend={handleSend} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="notes">
              <Card className="rounded-3xl border-border/40 bg-muted/10 shadow-none">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Coming soon: Draft and share session summaries with students and referrals.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CounselorChatPage;