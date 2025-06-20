
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { 
  Save, 
  ArrowLeft, 
  FileText, 
  Clock,
  CheckCircle,
  X,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface Suggestion {
  id: string;
  type: 'grammar' | 'spelling' | 'style';
  range: { start: number; end: number };
  replacement: string;
  original: string;
}

export default function Editor() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mockSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      type: "grammar",
      range: { start: 45, end: 52 },
      replacement: "patient's",
      original: "patients"
    },
    {
      id: "2", 
      type: "style",
      range: { start: 98, end: 115 },
      replacement: "presented with",
      original: "came in with"
    }
  ]);

  useEffect(() => {
    if (docId && user) {
      fetchDocument();
    }
  }, [docId, user]);

  const fetchDocument = async () => {
    if (!docId) return;

    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", docId)
        .single();

      if (error) throw error;
      
      setDocument(data);
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error("Error fetching document:", error);
      toast({
        title: "Error loading document",
        description: "Please try again.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!docId || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("documents")
        .update({
          title: title || "Untitled Document",
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", docId);

      if (error) throw error;

      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully.",
      });

      // Update local document state
      setDocument(prev => prev ? {
        ...prev,
        title: title || "Untitled Document",
        content,
        updated_at: new Date().toISOString()
      } : null);
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error saving document",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SOAP": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Research": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "EHR Addendum": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-[var(--color-text-primary)]">Loading document...</div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FileText className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              Document not found
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              The document you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      
      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="border-b border-[var(--color-muted-border)] px-6 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="text-[var(--color-text-secondary)]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <Badge className={getTypeColor(document.type)} variant="secondary">
                  {document.type}
                </Badge>
                
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last saved {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="border-[var(--color-muted-border)]"
                >
                  Suggestions ({mockSuggestions.length})
                </Button>
                
                <Button
                  onClick={saveDocument}
                  disabled={saving}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="px-6 py-4 border-b border-[var(--color-muted-border)]">
            <div className="max-w-4xl mx-auto">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title..."
                className="text-2xl font-semibold border-none px-0 shadow-none focus-visible:ring-0 bg-transparent"
              />
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 px-6 py-6">
            <div className="max-w-4xl mx-auto">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your medical document..."
                className="min-h-[600px] border-none shadow-none resize-none focus-visible:ring-0 text-base leading-relaxed bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        {showSuggestions && (
          <div className="w-80 border-l border-[var(--color-muted-border)] bg-[var(--color-surface)]">
            <div className="p-4 border-b border-[var(--color-muted-border)]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--color-text-primary)]">
                  Writing Suggestions
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {mockSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-[var(--color-muted-border)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {suggestion.type === 'grammar' && (
                        <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
                      )}
                      {suggestion.type === 'spelling' && (
                        <AlertCircle className="h-3 w-3 text-[var(--color-danger)]" />
                      )}
                      {suggestion.type === 'style' && (
                        <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
                      )}
                      <span className="text-sm font-medium capitalize text-[var(--color-text-primary)]">
                        {suggestion.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="text-[var(--color-text-secondary)] mb-1">Original:</div>
                        <code className="bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded text-red-800 dark:text-red-300">
                          {suggestion.original}
                        </code>
                      </div>
                      
                      <div className="text-sm">
                        <div className="text-[var(--color-text-secondary)] mb-1">Suggested:</div>
                        <code className="bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded text-green-800 dark:text-green-300">
                          {suggestion.replacement}
                        </code>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {mockSuggestions.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-[var(--color-accent)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    No suggestions at the moment. Great writing!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
