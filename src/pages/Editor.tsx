import { useState, useEffect, useRef } from "react";
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
  type: 'suggestion';
  payload: {
    id: string;
    range: { from: number; to: number };
    replacement: string;
    rule: 'Spelling' | 'Grammar' | 'Style';
    explanation: string;
  }
}

interface Selection {
  from: number;
  to: number;
  text: string;
}

function highlightSuggestions(content: string, suggestions: Suggestion['payload'][]) {
  let lastIndex = 0;
  const parts = [];
  
  // Sort suggestions by their start index to process them in order
  const sortedSuggestions = [...suggestions].sort((a, b) => a.range.from - b.range.from);

  sortedSuggestions.forEach(suggestion => {
    // Add the text before the current suggestion
    if (suggestion.range.from > lastIndex) {
      parts.push(content.slice(lastIndex, suggestion.range.from));
    }
    // Add the highlighted suggestion
    parts.push(
      `<span class="suggestion-underline ${suggestion.rule.toLowerCase()}">` +
      content.slice(suggestion.range.from, suggestion.range.to) +
      `</span>`
    );
    lastIndex = suggestion.range.to;
  });

  // Add the remaining text after the last suggestion
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return { __html: parts.join('') };
}

export default function Editor() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion['payload'][]>([]);
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (docId && user) {
      fetchDocument();
    }
  }, [docId, user]);
  
  useEffect(() => {
    if (!docId || !user) return;

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws.current?.close();
    };
  }, [docId, user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (ws.current?.readyState === WebSocket.OPEN && content && docId) {
        const message = {
          docId: docId,
          text: content,
        };
        console.log("Sending message to server:", message);
        ws.current.send(JSON.stringify(message));
      }
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [content, docId]);
  
  useEffect(() => {
    // Programmatically update the editor's innerHTML with highlights
    if (editorRef.current) {
      const highlightedHTML = highlightSuggestions(content, suggestions).__html;
      if (editorRef.current.innerHTML !== highlightedHTML) {
        // This update will not trigger the onInput event
        editorRef.current.innerHTML = highlightedHTML;
      }
    }
  }, [content, suggestions]);

  const connectWebSocket = () => {
    const currentSession = sessionRef.current;
    if (!currentSession?.access_token) {
      console.error('No access token available');
      return;
    }

    try {
      setConnectionStatus('connecting');
      // Include the JWT token as a query parameter
      const wsUrl = `wss://askleo-api.fly.dev/suggest?token=${encodeURIComponent(currentSession.access_token)}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connection established");
        setConnectionStatus('connected');
        setSuggestions([]);
        reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as Suggestion | { type: 'error' | 'complete', payload: { message: string } };
          
          if (message.type === 'suggestion') {
            setSuggestions(prev => {
              if (!prev.find(s => s.id === message.payload.id)) {
                return [...prev, message.payload];
              }
              return prev;
            });
          } else if (message.type === 'error') {
            console.error("Suggestion error:", message.payload.message);
            toast({
              title: "Analysis Error",
              description: message.payload.message,
              variant: "destructive",
            });
            setIsAnalyzing(false);
          } else if (message.type === 'complete') {
            console.log("Analysis complete");
            setIsAnalyzing(false);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          setIsAnalyzing(false);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus('error');
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket connection closed", event.code, event.reason);
        setConnectionStatus('disconnected');
        
        if (event.code === 1008) {
          toast({
            title: "Authentication Error",
            description: "Please refresh the page and try again.",
            variant: "destructive",
          });
          return;
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        } else {
          toast({
            title: "Connection Lost",
            description: "Unable to reconnect to the suggestions service. Please refresh the page.",
            variant: "destructive",
          });
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setConnectionStatus('error');
    }
  };

  const handleSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const text = selection.toString();
      
      // Note: This range is relative to the DOM, not a simple string index.
      // For a contentEditable div, a more complex mapping would be needed
      // to get precise start/end indices if we needed to send a fragment.
      // For now, we analyze the whole text on any selection.
      setCurrentSelection({ from: 0, to: text.length, text });
    } else {
      setCurrentSelection(null);
    }
  };

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

  const analyzeSelection = () => {
    if (!currentSelection || ws.current?.readyState !== WebSocket.OPEN || !docId) {
      return;
    }
    const message = {
      docId,
      text: currentSelection.text,
    };
    setIsAnalyzing(true);
    setSuggestions([]);
    ws.current.send(JSON.stringify(message));
    setShowSuggestions(true); // Automatically open suggestion panel
  };

  const applySuggestion = (suggestion: Suggestion['payload']) => {
    const { from, to } = suggestion.range;
    const newContent = content.slice(0, from) + suggestion.replacement + content.slice(to);
    
    setContent(newContent);
    setSuggestions([]);
    
    toast({
      title: "Suggestion applied",
      description: "The text has been updated.",
    });
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
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

                {/* Connection Status Indicator */}
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' :
                    connectionStatus === 'error' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-[var(--color-text-secondary)]">
                    {connectionStatus === 'connected' ? 'Connected' :
                     connectionStatus === 'connecting' ? 'Connecting...' :
                     connectionStatus === 'error' ? 'Connection Error' :
                     'Disconnected'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={currentSelection ? analyzeSelection : () => setShowSuggestions(!showSuggestions)}
                  className="border-[var(--color-muted-border)]"
                >
                  {currentSelection ? "Analyze Selection" : `Suggestions (${suggestions.length})`}
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
            <div className="max-w-4xl mx-auto relative">
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setContent(e.currentTarget.innerText)}
                suppressContentEditableWarning={true}
                className="min-h-[600px] border-none shadow-none resize-none focus-visible:ring-0 text-base leading-relaxed bg-transparent p-2 outline-none"
              >
              </div>
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
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Analyzing your text...
                  </p>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="border-[var(--color-muted-border)]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        {suggestion.rule === 'Grammar' && (
                          <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
                        )}
                        {suggestion.rule === 'Spelling' && (
                          <AlertCircle className="h-3 w-3 text-[var(--color-danger)]" />
                        )}
                        {suggestion.rule === 'Style' && (
                          <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
                        )}
                        <span className="text-sm font-medium capitalize text-[var(--color-text-primary)]">
                          {suggestion.rule}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="text-sm">
                          <div className="text-[var(--color-text-secondary)] mb-1">Original:</div>
                          <code className="bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded text-red-800 dark:text-red-300">
                            {content.slice(suggestion.range.from, suggestion.range.to)}
                          </code>
                        </div>
                        
                        <div className="text-sm">
                          <div className="text-[var(--color-text-secondary)] mb-1">Suggested:</div>
                          <code className="bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded text-green-800 dark:text-green-300">
                            {suggestion.replacement}
                          </code>
                        </div>
                        
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          {suggestion.explanation}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => dismissSuggestion(suggestion.id)}
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
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
