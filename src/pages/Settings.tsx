
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { User, CreditCard, Shield, Bell } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  role: string;
  tier: string;
  settings: any;
}

const roles = [
  { value: "MD", label: "Medical Doctor (MD)" },
  { value: "RN", label: "Registered Nurse (RN)" },
  { value: "Researcher", label: "Medical Researcher" },
  { value: "Scribe", label: "Medical Scribe" },
];

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setSelectedRole(data.role);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: selectedRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, role: selectedRole } : null);
      
      toast({
        title: "Profile updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-[var(--color-text-primary)]">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Settings
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Manage your account preferences and subscription
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="border-[var(--color-muted-border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your professional information and role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="mt-1 p-3 bg-[var(--color-surface)] rounded-md text-[var(--color-text-secondary)]">
                    {profile?.email}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tier">Current Plan</Label>
                  <div className="mt-1">
                    <Badge 
                      className={profile?.tier === 'pro' 
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }
                    >
                      {profile?.tier === 'pro' ? 'Professional' : 'Free'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="role">Professional Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={updateProfile}
                  disabled={saving || selectedRole === profile?.role}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Settings */}
          <Card className="border-[var(--color-muted-border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-lg">
                  <div>
                    <h3 className="font-medium text-[var(--color-text-primary)]">
                      {profile?.tier === 'pro' ? 'Professional Plan' : 'Free Plan'}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {profile?.tier === 'pro' 
                        ? 'Advanced AI suggestions, unlimited documents, priority support'
                        : 'Basic AI suggestions, up to 10 documents per month'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[var(--color-text-primary)]">
                      {profile?.tier === 'pro' ? '$29/month' : 'Free'}
                    </div>
                  </div>
                </div>
                
                {profile?.tier === 'free' && (
                  <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90">
                    Upgrade to Professional
                  </Button>
                )}
                
                {profile?.tier === 'pro' && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Manage Billing
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Cancel Subscription
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-[var(--color-muted-border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage your account security and data privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)]">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">
                    Enable 2FA
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)]">
                      Change Password
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-[var(--color-muted-border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Notification settings will be available in a future update.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
