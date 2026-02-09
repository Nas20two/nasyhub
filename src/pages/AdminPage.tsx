import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import {
  Smartphone,
  Bot,
  Image,
  Music,
  FileText,
  Mail,
  LogOut,
  Menu,
  Moon,
  Sun,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Admin panels
import { AppsPanel } from "@/components/admin/AppsPanel";
import { PrototypesPanel } from "@/components/admin/PrototypesPanel";
import { GalleryPanel } from "@/components/admin/GalleryPanel";
import { MusicPanel } from "@/components/admin/MusicPanel";
import { MessagesPanel } from "@/components/admin/MessagesPanel";
import { ProfilePanel } from "@/components/admin/ProfilePanel";
import { ResumeRequestsPanel } from "@/components/admin/ResumeRequestsPanel";

const menuItems = [
  { id: "apps", label: "Apps", icon: Smartphone },
  { id: "prototypes", label: "AI Prototypes", icon: Bot },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "music", label: "Music", icon: Music },
  { id: "resume-requests", label: "Resume Requests", icon: ClipboardList },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "profile", label: "Profile & Resume", icon: FileText },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("apps");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const Sidebar = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-6 border-b border-border">
        <Link to="/" className="text-2xl font-display font-bold text-primary">
          NaSy Hub
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
              activeTab === item.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
          <span className="truncate">{user.email}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDark(!isDark)}
          className="w-full justify-start gap-3"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border hidden lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <Link to="/" className="text-xl font-display font-bold text-primary">
          NaSy Hub
        </Link>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">
          {activeTab === "apps" && <AppsPanel />}
          {activeTab === "prototypes" && <PrototypesPanel />}
          {activeTab === "gallery" && <GalleryPanel />}
          {activeTab === "music" && <MusicPanel />}
          {activeTab === "resume-requests" && <ResumeRequestsPanel />}
          {activeTab === "messages" && <MessagesPanel />}
          {activeTab === "profile" && <ProfilePanel />}
        </div>
      </main>
    </div>
  );
}
