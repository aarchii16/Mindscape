import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Heart,
  Shield,
  Phone,
  AlertCircle,
  Lightbulb,
  Smile,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth, API_BASE } from "@/lib/api";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  category?: 'support' | 'urgent' | 'tip';
}

const initialMessages: Message[] = [];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetchWithAuth(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse: Message = {
          id: data.data.id || Date.now().toString(),
          type: 'bot',
          content: data.data.message,
          timestamp: new Date(data.data.timestamp || Date.now()),
          category: data.data.category || 'support'
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };


  const quickActions = [
    { text: "I'm feeling anxious", icon: AlertCircle },
    { text: "I need coping strategies", icon: Lightbulb },
    { text: "I'm having a good day", icon: Smile },
    { text: "I want to book a session", icon: Phone },
  ];

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card mb-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 mr-3">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MindscapeAI is here for you!</h1>
              <p className="text-muted-foreground">Safe, confidential, available 24/7</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="glass">
              <Shield className="w-3 h-3 mr-1" />
              Confidential
            </Badge>
            <Badge variant="secondary" className="glass">
              <Heart className="w-3 h-3 mr-1" />
              Stigma-Free
            </Badge>
            <Badge variant="secondary" className="glass">
              <Phone className="w-3 h-3 mr-1" />
              Crisis Support Available
            </Badge>
          </div>
        </div>

        {/* Chat Container */}
        <div className="glass-card h-[90vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                )}
              >
                <div className={cn(
                  "p-2 rounded-full",
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : message.category === 'urgent'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl whitespace-pre-line",
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : message.category === 'urgent'
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {message.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-border/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs glass hover-glass"
                  onClick={() => setInputValue(action.text)}
                >
                  <action.icon className="w-3 h-3 mr-1" />
                  {action.text}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message here..."
                className="glass border-border/30"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage} 
                size="sm"
                className="rounded-xl hover-glass"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass-card mt-6 text-center text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mx-auto mb-2 text-warning" />
          <p>
            This AI provides general wellness support and is not a replacement for professional therapy. 
            If you're in crisis, please contact emergency services or a crisis helpline immediately.
          </p>
        </div>
      </div>
    </div>
  );
}