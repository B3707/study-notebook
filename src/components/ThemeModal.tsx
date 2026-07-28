import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
  Palette,
  RotateCcw,
  CheckCheck,
  Type,
  Sun,
  Moon,
  Eye,
  Sparkles,
} from "lucide-react";

interface ThemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_THEMES = [
  {
    name: "Notebook Warm",
    light: { background: "oklch(0.97 0.01 85)", foreground: "oklch(0.15 0.02 260)", primary: "oklch(0.25 0.04 260)", accent: "oklch(0.55 0.15 25)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.005 85)" },
    dark: { background: "oklch(0.18 0.02 260)", foreground: "oklch(0.9 0.01 85)", primary: "oklch(0.85 0.03 85)", accent: "oklch(0.6 0.18 25)", primaryForeground: "oklch(0.18 0.02 260)", accentForeground: "oklch(0.98 0.005 85)" },
  },
  {
    name: "Midnight Ocean",
    light: { background: "oklch(0.97 0.02 240)", foreground: "oklch(0.15 0.03 250)", primary: "oklch(0.3 0.08 260)", accent: "oklch(0.5 0.15 200)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.01 85)" },
    dark: { background: "oklch(0.12 0.03 250)", foreground: "oklch(0.9 0.02 240)", primary: "oklch(0.6 0.12 260)", accent: "oklch(0.5 0.15 200)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.01 85)" },
  },
  {
    name: "Sunset Study",
    light: { background: "oklch(0.97 0.015 70)", foreground: "oklch(0.15 0.02 30)", primary: "oklch(0.35 0.08 30)", accent: "oklch(0.55 0.18 15)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.01 85)" },
    dark: { background: "oklch(0.15 0.03 30)", foreground: "oklch(0.9 0.015 70)", primary: "oklch(0.65 0.1 30)", accent: "oklch(0.55 0.18 15)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.01 85)" },
  },
  {
    name: "Forest Calm",
    light: { background: "oklch(0.96 0.015 120)", foreground: "oklch(0.15 0.03 150)", primary: "oklch(0.3 0.08 150)", accent: "oklch(0.45 0.12 80)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.01 85)" },
    dark: { background: "oklch(0.12 0.03 150)", foreground: "oklch(0.9 0.015 120)", primary: "oklch(0.55 0.1 150)", accent: "oklch(0.45 0.12 80)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.01 85)" },
  },
  {
    name: "Lavender Dreams",
    light: { background: "oklch(0.97 0.015 300)", foreground: "oklch(0.15 0.03 290)", primary: "oklch(0.35 0.08 290)", accent: "oklch(0.5 0.15 330)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.01 85)" },
    dark: { background: "oklch(0.14 0.03 290)", foreground: "oklch(0.9 0.015 300)", primary: "oklch(0.6 0.1 290)", accent: "oklch(0.5 0.15 330)", primaryForeground: "oklch(0.97 0.01 85)", accentForeground: "oklch(0.98 0.01 85)" },
  },
];

type ThemeMode = "light" | "dark";

export function ThemeModal({ open, onOpenChange }: ThemeModalProps) {
  const { theme, toggleTheme, settings, updateSetting, resetSettings, fontOptions, headingFontOptions } = useTheme();
  const [activeMode, setActiveMode] = useState<ThemeMode>("light");
  const [showPreview, setShowPreview] = useState(false);

  const current = settings[activeMode];

  const colorFields: { key: keyof typeof current; label: string; description: string }[] = [
    { key: "primary", label: "Primary", description: "Main buttons & highlights" },
    { key: "primaryForeground", label: "Primary Text", description: "Text on primary" },
    { key: "secondary", label: "Secondary", description: "Subtle backgrounds" },
    { key: "secondaryForeground", label: "Secondary Text", description: "Text on secondary" },
    { key: "background", label: "Background", description: "Page background" },
    { key: "foreground", label: "Text Color", description: "Main text color" },
    { key: "accent", label: "Accent", description: "Accent elements & tabs" },
    { key: "accentForeground", label: "Accent Text", description: "Text on accent" },
    { key: "muted", label: "Muted", description: "Muted backgrounds" },
    { key: "mutedForeground", label: "Muted Text", description: "Secondary text" },
    { key: "border", label: "Border", description: "Card & input borders" },
  ];

  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    for (const mode of ["light", "dark"] as ThemeMode[]) {
      const p = preset[mode];
      updateSetting(mode, "background", p.background);
      updateSetting(mode, "foreground", p.foreground);
      updateSetting(mode, "primary", p.primary);
      updateSetting(mode, "accent", p.accent);
      updateSetting(mode, "primaryForeground", p.primaryForeground);
      updateSetting(mode, "accentForeground", p.accentForeground);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-serif">
            <Palette className="h-5 w-5 text-accent" />
            Customize Theme
          </DialogTitle>
          <DialogDescription>
            Personalize colors, fonts, and more for your Clockocus experience
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Mode Toggle */} 
            <div className="flex items-center gap-2 bg-secondary/60 rounded-lg p-1 w-fit">
              {(["light", "dark"] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeMode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "light" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  {m === "light" ? "Light Mode" : "Dark Mode"}
                </button>
              ))}
            </div>

            {/* Preset Themes */}
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Quick Presets
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_THEMES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/60 hover:border-accent/40 hover:bg-secondary/50 transition-all text-left"
                  >
                    <div className="flex-shrink-0 flex gap-0.5">
                      <div className="w-4 h-6 rounded-l-sm" style={{ background: preset.light.primary }} />
                      <div className="w-4 h-6 rounded-r-sm" style={{ background: preset.light.accent }} />
                    </div>
                    <span className="text-xs font-medium text-foreground">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Customization */}
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                <Palette className="h-3 w-3" />
                Colors ({activeMode === "light" ? "Light" : "Dark"})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {colorFields.map((field) => {
                  const val = current[field.key];
                  const isOklch = val.startsWith("oklch(");
                  const guessColor = (() => {
                    try {
                      if (val.startsWith("#")) return val;
                      if (isOklch) {
                        const m = val.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
                        if (m) {
                          const l = parseFloat(m[1]) * 100;
                          const c = parseFloat(m[2]) * 0.4;
                          const h = parseFloat(m[3]);
                          return `hsl(${h}, ${c}%, ${l}%)`;
                        }
                      }
                      return "#888";
                    } catch { return "#888"; }
                  })();

                  return (
                    <div key={field.key} className="flex items-center gap-2.5 p-2 rounded-lg border border-border/40 bg-card/50">
                      <div
                        className="w-7 h-7 rounded-md border border-border/60 flex-shrink-0 cursor-pointer overflow-hidden relative"
                        style={{ background: guessColor }}
                      >
                        <input
                          type="color"
                          value={guessColor}
                          onChange={(e) => {
                            // Simple hex to oklch approximation isn't easy, so store the hex directly
                            // But for oklch compatibility, we'll let the user type oklch values manually
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Click to pick a color"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {field.label}
                        </label>
                        <p className="text-[9px] text-muted-foreground/60 truncate">{val}</p>
                      </div>
                      <Input
                        value={val}
                        onChange={(e) => updateSetting(activeMode, field.key, e.target.value)}
                        className="w-24 h-7 text-[10px] font-mono bg-background"
                        placeholder="oklch(...)"
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-2 italic">
                Enter oklch(L C H) values or hex colors. Example: <code className="text-[9px] bg-secondary px-1 rounded">oklch(0.5 0.15 25)</code> for red
              </p>
            </div>

            {/* Font Customization */}
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                <Type className="h-3 w-3" />
                Typography
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                    Body Font
                  </label>
                  <select
                    value={current.fontFamily}
                    onChange={(e) => {
                      updateSetting("light", "fontFamily", e.target.value);
                      updateSetting("dark", "fontFamily", e.target.value);
                    }}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ fontFamily: current.fontFamily }}
                  >
                    {fontOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                    Heading Font
                  </label>
                  <select
                    value={current.headingFont}
                    onChange={(e) => {
                      updateSetting("light", "headingFont", e.target.value);
                      updateSetting("dark", "headingFont", e.target.value);
                    }}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ fontFamily: current.headingFont || current.fontFamily }}
                  >
                    {headingFontOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value || current.fontFamily }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                <Eye className="h-3 w-3" />
                Preview
              </h4>
              <div
                className="rounded-xl p-5 border"
                style={{
                  background: `linear-gradient(135deg, ${settings.light.background}, ${settings.light.secondary})`,
                  color: settings.light.foreground,
                  fontFamily: settings.light.fontFamily,
                  borderColor: settings.light.border,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: settings.light.primary, color: settings.light.primaryForeground }}
                  >
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: settings.light.headingFont || settings.light.fontFamily }}>
                      Sample Preview
                    </p>
                    <p className="text-[10px]" style={{ color: settings.light.mutedForeground }}>
                      This is how your theme looks
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <span
                    className="px-3 py-1 text-xs rounded-md font-medium"
                    style={{ background: settings.light.primary, color: settings.light.primaryForeground }}
                  >
                    Button
                  </span>
                  <span
                    className="px-3 py-1 text-xs rounded-md"
                    style={{ background: settings.light.secondary, color: settings.light.secondaryForeground, border: `1px solid ${settings.light.border}` }}
                  >
                    Outline
                  </span>
                  <span
                    className="px-3 py-1 text-xs rounded-md"
                    style={{ background: settings.light.accent, color: settings.light.accentForeground }}
                  >
                    Accent
                  </span>
                </div>
                <div
                  className="p-3 rounded-lg border text-xs"
                  style={{
                    background: `color-mix(in srgb, ${settings.light.background} 60%, transparent)`,
                    borderColor: settings.light.border,
                    color: settings.light.mutedForeground,
                  }}
                >
                  A quick brown fox jumps over the lazy dog. This paragraph shows your chosen body font in action.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSettings}
                className="text-muted-foreground gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to Defaults
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs"
                size="sm"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Apply Theme
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
