import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageSquare,
  Calendar,
  BookOpen,
  Users,
  Menu,
  X,
  Moon,
  Sun,
  User,
  ClipboardList,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchMe, getCachedUser, getToken, logout } from "@/lib/auth";

export const Navigation = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthed = !!getToken();
  const user = getCachedUser();

  const studentNavigationItems = [
    { name: "Home", href: "/", icon: Heart, requireAuth: false },
    { name: "AI Support", href: "/chat", icon: MessageSquare, requireAuth: false },
    { name: "Book Session", href: "/booking", icon: Calendar, requireAuth: true },
    { name: "Resources", href: "/resources", icon: BookOpen, requireAuth: false },
    { name: "Community", href: "/forum", icon: Users, requireAuth: true },
    { name: "Self Assessment", href: "/assessments", icon: ClipboardList, requireAuth: true },
  ];

  const counselorNavigationItems = [
    { name: "Dashboard", href: "/counselor/dashboard", icon: Heart, requireAuth: true },
    { name: "Profile", href: "/counselor/onboarding", icon: User, requireAuth: true },
    { name: "Availability", href: "/counselor/availability", icon: Calendar, requireAuth: true },
    { name: "Bookings", href: "/counselor/bookings", icon: ClipboardList, requireAuth: true },
    { name: "Messages", href: "/counselor/chat", icon: MessageSquare, requireAuth: true },
  ];

  const navigationItems = user?.role === 'counselor' ? counselorNavigationItems : studentNavigationItems;

  // Initialize user from cache or API if token exists
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        setDisplayName(null);
        return;
      }
      const cached = getCachedUser();
      if (cached) {
        setDisplayName(cached.firstName || cached.username || cached.email);
      } else {
        const me = await fetchMe();
        if (me) setDisplayName(me.firstName || me.username || me.email);
      }
    };
    init();
  }, [location.pathname]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await logout();
    setDisplayName(null);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/logo.png" alt="Mindscape logo" className="h-8 w-8 rounded-md object-contain" />
            <div>
              <span className="text-xl font-bold gradient-text">Mindscape</span>
              <p className="text-xs text-muted-foreground">Student Wellness</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems
              .filter((item) => (item.requireAuth ? isAuthed : true))
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center space-x-2 hover-glass rounded-xl",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
          </div>

          {/* Auth & Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2">
            {displayName ? (
              <div className="hidden sm:flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-xl hover-glass">
                      <span className="text-sm text-muted-foreground">Welcome, <span className="font-medium">{displayName}</span></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link to="/biometrics">
                      <DropdownMenuItem className="cursor-pointer">Your Vitals</DropdownMenuItem>
                    </Link>
                    <Link to={user?.role === 'student' ? '/student/chat' : '/counselor/chat'}>
                      <DropdownMenuItem className="cursor-pointer">Your Messages</DropdownMenuItem>
                    </Link>
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">Your Profile</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>Log Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl hover-glass border-primary/20 text-primary hover:bg-primary/10"
                >
                  Sign In
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="rounded-xl hover-glass"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden rounded-xl"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileOpen && (
        <div className="md:hidden glass-card m-4 animate-fade-up">
          <div className="space-y-2 p-4">
            {navigationItems
              .filter((item) => (item.requireAuth ? isAuthed : true))
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href} onClick={() => setIsMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start space-x-3 rounded-xl hover-glass",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            
            {/* Mobile Auth Button */}
            {displayName ? (
              <Button
                variant="outline"
                className="w-full justify-start space-x-3 rounded-xl hover-glass border-primary/20 text-primary hover:bg-primary/10"
                onClick={() => { handleLogout(); setIsMobileOpen(false); }}
              >
                <span>Log Out</span>
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setIsMobileOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-start space-x-3 rounded-xl hover-glass border-primary/20 text-primary hover:bg-primary/10"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};