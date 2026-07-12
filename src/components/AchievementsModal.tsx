import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Trophy,
  Clock,
  Target,
  Loader2,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

interface AchievementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<string, string> = {
  time: "Time-Based Milestones",
  efficiency: "Efficiency & Subject Focus",
};

const categoryIcons: Record<string, React.ElementType> = {
  time: Clock,
  efficiency: Target,
};

export function AchievementsModal({ open, onOpenChange }: AchievementsModalProps) {
  const achievements = useQuery(api.achievements.list);
  const earnedCount = achievements?.filter((a) => a.earned).length ?? 0;
  const totalCount = 14;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Achievements
          </DialogTitle>
          <DialogDescription>
            Study milestones & challenges you've conquered
          </DialogDescription>
        </DialogHeader>

        <hr className="notebook-divider my-2" />

        {/* Overall Progress */}
        <div className="notebook-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Progress
            </span>
            <span className="text-sm font-serif font-bold text-accent">
              {achievements === undefined ? (
                <Loader2 className="h-4 w-4 animate-spin inline" />
              ) : (
                `${earnedCount} / ${totalCount}`
              )}
            </span>
          </div>
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: achievements
                  ? `${(earnedCount / totalCount) * 100}%`
                  : "0%",
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-accent"
            />
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1.5 handwriting">
            {achievements && earnedCount === 0
              ? "Start studying to earn your first achievement!"
              : achievements && earnedCount === totalCount
                ? "All achievements unlocked! You're a true scholar! 🎓"
                : `${totalCount - earnedCount} more to go!`}
          </p>
        </div>

        {achievements === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Time-Based Milestones */}
            {(["time", "efficiency"] as const).map((category) => {
              const catAchievements = achievements.filter(
                (a) => a.category === category,
              );
              const catEarned = catAchievements.filter((a) => a.earned).length;
              const CategoryIcon = categoryIcons[category];

              return (
                <div key={category} className="mb-5 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <CategoryIcon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-serif font-semibold text-foreground">
                        {categoryLabels[category]}
                      </h3>
                      <p className="text-[10px] text-muted-foreground/60 handwriting">
                        {catEarned} / {catAchievements.length} unlocked
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {catAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.2 }}
                        className={`rounded-xl p-3.5 border transition-all duration-300 ${
                          achievement.earned
                            ? "bg-accent/5 border-accent/20"
                            : "bg-secondary/30 border-border/40 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all duration-300 ${
                              achievement.earned
                                ? "bg-accent/15"
                                : "bg-secondary"
                            }`}
                          >
                            {achievement.earned ? (
                              achievement.icon
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground/50" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  achievement.earned
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {achievement.name}
                              </span>
                              {achievement.earned && (
                                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {achievement.description}
                            </p>
                          </div>

                          {/* Badge */}
                          {achievement.earned ? (
                            <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                              Earned
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-muted-foreground/50 bg-secondary px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                              Locked
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        <div className="flex items-center justify-end pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-sm"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
