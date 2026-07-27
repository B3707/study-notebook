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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { BookOpen, Camera, Loader2, Save, Trash2, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user } = useAuth();
  const updateProfile = useMutation(api.profile.update);
  const generateUploadUrl = useMutation(api.profile.generateUploadUrl);

  const profilePictureStorageId = (user as any)?.profilePicture;
  const profilePictureUrl = useQuery(
    api.profile.getImageUrl,
    { storageId: profilePictureStorageId || undefined }
  );

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImageUrl = previewUrl || profilePictureUrl || null;

  useEffect(() => {
    if (open && user) {
      setDisplayName((user as any).displayName || "");
      setBio((user as any).bio || "");
      setPreviewUrl(null);
    }
  }, [open, user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to Convex storage
    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateProfile({ profilePicture: storageId });
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    setPreviewUrl(null);
    setIsSaving(true);
    try {
      await updateProfile({ profilePicture: "" });
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="w-20 h-20 ring-2 ring-border/40 ring-offset-2 ring-offset-background">
                <AvatarImage
                  src={currentImageUrl || undefined}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-serif font-bold text-xl">
                  {(displayName || user?.name || user?.email || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Overlay on hover */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 rounded-full bg-foreground/0 hover:bg-foreground/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                {currentImageUrl ? "Change" : "Upload Photo"}
              </Button>
              {currentImageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePicture}
                  disabled={isUploading}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>

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
              <Avatar className="w-10 h-10 ring-2 ring-border/30 flex-shrink-0">
                <AvatarImage
                  src={currentImageUrl || undefined}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-serif font-bold text-sm">
                  {(displayName || user?.name || user?.email || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
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
