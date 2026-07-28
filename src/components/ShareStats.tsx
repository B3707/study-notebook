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
  Image,
} from "lucide-react";

type Ratio = "9:16" | "4:5";

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return h >= 100 ? h + "h" : h + "h " + m + "m";
  }
  return m + "m";
}

const DIMS: Record<Ratio, { w: number; h: number; label: string }> = {
  "9:16": { w: 540, h: 960, label: "1080x1920px · Stories" },
  "4:5": { w: 540, h: 675, label: "1080x1350px · Feed" },
};

export function ShareStats() {
  const { user } = useAuth();
  const stats = useQuery(api.studySessions.getStats);
  const subjects = useQuery(api.subjects.list);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratio, setRatio] = useState<Ratio>("9:16");

  const totalMinutes = stats?.totalMinutes ?? 0;
  const sessionCount = stats?.totalSessions ?? 0;
  const subjectCount = subjects?.length ?? 0;
  const displayName = (user as any)?.displayName || user?.name || user?.email || "Student";

  const dims = DIMS[ratio];

  const shareText =
    "Clockocus Report\n\n" +
    displayName + "\n" +
    "Total Time: " + formatTime(totalMinutes) + "\n" +
    "Sessions: " + sessionCount + "\n" +
    "Subjects: " + subjectCount + "\n\n" +
    "clockocus.freebuff.app";

  const twitterUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText);

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
      link.download = "clockocus-progress-" + new Date().toISOString().split("T")[0] + "-" + ratio.replace(":", "x") + ".png";
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
          await navigator.share({ title: "My Study Progress", text: shareText, files: [file] });
        } catch {
          await navigator.share({ title: "My Study Progress", text: shareText });
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
  const isPortrait = ratio === "9:16";

  var statsGrid = [
    { value: formatTime(totalMinutes), label: "Total Time" },
    { value: sessionCount, label: "Sessions" },
    { value: subjectCount, label: "Subjects" },
  ];

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
              variant="ghost" size="sm"
              onClick={handleDownload}
              disabled={isDownloading || !hasData}
              className="h-8 px-2.5 text-xs gap-1.5"
              title="Download as PNG"
            >
              {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              PNG
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={() => window.open(twitterUrl, "_blank", "noopener,noreferrer")}
              disabled={!hasData}
              className="h-8 px-2.5 text-xs gap-1.5"
              title="Share on X"
            >
              <Twitter className="h-3.5 w-3.5" />
              X
            </Button>
            <Button
              variant="ghost" size="sm"
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

        {/* Ratio Toggle */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex rounded-lg border border-border/60 p-0.5 bg-secondary/40">
            {(["9:16", "4:5"] as Ratio[]).map(function(r) {
              return (
                <button
                  key={r}
                  onClick={function() { setRatio(r); }}
                  className={
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all " +
                    (ratio === r
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <Image className="h-3 w-3" />
                  {r}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-muted-foreground/60 handwriting">
            {dims.label}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 overflow-x-auto">
        <div className="flex justify-center">
          {/* =========================================== */}
          {/* 9:16 — PORTRAIT LAYOUT */}
          {/* =========================================== */}
          {isPortrait ? (
            <div
              ref={cardRef}
              className="flex-shrink-0 flex flex-col"
              style={{
                width: dims.w, height: dims.h, borderRadius: 20,
                background: "linear-gradient(160deg, #FAF6F0 0%, #F5EDE0 40%, #F0E8D8 100%)",
                boxShadow: "0 0 0 1px rgba(183, 28, 28, 0.08)",
                position: "relative",
              }}
            >
              {/* Corner glow */}
              <div style={{
                position: "absolute", top: 0, right: 0, width: 100, height: 100,
                background: "linear-gradient(225deg, rgba(183, 28, 28, 0.06), transparent)",
                borderTopRightRadius: 20,
              }} />

              {/* Brand */}
              <div className="px-10 pt-10 pb-2 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "linear-gradient(135deg, #B71C1C, #D32F2F)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FAF6F0", fontSize: 13, fontWeight: "bold",
                    fontFamily: "Georgia, serif", flexShrink: 0,
                  }}>Cl</div>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B7355", fontWeight: 600, margin: 0 }}>
                      Clockocus
                    </p>
                    <p style={{ fontSize: 7, color: "rgba(183, 28, 28, 0.4)", margin: "2px 0 0", letterSpacing: "0.1em" }}>
                      clockocus.freebuff.app
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-10" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(183, 28, 28, 0.12), transparent)" }} />

              {/* Greeting */}
              <div className="px-10 pt-6 pb-1 flex-shrink-0">
                <p style={{ fontSize: 10, color: "#8B7355", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, margin: 0 }}>
                  Study Progress Report
                </p>
                <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, 'Palatino Linotype', serif", color: "#2C1810", margin: "4px 0 0", letterSpacing: "-0.01em" }}>
                  {displayName}
                </h2>
              </div>

              {/* Hero */}
              <div className="flex-1 flex flex-col justify-center px-10">
                <div className="text-center">
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 16px", borderRadius: 20,
                    background: "rgba(183, 28, 28, 0.07)", marginBottom: 20,
                  }}>
                    <Clock size={11} style={{ color: "#B71C1C" }} />
                    <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, color: "#B71C1C" }}>
                      Total Dedication
                    </span>
                  </div>
                  <p style={{
                    fontSize: 58, fontWeight: 700,
                    fontFamily: "Georgia, 'Palatino Linotype', serif",
                    color: "#2C1810", margin: 0, lineHeight: 1, letterSpacing: "-0.02em",
                  }}>
                    {totalMinutes >= 60 ? Math.floor(totalMinutes / 60) + "h " + (totalMinutes % 60) + "m" : totalMinutes + "m"}
                  </p>
                  <p style={{ fontSize: 12, color: "#8B7355", margin: "8px 0 0", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                    across {sessionCount} session{sessionCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Stats Grid */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
                  marginTop: 28, maxWidth: 320, marginLeft: "auto", marginRight: "auto", width: "100%",
                }}>
                  {statsGrid.map(function(stat, i) {
                    return (
                      <div key={stat.label} style={{
                        textAlign: "center", padding: "14px 8px", borderRadius: 14,
                        background: i === 0 ? "rgba(183, 28, 28, 0.06)" : "rgba(139, 115, 85, 0.06)",
                      }}>
                        <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", color: "#2C1810", margin: 0 }}>
                          {stat.value}
                        </p>
                        <p style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8B7355", margin: "4px 0 0", fontWeight: 500 }}>
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Subjects */}
                {stats && stats.sessionsBySubject.length > 0 && (
                  <div style={{ marginTop: 24, padding: "0 8px" }}>
                    <p style={{ fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, color: "#8B7355", marginBottom: 10, textAlign: "center" }}>
                      By Subject
                    </p>
                    <div style={{ maxWidth: 320, margin: "0 auto", display: "flex", flexDirection: "column", gap: 6 }}>
                      {stats.sessionsBySubject.slice(0, 4).map(function(item) {
                        return (
                          <div key={item.subjectName} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.subjectColor, flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: "#2C1810", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.subjectName}
                            </span>
                            <div style={{ flex: 1, maxWidth: 80, height: 4, borderRadius: 2, background: "rgba(183, 28, 28, 0.08)", overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 2, width: (item.minutes / totalMinutes) * 100 + "%", backgroundColor: item.subjectColor }} />
                            </div>
                            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#8B7355", flexShrink: 0, minWidth: 36, textAlign: "right" }}>
                              {formatTime(item.minutes)}
                            </span>
                          </div>
                        );
                      })}
                      {stats.sessionsBySubject.length > 4 && (
                        <p style={{ fontSize: 8, textAlign: "center", fontStyle: "italic", color: "#8B7355", margin: "4px 0 0" }}>
                          + {stats.sessionsBySubject.length - 4} more subjects
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-10 py-5 flex-shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid rgba(183, 28, 28, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "linear-gradient(135deg, #B71C1C, #D32F2F)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FAF6F0", fontSize: 9, fontWeight: "bold", fontFamily: "Georgia, serif",
                  }}>
                    {displayName[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 9, fontFamily: "Georgia, serif", fontStyle: "italic", color: "#8B7355" }}>
                    {displayName}
                  </span>
                </div>
                <span style={{ fontSize: 7, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(183, 28, 28, 0.35)" }}>
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          ) : (
            /* =========================================== */
            /* 4:5 — SQUARISH LAYOUT (more compact)       */
            /* =========================================== */
            <div
              ref={cardRef}
              className="flex-shrink-0 flex flex-col"
              style={{
                width: dims.w, height: dims.h, borderRadius: 20,
                background: "linear-gradient(160deg, #FAF6F0 0%, #F5EDE0 40%, #F0E8D8 100%)",
                boxShadow: "0 0 0 1px rgba(183, 28, 28, 0.08)",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute", top: 0, right: 0, width: 80, height: 80,
                background: "linear-gradient(225deg, rgba(183, 28, 28, 0.06), transparent)",
                borderTopRightRadius: 20,
              }} />

              {/* Compact Header Row */}
              <div className="px-8 pt-8 pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: "linear-gradient(135deg, #B71C1C, #D32F2F)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#FAF6F0", fontSize: 11, fontWeight: "bold",
                      fontFamily: "Georgia, serif", flexShrink: 0,
                    }}>Cl</div>
                    <div>
                      <p style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8B7355", fontWeight: 600, margin: 0 }}>
                        Clockocus
                      </p>
                      <p style={{ fontSize: 6, color: "rgba(183, 28, 28, 0.35)", margin: "1px 0 0", letterSpacing: "0.08em" }}>
                        clockocus.freebuff.app
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(183, 28, 28, 0.3)" }}>
                    Report
                  </span>
                </div>
              </div>

              <div className="mx-8" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(183, 28, 28, 0.12), transparent)" }} />

              {/* Main Content — two-column layout */}
              <div className="flex-1 flex px-8 pt-5 pb-3 gap-6">
                {/* Left: Name + Hero Time */}
                <div className="flex-1 flex flex-col justify-center">
                  <p style={{ fontSize: 9, color: "#8B7355", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, margin: 0 }}>
                    {displayName}
                  </p>
                  <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: "Georgia, serif", color: "#2C1810", margin: "2px 0 12px", letterSpacing: "-0.01em" }}>
                    Study Progress
                  </h2>

                  <div className="text-left">
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 12px", borderRadius: 16,
                      background: "rgba(183, 28, 28, 0.07)", marginBottom: 10,
                    }}>
                      <Clock size={9} style={{ color: "#B71C1C" }} />
                      <span style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "#B71C1C" }}>
                        Total
                      </span>
                    </div>
                    <p style={{
                      fontSize: 36, fontWeight: 700,
                      fontFamily: "Georgia, 'Palatino Linotype', serif",
                      color: "#2C1810", margin: 0, lineHeight: 1, letterSpacing: "-0.02em",
                    }}>
                      {totalMinutes >= 60 ? Math.floor(totalMinutes / 60) + "h " + (totalMinutes % 60) + "m" : totalMinutes + "m"}
                    </p>
                    <p style={{ fontSize: 10, color: "#8B7355", margin: "4px 0 0", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                      {sessionCount} session{sessionCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Stats inline */}
                  <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                    {statsGrid.map(function(stat, i) {
                      return (
                        <div key={stat.label} style={{
                          flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 10,
                          background: i === 0 ? "rgba(183, 28, 28, 0.06)" : "rgba(139, 115, 85, 0.06)",
                        }}>
                          <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "Georgia, serif", color: "#2C1810", margin: 0 }}>
                            {stat.value}
                          </p>
                          <p style={{ fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355", margin: "2px 0 0", fontWeight: 500 }}>
                            {stat.label === "Total Time" ? "Time" : stat.label === "Sessions" ? "Sess" : "Subj"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Subject bars */}
                <div className="w-[180px] flex flex-col justify-center">
                  {stats && stats.sessionsBySubject.length > 0 ? (
                    <div>
                      <p style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "#8B7355", marginBottom: 8 }}>
                        Subjects
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {stats.sessionsBySubject.slice(0, 4).map(function(item) {
                          return (
                            <div key={item.subjectName} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.subjectColor, flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                                  <span style={{ fontSize: 8, color: "#2C1810", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>
                                    {item.subjectName}
                                  </span>
                                  <span style={{ fontSize: 7, fontFamily: "monospace", color: "#8B7355", flexShrink: 0 }}>
                                    {formatTime(item.minutes)}
                                  </span>
                                </div>
                                <div style={{ height: 3, borderRadius: 2, background: "rgba(183, 28, 28, 0.08)", overflow: "hidden" }}>
                                  <div style={{ height: "100%", borderRadius: 2, width: (item.minutes / totalMinutes) * 100 + "%", backgroundColor: item.subjectColor }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 8, color: "#8B7355", fontStyle: "italic" }}>
                        No subjects yet
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Footer */}
              <div className="px-8 py-3 flex-shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid rgba(183, 28, 28, 0.1)" }}>                  <span style={{ fontSize: 7, fontFamily: "Georgia, serif", fontStyle: "italic", color: "#8B7355" }}>
                    &copy; Clockocus
                  </span>
                <span style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(183, 28, 28, 0.3)" }}>
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
