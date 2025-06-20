
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
    }
  };

  if (!user) return null;

  return (
    <header className="border-b border-[var(--color-muted-border)] bg-[var(--color-background)] px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 
            className="text-xl font-semibold text-[var(--color-text-primary)] cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            Askleo
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
