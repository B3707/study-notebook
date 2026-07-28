import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toPng } from "html-to-image";
import {
  Download,
  Loader2,
  ArrowLeft,
  Share2,
  Moon,
  Sun,
  CheckCheck,
  Clock,
  Sparkles,
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

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    return Math.floor(minutes / 60) + "h " + (minutes % 60) + "m";
  }
  return minutes + "m";
}

const DIMS: Record<Ratio, { w: number; h: number; label: string }> = {
  "9:16": { w: 540, h: 960, label: "1080x1920px · Stories" },
  "4:5": { w: 540, h: 675, label: "1080x1350px · Feed" },
};

export default function SessionShare() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratio, setRatio] = useState<Ratio>("9:16");

  const session = useQuery(
    api.studySessions.getSession,
    sessionId ? { id: sessionId as any } : "skip",
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  const displayName =
    (user as any)?.displayName || user?.name || user?.email || "Student";
  const subjectColor = session.subjectColor;
  const dims = DIMS[ratio];
  const isPortrait = ratio === "9:16";

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
      const dateStr = new Date(session.date).toISOString().split("T")[0];
      link.download = "session-" + session.subjectName.toLowerCase().replace(/\s+/g, "-") + "-" + dateStr + "-" + ratio.replace(":", "x") + ".png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download:", error);
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
          const file = new File([blob], "session-study.png", { type: "image/png" });
          await navigator.share({ title: "My Study Session", files: [file] });
        } catch {
          var shareText = "Just completed a study session!\n" +
            session.subjectName + " - " + formatTime(session.duration) +
            (session.notes ? "\n\"" + session.notes + "\"" : "") +
            "\n\nclockocus.freebuff.app";
          if (navigator.share) {
            await navigator.share({ title: "My Study Session", text: shareText });
          } else {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(function() { setCopied(false); }, 2000);
          }
        }
      } else {
        var shareText = "Just completed a study session!\n" +
          session.subjectName + " - " + formatTime(session.duration) +
          (session.notes ? "\n\"" + session.notes + "\"" : "") +
          "\n\nclockocus.freebuff.app";
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(function() { setCopied(false); }, 2000);
      }
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={function() { navigate("/dashboard"); }} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Hero */}
          <div className="text-center mb-6">
            <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
              {session.subjectName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(session.date).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>

          {/* Ratio Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border/60 p-0.5 bg-secondary/40">
                {(["9:16", "4:5"] as Ratio[]).map(function(r) {
                  return (
                    <button key={r} onClick={function() { setRatio(r); }}
                      className={
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all " +
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

          {/* Card + Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* The Card */}
            <div className="flex-shrink-0">
              {isPortrait ? (
                /* ===== 9:16 PORTRAIT LAYOUT ===== */
                <div ref={cardRef} className="flex flex-col" style={{
                  width: dims.w, height: dims.h, borderRadius: 20,
                  background: "linear-gradient(160deg, #FAF6F0 0%, #F5EDE0 40%, #F0E8D8 100%)",
                  boxShadow: "0 0 0 1px rgba(183, 28, 28, 0.08)",
                  position: "relative",
                }}>
                  {/* Corner glow */}
                  <div style={{
                    position: "absolute", top: 0, right: 0, width: 100, height: 100,
                    background: "linear-gradient(225deg, rgba(183, 28, 28, 0.06), transparent)",
                    borderTopRightRadius: 20,
                  }} />

                  {/* Top stripe */}
                  <div className="h-2 flex-shrink-0 relative" style={{
                    borderTopLeftRadius: 19, borderTopRightRadius: 19,
                    background: "linear-gradient(90deg, " + subjectColor + "55, " + subjectColor + ", " + subjectColor + ", " + subjectColor + "55)",
                  }}>
                    <div className="absolute inset-0" style={{
                      borderTopLeftRadius: 19, borderTopRightRadius: 19,
                      background: "repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255,255,255,0.12) 12px, rgba(255,255,255,0.12) 13px)",
                    }} />
                  </div>

                  {/* Brand */}
                  <div className="px-10 pt-8 pb-2 flex-shrink-0">
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

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center px-10">
                    {/* Icon */}
                    <div className="text-center mb-5">
                      <div style={{
                        width: 64, height: 64, borderRadius: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28, margin: "0 auto 12px",
                        background: subjectColor + "15",
                      }}>
                        📓
                      </div>
                      <h2 className="text-lg font-bold font-serif" style={{ color: "#2C1810" }}>
                        Study Session
                      </h2>
                      <p style={{ fontSize: 10, marginTop: 2, fontStyle: "italic", fontFamily: "Georgia, serif", color: "#8B7355" }}>
                        {new Date(session.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                    </div>

                    {/* Subject */}
                    <div className="text-center mb-5">
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "8px 20px", borderRadius: 24,
                        background: subjectColor + "10",
                      }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: subjectColor }} />
                        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "Georgia, serif", color: "#2C1810" }}>
                          {session.subjectName}
                        </span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-center">
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 14px", borderRadius: 16,
                        background: "rgba(183, 28, 28, 0.07)", marginBottom: 12,
                      }}>
                        <Clock size={10} style={{ color: "#B71C1C" }} />
                        <span style={{ fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, color: "#B71C1C" }}>
                          Duration
                        </span>
                      </div>
                      <p style={{
                        fontSize: 52, fontWeight: 700,
                        fontFamily: "Georgia, 'Palatino Linotype', serif",
                        color: "#2C1810", margin: 0, lineHeight: 1, letterSpacing: "-0.02em",
                      }}>
                        {formatDuration(session.duration)}
                      </p>
                    </div>

                    {/* Notes */}
                    {session.notes && (
                      <div className="text-center mt-4">
                        <div style={{
                          display: "inline-block", padding: "10px 20px", borderRadius: 14,
                          background: "rgba(183, 28, 28, 0.05)", maxWidth: 280,
                        }}>
                          <p style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, color: "#8B7355", marginBottom: 4 }}>
                            Notes
                          </p>
                          <p style={{ fontSize: 11, fontStyle: "italic", fontFamily: "Georgia, serif", color: "#2C1810", margin: 0, lineHeight: 1.4 }}>
                            &ldquo;{session.notes}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-10 py-4 flex-shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid " + subjectColor + "20" }}>
                    <div className="flex items-center gap-2">
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
                    <div className="text-right">
                      <p style={{ fontSize: 7, letterSpacing: "0.15em", textTransform: "uppercase", color: subjectColor + "60" }}>
                        Clockocus
                      </p>
                      <p style={{ fontSize: 6, letterSpacing: "0.1em", color: subjectColor + "40" }}>
                        clockocus.freebuff.app
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ===== 4:5 COMPACT LAYOUT ===== */
                <div ref={cardRef} className="flex flex-col" style={{
                  width: dims.w, height: dims.h, borderRadius: 20,
                  background: "linear-gradient(160deg, #FAF6F0 0%, #F5EDE0 40%, #F0E8D8 100%)",
                  boxShadow: "0 0 0 1px rgba(183, 28, 28, 0.08)",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 0, right: 0, width: 80, height: 80,
                    background: "linear-gradient(225deg, rgba(183, 28, 28, 0.06), transparent)",
                    borderTopRightRadius: 20,
                  }} />

                  {/* Compact top stripe */}
                  <div className="h-1.5 flex-shrink-0" style={{
                    borderTopLeftRadius: 19, borderTopRightRadius: 19,
                    background: "linear-gradient(90deg, " + subjectColor + "55, " + subjectColor + ", " + subjectColor + "55)",
                  }} />

                  {/* Compact header */}
                  <div className="px-8 pt-6 pb-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: "linear-gradient(135deg, #B71C1C, #D32F2F)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#FAF6F0", fontSize: 10, fontWeight: "bold",
                          fontFamily: "Georgia, serif", flexShrink: 0,
                        }}>Cl</div>
                        <span style={{ fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B7355", fontWeight: 500 }}>
                          Clockocus
                        </span>
                      </div>
                      <span style={{ fontSize: 6, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(183, 28, 28, 0.3)" }}>
                        clockocus.freebuff.app
                      </span>
                    </div>
                  </div>

                  <div className="mx-8" style={{ height: 1, background: "linear-gradient(90deg, transparent, " + subjectColor + "20, transparent)" }} />

                  {/* Content - two columns */}
                  <div className="flex-1 flex px-8 pt-5 pb-2 gap-5">
                    {/* Left: Subject + Time */}
                    <div className="flex-1 flex flex-col justify-center">
                      {/* Subject badge */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "5px 14px", borderRadius: 20,
                        background: subjectColor + "10", marginBottom: 10,
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: subjectColor }} />
                        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "Georgia, serif", color: "#2C1810" }}>
                          {session.subjectName}
                        </span>
                      </div>

                      {/* Date */}
                      <p style={{ fontSize: 8, color: "#8B7355", fontStyle: "italic", fontFamily: "Georgia, serif", margin: 0, marginBottom: 12 }}>
                        {new Date(session.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </p>

                      {/* Duration */}
                      <div className="text-left">
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 14,
                          background: "rgba(183, 28, 28, 0.07)", marginBottom: 8,
                        }}>
                          <Clock size={9} style={{ color: "#B71C1C" }} />
                          <span style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "#B71C1C" }}>
                            Studied For
                          </span>
                        </div>
                        <p style={{
                          fontSize: 38, fontWeight: 700,
                          fontFamily: "Georgia, 'Palatino Linotype', serif",
                          color: "#2C1810", margin: 0, lineHeight: 1, letterSpacing: "-0.02em",
                        }}>
                          {formatDuration(session.duration)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Notes */}
                    <div className="w-[180px] flex flex-col justify-center">
                      {session.notes ? (
                        <div style={{
                          padding: "14px 16px", borderRadius: 14,
                          background: "rgba(183, 28, 28, 0.04)",
                        }}>
                          <p style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, color: "#8B7355", marginBottom: 6 }}>
                            Notes
                          </p>
                          <p style={{ fontSize: 10, fontStyle: "italic", fontFamily: "Georgia, serif", color: "#2C1810", margin: 0, lineHeight: 1.5 }}>
                            &ldquo;{session.notes}&rdquo;
                          </p>
                        </div>
                      ) : (
                        <div style={{
                          padding: "14px 16px", borderRadius: 14,
                          background: "rgba(183, 28, 28, 0.03)",
                          textAlign: "center",
                        }}>
                          <div style={{ fontSize: 28, marginBottom: 6 }}>📓</div>
                          <p style={{ fontSize: 10, fontFamily: "Georgia, serif", fontStyle: "italic", color: "#8B7355", margin: 0 }}>
                            Study Session
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact Footer */}
                  <div className="px-8 py-3 flex-shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid " + subjectColor + "15" }}>
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "linear-gradient(135deg, #B71C1C, #D32F2F)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#FAF6F0", fontSize: 8, fontWeight: "bold", fontFamily: "Georgia, serif",
                      }}>
                        {displayName[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: 8, fontFamily: "Georgia, serif", fontStyle: "italic", color: "#8B7355" }}>
                        {displayName}
                      </span>
                    </div>
                    <span style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(183, 28, 28, 0.3)" }}>
                      {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="w-full max-w-xs space-y-3">
              <div className="notebook-card rounded-xl p-5">
                <h3 className="font-serif font-semibold text-foreground text-sm mb-1">
                  Download & Share
                </h3>
                <p className="text-xs text-muted-foreground/70 handwriting mb-4">
                  {ratio === "9:16" ? "Perfect for Instagram stories" : "Perfect for Instagram feed posts"}
                </p>

                <div className="space-y-2.5">
                  <Button onClick={handleDownload} disabled={isDownloading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm gap-2"
                  >
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download PNG
                  </Button>

                  <Button onClick={handleShare} disabled={isSharing} variant="outline" className="w-full gap-2">
                    {isSharing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : copied ? (
                      <CheckCheck className="h-4 w-4 text-accent" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Share"}
                  </Button>

                  <a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(
                    "Just studied " + session.subjectName + " for " + formatTime(session.duration) + "!" +
                    (session.notes ? " \"" + session.notes + "\"" : "") +
                    " clockocus.freebuff.app"
                  )} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Share on X
                    </Button>
                  </a>
                </div>
              </div>

              <div className="notebook-card rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>
                    {dims.label} &middot; High resolution
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
