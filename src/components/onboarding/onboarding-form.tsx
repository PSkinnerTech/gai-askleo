
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const roles = [
  { value: "MD", label: "Medical Doctor (MD)" },
  { value: "RN", label: "Registered Nurse (RN)" },
  { value: "Researcher", label: "Medical Researcher" },
  { value: "Scribe", label: "Medical Scribe" },
];

const documentTypes = [
  { value: "SOAP", label: "SOAP Notes" },
  { value: "Research", label: "Research Documents" },
  { value: "EHR Addendum", label: "EHR Addendum" },
];

export function OnboardingForm() {
  const [role, setRole] = useState("");
  const [defaultDocType, setDefaultDocType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role,
          settings: { defaultDocumentType: defaultDocType || "SOAP" }
        })
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated!",
          description: "Welcome to Askleo. Let's start writing better medical documents.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[var(--color-text-primary)]">
            Welcome to Askleo
          </CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">
            Let's set up your profile to personalize your writing experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">What's your role?</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your professional role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="docType">What type of documents do you write most?</Label>
              <Select value={defaultDocType} onValueChange={setDefaultDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default document type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
              disabled={loading || !role}
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
