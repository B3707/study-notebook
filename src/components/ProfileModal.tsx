import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { BookOpen, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user } = useAuth();
  const updateProfile = useMutation(api.profile.update);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setDisplayName((user as any).displayName || "");
      setBio((user as any).bio || "");
    }
  }, [open, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            Your Profile
          </DialogTitle>
          <DialogDescription>
            Customize how you appear in Study Notebook
          </DialogDescription>
        </DialogHeader>

        <hr className="notebook-divider my-2" />

        <div className="space-y-4">
          {/* Username (read-only) */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
              Username
            </label>
            <Input
              value={user?.email || user?.name || ""}
              disabled
              className="bg-secondary/50 text-muted-foreground"
            />
            <p className="text-[10px] text-muted-foreground/60 mt-1 handwriting">
              Your username is permanent
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="bg-background"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about yourself..."
              className="bg-background resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">
              {bio.length}/200
            </p>
          </div>

          {/* Stats preview */}
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
              Profile Preview
            </p>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-sm flex-shrink-0">
                {(displayName || user?.name || user?.email || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName || user?.name || user?.email || "Student"}
                </p>
                {bio && (
                  <p className="text-xs text-muted-foreground mt-0.5 handwriting leading-relaxed">
                    {bio}
                  </p>
                )}
                {!bio && (
                  <p className="text-xs text-muted-foreground/50 mt-0.5 handwriting italic">
                    No bio yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
