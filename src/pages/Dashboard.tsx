
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { DocumentCard } from "@/components/dashboard/document-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Filter, FileText } from "lucide-react";

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error loading documents",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewDocument = async (type: string = "SOAP") => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: "Untitled Document",
          type,
          content: "",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Document created",
        description: "Your new document is ready for editing.",
      });

      navigate(`/editor/${data.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
      toast({
        title: "Error creating document",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-[var(--color-text-primary)]">Loading your documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Your Documents
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage and edit your medical documents
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select onValueChange={(value) => createNewDocument(value)}>
              <SelectTrigger className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-[var(--color-primary)]">
                <Plus className="h-4 w-4 mr-2" />
                <span>New Document</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOAP">SOAP Note</SelectItem>
                <SelectItem value="Research">Research Document</SelectItem>
                <SelectItem value="EHR Addendum">EHR Addendum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SOAP">SOAP Notes</SelectItem>
              <SelectItem value="Research">Research</SelectItem>
              <SelectItem value="EHR Addendum">EHR Addendum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <Card className="text-center py-12 border-[var(--color-muted-border)]">
            <CardContent>
              <FileText className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
              <CardTitle className="text-xl text-[var(--color-text-primary)] mb-2">
                {documents.length === 0 ? "No documents yet" : "No documents found"}
              </CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)] mb-6">
                {documents.length === 0 
                  ? "Create your first medical document to get started with Askleo."
                  : "Try adjusting your search or filter criteria."
                }
              </CardDescription>
              {documents.length === 0 && (
                <Button 
                  onClick={() => createNewDocument()}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onOpen={(id) => navigate(`/editor/${id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
