import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  artifacts?: Array<{
    type: string;
    content: string;
  }>;
}

export function ChatMessage({ role, content, artifacts }: ChatMessageProps) {
  return (
    <div className={cn(
      "py-8 first:pt-0 last:pb-0",
      role === "assistant" && "bg-muted/50"
    )}>
      <div className="container max-w-3xl mx-auto px-4">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground shrink-0">
            {role === "user" ? "U" : "A"}
          </div>
          <div className="flex-1 space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              {content}
            </div>
            {artifacts && artifacts.length > 0 && (
              <div className="mt-4 space-y-2">
                {artifacts.map((artifact, index) => (
                  <div key={index} className="bg-card p-4 rounded-lg border">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {artifact.type}
                    </div>
                    <pre className="text-sm bg-muted p-2 rounded overflow-x-auto">
                      <code>{artifact.content}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}