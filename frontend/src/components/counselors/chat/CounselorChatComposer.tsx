import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";

interface CounselorChatComposerProps {
  onSend: (message: string) => void;
}

const CounselorChatComposer = ({ onSend }: CounselorChatComposerProps) => {
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };


};

export default CounselorChatComposer;