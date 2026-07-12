import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Sparkles, Heart } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3 shadow-sm">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="font-serif text-xl">Study Notebook</DialogTitle>
          <DialogDescription className="handwriting">
            Your personal academic companion
          </DialogDescription>
        </DialogHeader>

        <hr className="notebook-divider my-1" />

        <div className="space-y-3 py-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Version
            </p>
            <p className="text-sm text-foreground font-mono">1.0.0</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Built With
            </p>
            <p className="text-sm text-foreground">
              React &middot; Convex &middot; Tailwind
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <Sparkles className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              A beautifully simple notebook-style study tracker. Track your study hours,
              manage assignments, and watch your progress grow.
            </p>
          </div>
        </div>

        <hr className="notebook-divider my-1" />

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1 pb-2">
          <span>Made with</span>
          <Heart className="h-3.5 w-3.5 text-accent fill-accent" />
          <span>by the Study Notebook team</span>
        </div>

        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full border-2"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
