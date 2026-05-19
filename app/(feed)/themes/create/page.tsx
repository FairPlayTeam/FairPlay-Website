"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  themeColorsToCSSVars,
  getContrastRatio,
  type ThemeColors,
  toHex,
  generateShades,
  defaultColors,
  darkColors,
} from "@/lib/theme";
import { parse } from "culori";
import { AlertCircle, CheckCircle2, Sun, Moon, Contrast, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function camelCaseToWords(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function ThemeCreatePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [showContrast, setShowContrast] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<ThemeColors | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const applyThemeToIframe = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      let styleTag = doc.getElementById("theme-style-tag");
      if (!styleTag) {
        styleTag = doc.createElement("style");
        styleTag.id = "theme-style-tag";
        doc.head.appendChild(styleTag);
      }
      styleTag.innerHTML = `:root { ${themeColorsToCSSVars(colors)} }`;
    } catch (e) {
      console.warn("Could not sync theme to iframe:", e);
    }
  }, [colors]);

  useEffect(() => {
    applyThemeToIframe();
  }, [colors, applyThemeToIframe]);

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      isPublic: boolean;
      colors: ThemeColors;
    }) => {
      const res = await api.post("/themes", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Theme created successfully!");
      router.push("/themes");
    },
    onError: () => {
      toast.error("Failed to save theme.");
    },
  });

  const handleColorStrChange = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "primary" && parse(value)) {
        return { ...next, ...generateShades(value) };
      }
      return next;
    });
  };

  const handleHexPickerChange = (key: keyof ThemeColors, hex: string) => {
    setColors((prev) => {
      const next = { ...prev, [key]: hex };
      if (key === "primary") {
        return { ...next, ...generateShades(hex) };
      }
      return next;
    });
  };

  const contrastChecks = [
    {
      label: "Background / Foreground",
      a: colors.background,
      b: colors.foreground,
      min: 4.5,
    },
    {
      label: "Primary / White",
      a: colors.primary,
      b: "#ffffff",
      min: 4.5,
    },
    {
      label: "Card / Foreground",
      a: colors.card,
      b: colors.cardForeground,
      min: 4.5,
    },
    {
      label: "Muted / Foreground",
      a: colors.muted,
      b: colors.mutedForeground,
      min: 3.1,
    },
    {
      label: "Accent / Foreground",
      a: colors.accent,
      b: colors.accentForeground,
      min: 4.5,
    },
  ];

  const issues = contrastChecks.filter((c) => getContrastRatio(c.a, c.b) < c.min);
  const hasAccessibilityIssues = issues.length > 1;

  const handleSave = () => {
    if (!user) {
      toast.error("You must be logged in to save a theme.");
      router.push("/login?callbackUrl=/themes/create");
      return;
    }

    if (!name) {
      toast.error("Please provide a name for your theme.");
      return;
    }

    if (hasAccessibilityIssues) {
      toast.error("Please fix contrast ratio issues before saving.");
      setShowContrast(true);
      return;
    }

    createMutation.mutate({ name, description, isPublic, colors });
  };

  return (
    <div className="container mx-auto grid grid-cols-1 gap-8 p-4 md:grid-cols-[400px_1fr]">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Theme Creator</h1>

        <FieldSet>
          <FieldLegend>Theme Details</FieldLegend>
          <FieldDescription>Give your theme a name and description.</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Midnight"
              />
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A sleek dark theme with blue accents..."
              />
            </Field>
            <Field orientation="horizontal" className="justify-between">
              <div>
                <FieldLabel>Public Theme</FieldLabel>
                <FieldDescription>Share it with the community.</FieldDescription>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </Field>

            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || hasAccessibilityIssues}
            >
              {createMutation.isPending ? <></> : <Plus />}
              {createMutation.isPending ? "Creating..." : "Create Theme"}
            </Button>
          </FieldGroup>
        </FieldSet>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Select Preset</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="flex h-36 flex-col items-center justify-center gap-4 rounded-3xl transition-all duration-300"
              onClick={() => setPendingPreset(defaultColors)}
            >
              <div className="flex size-14 items-center justify-center rounded-xl bg-orange-50 shadow-sm">
                <Sun className="size-8 text-orange-500" />
              </div>
              <span className="text-xs font-black uppercase tracking-tighter">Light Mode</span>
            </Button>

            <Button
              variant="outline"
              className="flex h-36 flex-col items-center justify-center gap-4 rounded-3xl transition-all duration-300"
              onClick={() => setPendingPreset(darkColors)}
            >
              <div className="flex size-14 items-center justify-center rounded-xl bg-slate-950 shadow-sm">
                <Moon className="size-8 text-blue-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-tighter">Dark Mode</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Design Palette</h2>
          <div className="grid grid-cols-2 gap-1">
            {Object.keys(colors)
              .filter((key) => !key.startsWith("primary") || key === "primary")
              .map((k) => {
                const key = k as keyof ThemeColors;
                return (
                  <div key={key} className="relative flex items-center gap-4 p-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="size-12 rounded-full border-2 border-border shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
                          style={{ backgroundColor: colors[key] }}
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto rounded-3xl border p-4 shadow-2xl"
                        side="bottom"
                        align="start"
                        sideOffset={12}
                      >
                        <HexColorPicker
                          color={toHex(colors[key])}
                          onChange={(hex) => handleHexPickerChange(key, hex)}
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="flex-1 min-w-0">
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {camelCaseToWords(key)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={colors[key]}
                          onChange={(e) => handleColorStrChange(key, e.target.value)}
                          className="font-mono text-sm max-w-[calc(7ch+2rem)]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="sticky top-20 flex h-[calc(100vh-7rem)] flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Live Preview</h2>
          <div className="relative">
            <Popover open={showContrast} onOpenChange={setShowContrast}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Contrast />
                  Contrast
                  {issues.length > 0 && (
                    <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow-lg">
                      {issues.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[340px] p-0 rounded-2xl shadow-xl overflow-hidden border border-border"
                align="end"
                sideOffset={8}
              >
                <div className="flex flex-col justify-between border-b bg-muted/30 p-4">
                  <h4 className="text-sm font-bold text-foreground">Accessibility Check</h4>
                  <p className="mt-1 text-xs font-medium text-muted-foreground/80">
                    Ensuring WCAG 2.2 AA compliance.
                  </p>
                </div>
                <div className="flex max-h-[400px] flex-col overflow-y-auto p-2 layout-scrollbar">
                  {contrastChecks.map((c, i) => {
                    const ratio = getContrastRatio(c.a, c.b);
                    const passed = ratio >= c.min;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "relative flex items-center justify-between p-3",
                          i !== contrastChecks.length - 1 && "border-b border-border/40",
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold tracking-tight text-foreground transition-colors">
                            {c.label}
                          </span>
                          <span className="text-[9px] font-mono font-medium uppercase text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/70">
                            Min Requirement: {c.min}:1
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "font-mono text-sm font-black transition-colors",
                              passed ? "text-green-500" : "text-red-500",
                            )}
                          >
                            {ratio.toFixed(2)}:1
                          </span>
                          {passed ? (
                            <CheckCircle2 className="size-5 text-green-500" />
                          ) : (
                            <AlertCircle className="size-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-3xl border border-border shadow-2xl">
          <iframe
            ref={iframeRef}
            src="/"
            className="size-full border-none pointer-events-auto"
            onLoad={applyThemeToIframe}
            title="Theme Preview"
          />
        </div>
      </div>

      <AlertDialog open={!!pendingPreset} onOpenChange={(open) => !open && setPendingPreset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your current palette to the{" "}
              {pendingPreset === defaultColors ? "Light" : "Dark"} mode defaults. Any unsaved
              changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nevermind</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingPreset) setColors(pendingPreset);
                setPendingPreset(null);
              }}
            >
              Apply Preset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
