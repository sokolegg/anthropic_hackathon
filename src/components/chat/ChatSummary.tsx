import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatSummaryProps {
  summary: string | null;
  loading: boolean;
}

export function ChatSummary({ summary, loading }: ChatSummaryProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        No summary available yet. Start a conversation to generate a summary.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 prose dark:prose-invert">
        <h3 className="text-lg font-semibold mb-4">Conversation Summary</h3>
        <div className="text-sm">{summary}</div>
      </div>
    </ScrollArea>
  );
}