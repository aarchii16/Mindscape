import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  Calendar, 
  Shield, 
  Heart,
  ArrowRight,
  Sparkles
} from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-up">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium glass">
            <Sparkles className="w-4 h-4 mr-2" />
            Free & Confidential Mental Health Support
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Mental Health
            <br />
            <span className="gradient-text animate-glow">Matters Most</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            A safe, stigma-free digital platform designed specifically for students. 
            Get AI-powered support, connect with counselors, and join a caring community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/chat">
              <Button size="lg" className="rounded-2xl px-8 py-6 text-lg group hover-glass">
                <MessageSquare className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start AI Chat Support
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link to="/booking">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-2xl px-8 py-6 text-lg glass border-primary/30 hover:border-primary/50"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book a Session
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card hover-glass">
              <Shield className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">100% Confidential</h3>
              <p className="text-sm text-muted-foreground">
                Your privacy is our priority. Anonymous options available.
              </p>
            </div>

            <div className="glass-card hover-glass">
              <Heart className="w-8 h-8 text-secondary-dark mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Stigma-Free Zone</h3>
              <p className="text-sm text-muted-foreground">
                A welcoming space designed to reduce mental health stigma.
              </p>
            </div>

            <div className="glass-card hover-glass">
              <Sparkles className="w-8 h-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Available 24/7</h3>
              <p className="text-sm text-muted-foreground">
                Support when you need it most, any time of day or night.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-8 border-t border-border/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-dark">100%</div>
                <div className="text-sm text-muted-foreground">Confidential</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">Free</div>
                <div className="text-sm text-muted-foreground">For Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-light">Safe</div>
                <div className="text-sm text-muted-foreground">Environment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};