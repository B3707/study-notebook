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
  TrendingUp,
  Sparkles,
  Trophy,
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
        cacheBust: true,
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
        cacheBust: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "study-progress.png", { type: "image/png" });

          await navigator.share({
            title: "My Study Progress",
            text: shareText,
            files: [file],
          });
        } catch {
          await navigator.share({
            title: "My Study Progress",
            text: shareText,
          });
        }
      } else {
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

  const hasData = totalMinutes > 0;

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
              disabled={isDownloading || !hasData}
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
              disabled={!hasData}
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
              disabled={isSharing || !hasData}
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
        <p className="text-xs text-muted-foreground/60 mt-1 handwriting">
          1080×1920px · 9:16 · Perfect for stories & socials
        </p>
      </div>

      {/* Stats Card Preview - 9:16 ratio */}
      <div className="px-5 pb-5 overflow-x-auto">
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="flex-shrink-0 flex flex-col"
            style={{
              width: 540,
              height: 960,
              borderRadius: 16,
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
            {/* Top decorative stripe */}
            <div className="h-1.5 flex-shrink-0" style={{ background: "linear-gradient(90deg, #B71C1C, #D32F2F, #B71C1C)" }} />

            {/* Header */}
            <div className="px-7 pt-7 pb-4 flex-shrink-0" style={{ background: "linear-gradient(180deg, #FAF6F0 0%, rgba(250, 246, 240, 0) 100%)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: "#8B7355" }}>
                    Study Notebook
                  </p>
                  <h2 className="text-2xl font-bold font-serif mt-1 leading-tight" style={{ color: "#2C1810" }}>
                    {displayName}
                  </h2>
                  <p className="text-[11px] mt-0.5 italic font-serif" style={{ color: "#8B7355" }}>
                    Study Progress Report
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "#B71C1C12" }}>
                  📓
                </div>
              </div>
            </div>

            {/* Main stat hero */}
            <div className="flex-1 flex flex-col justify-center px-7 py-2">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: "#B71C1C10" }}>
                  <Clock className="h-3 w-3" style={{ color: "#B71C1C" }} />
                  <span className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: "#B71C1C" }}>
                    Total Study Time
                  </span>
                </div>
                <p className="text-5xl md:text-6xl font-bold font-serif tracking-tight leading-none" style={{ color: "#2C1810" }}>
                  {totalMinutes >= 60
                    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                    : `${totalMinutes}m`}
                </p>
                <p className="text-xs mt-3 italic font-serif" style={{ color: "#8B7355" }}>
                  across {sessionCount} session{sessionCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Grid stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 mx-auto w-full max-w-xs">
                <div className="text-center px-2 py-3 rounded-xl" style={{ background: "#B71C1C08" }}>
                  <p className="text-lg font-bold font-serif" style={{ color: "#2C1810" }}>
                    {formatTime(totalMinutes)}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "#8B7355" }}>
                    Time
                  </p>
                </div>
                <div className="text-center px-2 py-3 rounded-xl" style={{ background: "#B71C1C08" }}>
                  <p className="text-lg font-bold font-serif" style={{ color: "#2C1810" }}>
                    {sessionCount}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "#8B7355" }}>
                    Sessions
                  </p>
                </div>
                <div className="text-center px-2 py-3 rounded-xl" style={{ background: "#B71C1C08" }}>
                  <p className="text-lg font-bold font-serif" style={{ color: "#2C1810" }}>
                    {subjectCount}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "#8B7355" }}>
                    Subjects
                  </p>
                </div>
              </div>

              {/* Subject breakdown */}
              {stats && stats.sessionsBySubject.length > 0 && (
                <div className="mt-5 px-2">
                  <p className="text-[9px] uppercase tracking-[0.15em] font-medium mb-2 text-center" style={{ color: "#8B7355" }}>
                    Time by Subject
                  </p>
                  <div className="space-y-1.5 max-w-xs mx-auto">
                    {stats.sessionsBySubject.slice(0, 4).map((item, i) => (
                      <div key={item.subjectName} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.subjectColor }}
                        />
                        <span className="text-[11px] flex-1 truncate" style={{ color: "#2C1810" }}>
                          {item.subjectName}
                        </span>
                        <div className="flex-1 max-w-[100px] h-1.5 rounded-full overflow-hidden mx-2" style={{ background: "#B71C1C10" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(item.minutes / totalMinutes) * 100}%`,
                              backgroundColor: item.subjectColor,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "#8B7355" }}>
                          {formatTime(item.minutes)}
                        </span>
                      </div>
                    ))}
                    {stats.sessionsBySubject.length > 4 && (
                      <p className="text-[9px] text-center italic pt-1" style={{ color: "#8B7355" }}>
                        + {stats.sessionsBySubject.length - 4} more subjects
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 flex-shrink-0 border-t border-dashed flex items-center justify-between" style={{ borderColor: "#B71C1C20" }}>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" style={{ color: "#B71C1C" }} />
                <p className="text-[9px] italic font-serif" style={{ color: "#8B7355" }}>
                  Study Notebook
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-wider" style={{ color: "#B71C1C60" }}>
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-[6px] tracking-wider" style={{ color: "#B71C1C40" }}>
                  studynotebook.freebuff.app
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
