import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { UserPlus, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SearchUsersDropdownProps {
  onSendRequest: (args: { friendId: any }) => Promise<any>;
}

export function SearchUsersDropdown({ onSendRequest }: SearchUsersDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery]);

  const searchResults = useQuery(
    api.friends.searchUsers,
    debouncedQuery.trim().length >= 2 ? { query: debouncedQuery.trim() } : "skip",
  );

  const handleSendRequest = async (friendId: any) => {
    setSendingId(friendId);
    try {
      await onSendRequest({ friendId });
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to send request:", error);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="relative">
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name..."
        className="bg-background"
      />
      {searchQuery.trim().length >= 2 && searchResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {searchResults.map((result) => (
            <div
              key={result._id}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-serif font-bold">
                  {(result.displayName || result.name || "?")[0].toUpperCase()}
                </div>
                <span className="text-sm text-foreground">
                  {result.displayName || result.name}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSendRequest(result._id)}
                disabled={sendingId === result._id}
                className="h-7 px-2 text-xs"
              >
                {sendingId === result._id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
      {searchQuery.trim().length >= 2 && searchResults && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 p-3 text-center">
          <p className="text-xs text-muted-foreground">No students found</p>
        </div>
      )}
      {searchQuery.trim().length >= 2 && searchResults === undefined && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 p-3 text-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />
        </div>
      )}
    </div>
  );
}
