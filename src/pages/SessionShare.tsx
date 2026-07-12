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
  FileImage,
} from "lucide-react";

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return h >= 100 ? `${h}h` : `${h}h ${m}m`;
  }
  return `${m}m`;
}

export default function SessionShare() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#FAF6F0",
        cacheBust: true,
        width: 360,
        height: 640,
        style: {
          margin: "0",
          padding: "0",
          transform: "none",
        },
      });
      const link = document.createElement("a");
      const dateStr = new Date(session.date).toISOString().split("T")[0];
      link.download = `session-${session.subjectName.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.png`;
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
          });
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "session-study.png", {
            type: "image/png",
          });
          await navigator.share({
            title: "My Study Session",
            files: [file],
          });
        } catch {
          const shareText =
            `📚 Just completed a study session!\n\n` +
            `📖 ${session.subjectName} — ${formatTime(session.duration)}\n` +
            (session.notes ? `📝 "${session.notes}"\n\n` : `\n`) +
            `studynotebook.freebuff.app`;

          if (navigator.share) {
            await navigator.share({ title: "My Study Session", text: shareText });
          } else {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }
      } else {
        const shareText =
          `📚 Just completed a study session!\n\n` +
          `📖 ${session.subjectName} — ${formatTime(session.duration)}\n` +
          (session.notes ? `📝 "${session.notes}"\n\n` : `\n`) +
          `studynotebook.freebuff.app`;
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
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Hero section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-accent/10">
              <FileImage className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-accent font-medium">
                9:16 Portrait — Ready to Share
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
              {session.subjectName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(session.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Card + Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* The Card */}
            <div className="flex-shrink-0">
              <div
                ref={cardRef}
                className="flex flex-col"
                style={{
                  width: 360,
                  height: 640,
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
                {/* Top gradient stripe */}
                <div
                  className="h-2 flex-shrink-0 relative"
                  style={{
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    background: `linear-gradient(90deg, ${subjectColor}44, ${subjectColor}, ${subjectColor}, ${subjectColor}44)`,
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      borderTopLeftRadius: 15,
                      borderTopRightRadius: 15,
                      background: `repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.15) 13px)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col px-8 pt-8 pb-5">
                  {/* Icon */}
                  <div className="text-center mb-6">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4"
                      style={{ background: `${subjectColor}12` }}
                    >
                      📓
                    </div>
                    <h2 className="text-lg font-bold font-serif" style={{ color: "#2C1810" }}>
                      Study Session
                    </h2>
                    <p className="text-[11px] mt-1 font-serif italic" style={{ color: "#8B7355" }}>
                      {new Date(session.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Subject Badge */}
                  <div className="text-center mb-6">
                    <div
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full"
                      style={{ background: `${subjectColor}10` }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: subjectColor }}
                      />
                      <span
                        className="text-sm font-semibold font-serif"
                        style={{ color: "#2C1810" }}
                      >
                        {session.subjectName}
                      </span>
                    </div>
                  </div>

                  {/* Duration - Hero */}
                  <div className="text-center mb-5">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                      style={{ background: "#B71C1C0A" }}
                    >
                      <Clock className="h-3 w-3" style={{ color: "#B71C1C" }} />
                      <span
                        className="text-[9px] uppercase tracking-[0.15em] font-medium"
                        style={{ color: "#B71C1C" }}
                      >
                        Duration
                      </span>
                    </div>
                    <p
                      className="text-6xl md:text-7xl font-bold font-serif tracking-tight leading-none"
                      style={{ color: "#2C1810" }}
                    >
                      {session.duration >= 60
                        ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`
                        : `${session.duration}m`}
                    </p>
                  </div>

                  {/* Notes */}
                  {session.notes && (
                    <div className="mt-auto text-center">
                      <div
                        className="inline-block px-6 py-3.5 rounded-2xl max-w-xs"
                        style={{ background: "#B71C1C06" }}
                      >
                        <p
                          className="text-[9px] uppercase tracking-[0.15em] font-medium mb-1.5"
                          style={{ color: "#8B7355" }}
                        >
                          Notes
                        </p>
                        <p
                          className="text-sm italic font-serif leading-relaxed"
                          style={{ color: "#2C1810" }}
                        >
                          "{session.notes}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  className="px-8 py-4 flex-shrink-0 flex items-center justify-between"
                  style={{ borderTop: `1px dashed ${subjectColor}30` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-serif"
                      style={{ background: `${subjectColor}15`, color: subjectColor }}
                    >
                      {displayName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[9px] font-medium" style={{ color: "#2C1810" }}>
                        {displayName}
                      </p>
                      <p className="text-[7px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                        Student
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[7px] uppercase tracking-[0.2em] font-medium"
                      style={{ color: `${subjectColor}70` }}
                    >
                      Study Notebook
                    </p>
                    <p className="text-[6px] tracking-wider" style={{ color: `${subjectColor}40` }}>
                      studynotebook.freebuff.app
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="w-full max-w-xs space-y-3">
              <div className="notebook-card rounded-xl p-5">
                <h3 className="font-serif font-semibold text-foreground text-sm mb-1">
                  Download & Share
                </h3>
                <p className="text-xs text-muted-foreground/70 handwriting mb-4">
                  Perfect for Instagram stories, Twitter, or sharing with friends
                </p>

                <div className="space-y-2.5">
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm gap-2"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download PNG
                  </Button>

                  <Button
                    onClick={handleShare}
                    disabled={isSharing}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {isSharing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : copied ? (
                      <CheckCheck className="h-4 w-4 text-accent" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Share"}
                  </Button>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `📚 Just studied ${session.subjectName} for ${formatTime(session.duration)}! ${session.notes ? `📝 "${session.notes}" ` : ""}studynotebook.freebuff.app`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
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
                    9:16 portrait · 360×640px · High resolution
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
