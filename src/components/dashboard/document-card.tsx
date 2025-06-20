
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface DocumentCardProps {
  document: Document;
  onOpen: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ document, onOpen, onDelete }: DocumentCardProps) {
  const wordCount = document.content.split(/\s+/).filter(word => word.length > 0).length;
  const preview = document.content.slice(0, 120) + (document.content.length > 120 ? "..." : "");

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SOAP": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Research": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "EHR Addendum": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer border-[var(--color-muted-border)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <Badge className={getTypeColor(document.type)} variant="secondary">
              {document.type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle 
          className="text-lg font-medium text-[var(--color-text-primary)] line-clamp-2 cursor-pointer"
          onClick={() => onOpen(document.id)}
        >
          {document.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription 
          className="text-[var(--color-text-secondary)] line-clamp-3 mb-4 cursor-pointer"
          onClick={() => onOpen(document.id)}
        >
          {preview || "Start writing your document..."}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
