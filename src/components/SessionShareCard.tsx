import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";

interface SessionShareCardProps {
  sessionName: string;
  subjectName: string;
  subjectColor: string;
  duration: number;
  notes?: string;
  date: string;
  displayName: string;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return h >= 100 ? `${h}h` : `${h}h ${m}m`;
  }
  return `${m}m`;
}

export function SessionShareCard({
  sessionName,
  subjectName,
  subjectColor,
  duration,
  notes,
  date,
  displayName,
}: SessionShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#FAF6F0",
      });
      const link = document.createElement("a");
      const dateStr = new Date(date).toISOString().split("T")[0];
      link.download = `session-${subjectName.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download session card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Hidden card used for rendering */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          style={{
            width: 360,
            height: 640,
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
          {/* Top stripe */}
          <div className="h-1.5 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${subjectColor}88, ${subjectColor}, ${subjectColor}88)` }} />

          {/* Content */}
          <div className="flex-1 flex flex-col px-7 pt-10 pb-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: `${subjectColor}15` }}
              >
                📓
              </div>
              <h2 className="text-lg font-bold font-serif" style={{ color: "#2C1810" }}>
                Study Session
              </h2>
              <p className="text-[11px] mt-1 italic font-serif" style={{ color: "#8B7355" }}>
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Subject */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: `${subjectColor}12` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subjectColor }}
                />
                <span className="text-sm font-semibold font-serif" style={{ color: "#2C1810" }}>
                  {subjectName}
                </span>
              </div>
            </div>

            {/* Time - Big */}
            <div className="text-center mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-2" style={{ color: "#B71C1C" }}>
                Duration
              </p>
              <p className="text-6xl font-bold font-serif tracking-tight" style={{ color: "#2C1810" }}>
                {duration >= 60
                  ? `${Math.floor(duration / 60)}h ${duration % 60}m`
                  : `${duration}m`}
              </p>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mt-auto text-center">
                <div className="inline-block px-5 py-3 rounded-xl" style={{ background: "#B71C1C08" }}>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-1" style={{ color: "#8B7355" }}>
                    Notes
                  </p>
                  <p className="text-sm italic font-serif" style={{ color: "#2C1810" }}>
                    "{notes}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-7 py-4 flex-shrink-0 border-t border-dashed flex items-center justify-between" style={{ borderColor: `${subjectColor}20` }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor }} />
              <p className="text-[9px] italic font-serif" style={{ color: "#8B7355" }}>
                {displayName}
              </p>
            </div>
            <p className="text-[8px] uppercase tracking-wider" style={{ color: `${subjectColor}60` }}>
              Study Notebook
            </p>
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-accent transition-colors"
        title="Download session image"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
      </button>
    </>
  );
}
