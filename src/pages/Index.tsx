import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Stethoscope,
  Brain,
  Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect } from "react";

const features = [
  {
    icon: <Stethoscope className="h-6 w-6" />,
    title: "Medical-Grade Accuracy",
    description: "Built specifically for healthcare professionals with medical terminology and context awareness."
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI-Powered Suggestions",
    description: "Real-time grammar, style, and medical terminology suggestions as you type."
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Document Templates",
    description: "SOAP notes, research papers, and EHR addendum templates designed for efficiency."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security ensuring your medical documents remain private and secure."
  }
];

const roles = [
  { role: "Medical Doctors", description: "Streamline your clinical documentation" },
  { role: "Registered Nurses", description: "Enhanced patient care documentation" },
  { role: "Medical Researchers", description: "Precise academic and research writing" },
  { role: "Medical Scribes", description: "Efficient and accurate medical transcription" }
];

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-[var(--color-text-primary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="border-b border-[var(--color-muted-border)] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Askleo</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="border-[var(--color-muted-border)]"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20">
            Medical Writing Assistant
          </Badge>
          
          <h1 className="text-5xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
            Write Better Medical Documents with 
            <span className="text-[var(--color-primary)]"> AI Precision</span>
          </h1>
          
          <p className="text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Askleo is the medical-grade writing assistant designed for healthcare professionals. 
            Get real-time suggestions for SOAP notes, research papers, and clinical documentation.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-lg px-8"
            >
              Start Writing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 border-[var(--color-muted-border)]"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Built for Medical Professionals
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Every feature is designed with healthcare workflows and medical accuracy in mind.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-[var(--color-muted-border)] bg-[var(--color-background)]">
                <CardHeader>
                  <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-[var(--color-primary)]">{feature.icon}</span>
                  </div>
                  <CardTitle className="text-lg text-[var(--color-text-primary)]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[var(--color-text-secondary)]">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              From clinical practice to medical research, Askleo adapts to your specialty.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-lg border border-[var(--color-muted-border)]">
                <div className="w-6 h-6 bg-[var(--color-accent)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                    {item.role}
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-[var(--color-primary)] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Medical Writing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust Askleo for their clinical documentation.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-white text-[var(--color-primary)] hover:bg-gray-100 text-lg px-8"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-muted-border)] px-6 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[var(--color-text-secondary)]">
            © 2024 Askleo. Built for healthcare professionals, by healthcare professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
