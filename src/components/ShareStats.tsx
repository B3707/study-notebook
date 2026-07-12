import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  Share2,
  Download,
  Twitter,
  CheckCheck,
  Loader2,
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  Sparkles,
} from "lucide-react";

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return h >= 100 ? `${h}h` : `${h}h ${m}m`;
  }
  return `${m}m`;
}

export function ShareStats() {
  const { user } = useAuth();
  const stats = useQuery(api.studySessions.getStats);
  const subjects = useQuery(api.subjects.list);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalMinutes = stats?.totalMinutes ?? 0;
  const sessionCount = stats?.totalSessions ?? 0;
  const subjectCount = subjects?.length ?? 0;
  const displayName = (user as any)?.displayName || user?.name || user?.email || "Student";
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const achievedCount = stats?.sessionsBySubject?.length ?? 0;

  const shareText =
    `📚 Study Notebook Report\n\n` +
    `👤 ${displayName}\n` +
    `⏱️ Total Study Time: ${formatTime(totalMinutes)}\n` +
    `📝 Sessions: ${sessionCount}\n` +
    `📖 Subjects: ${subjectCount}\n\n` +
    `Track your study journey at Study Notebook! 📓✨`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#FAF6F0",
      });
      const link = document.createElement("a");
      link.download = `study-progress-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share && cardRef.current) {
        try {
          const dataUrl = await toPng(cardRef.current, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: "#FAF6F0",
          });
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "study-progress.png", { type: "image/png" });

          await navigator.share({
            title: "My Study Progress",
            text: shareText,
            files: [file],
          });
        } catch {
          // Fallback if file sharing not supported
          await navigator.share({
            title: "My Study Progress",
            text: shareText,
          });
        }
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="notebook-card rounded-xl overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-semibold text-foreground flex items-center gap-2">
            <Share2 className="h-4 w-4 text-accent" />
            Share Your Progress
          </h3>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading || totalMinutes === 0}
              className="h-8 px-2.5 text-xs gap-1.5"
              title="Download as PNG"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              PNG
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(twitterUrl, "_blank", "noopener,noreferrer")}
              disabled={totalMinutes === 0}
              className="h-8 px-2.5 text-xs gap-1.5"
              title="Share on X (Twitter)"
            >
              <Twitter className="h-3.5 w-3.5" />
              X
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={isSharing || totalMinutes === 0}
              className="h-8 px-2.5 text-xs gap-1.5"
              title={copied ? "Copied!" : "Share or copy"}
            >
              {isSharing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : copied ? (
                <CheckCheck className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Card Preview */}
      <div className="px-5 pb-5">
        <div
          ref={cardRef}
          className="rounded-xl overflow-hidden border border-border/40"
          style={{
            background: "#FAF6F0",
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 31px,
                rgba(183, 28, 28, 0.06) 31px,
                rgba(183, 28, 28, 0.06) 31.5px
              )
            `,
          }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-3" style={{ background: "linear-gradient(135deg, #FAF6F0 0%, #F5EDE0 100%)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: "#8B7355" }}>
                  Study Notebook
                </p>
                <h2 className="text-xl font-bold font-serif mt-1" style={{ color: "#2C1810" }}>
                  {displayName}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                  Study Progress Report
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: "#B71C1C15" }}>
                📓
              </div>
            </div>
          </div>

          {/* Ruled line divider */}
          <div className="h-px mx-6" style={{ background: "linear-gradient(to right, transparent, #B71C1C30, transparent)" }} />

          {/* Stats Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Main stat: Total Time */}
            <div className="text-center py-3">
              <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "#B71C1C" }}>
                Total Study Time
              </p>
              <p className="text-4xl font-bold font-serif tracking-tight" style={{ color: "#2C1810" }}>
                {totalHours >= 100
                  ? `${Math.floor(totalMinutes / 60)}h`
                  : totalHours >= 1
                    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                    : `${totalMinutes}m`}
              </p>
              <p className="text-xs mt-1 italic" style={{ color: "#8B7355" }}>
                across {sessionCount} session{sessionCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="text-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: "#B71C1C10" }}>
                  <Clock className="h-4 w-4" style={{ color: "#B71C1C" }} />
                </div>
                <p className="text-sm font-bold font-serif" style={{ color: "#2C1810" }}>
                  {formatTime(totalMinutes)}
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#8B7355" }}>
                  Time
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: "#B71C1C10" }}>
                  <TrendingUp className="h-4 w-4" style={{ color: "#B71C1C" }} />
                </div>
                <p className="text-sm font-bold font-serif" style={{ color: "#2C1810" }}>
                  {sessionCount}
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#8B7355" }}>
                  Sessions
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: "#B71C1C10" }}>
                  <BookOpen className="h-4 w-4" style={{ color: "#B71C1C" }} />
                </div>
                <p className="text-sm font-bold font-serif" style={{ color: "#2C1810" }}>
                  {subjectCount}
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#8B7355" }}>
                  Subjects
                </p>
              </div>
            </div>

            {/* Subject breakdown if available */}
            {stats && stats.sessionsBySubject.length > 0 && (
              <div className="pt-1 pb-2">
                <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: "#8B7355" }}>
                  Time by Subject
                </p>
                <div className="space-y-1.5">
                  {stats.sessionsBySubject.slice(0, 4).map((item) => (
                    <div key={item.subjectName} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.subjectColor }}
                      />
                      <span className="text-xs flex-1 truncate" style={{ color: "#2C1810" }}>
                        {item.subjectName}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "#8B7355" }}>
                        {formatTime(item.minutes)}
                      </span>
                    </div>
                  ))}
                  {stats.sessionsBySubject.length > 4 && (
                    <p className="text-[10px] text-center italic pt-1" style={{ color: "#8B7355" }}>
                      + {stats.sessionsBySubject.length - 4} more subjects
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-dashed" style={{ borderColor: "#B71C1C20" }}>
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3" style={{ color: "#B71C1C" }} />
              <p className="text-[10px] italic font-serif" style={{ color: "#8B7355" }}>
                Generated with Study Notebook
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
