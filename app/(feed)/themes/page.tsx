"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { themeColorsToCSSVars, type ThemeColors, resetTheme, applyThemeClient } from "@/lib/theme";
import { RotateCcw, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useCallback, useEffect, useState } from "react";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";

type ThemeResponse = {
  id: string;
  name: string;
  description: string | null;
  author: { username: string };
  colors: ThemeColors;
  createdAt: string;
};

type ThemesPaginatedResponse = {
  themes: ThemeResponse[];
  pagination: {
    totalPages: number;
  };
};

const PAGE_SIZE = 24;

function mergeUniqueById(prev: ThemeResponse[], next: ThemeResponse[]) {
  if (next.length === 0) return prev;
  const seen = new Set(prev.map((item) => item.id));
  const merged = [...prev];

  for (const item of next) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged;
}

export default function ThemesStorePage() {
  const { user } = useAuth();

  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isLoadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchThemes = useCallback(async (pageToLoad: number, mode: "initial" | "more") => {
    try {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await api.get<ThemesPaginatedResponse>(
        `/themes?page=${pageToLoad}&limit=${PAGE_SIZE}`,
      );

      const nextThemes = res.data.themes ?? [];
      const totalPages = res.data.pagination?.totalPages;

      setThemes((prev) => (pageToLoad === 1 ? nextThemes : mergeUniqueById(prev, nextThemes)));
      setPage(pageToLoad);
      setHasMore(pageToLoad < totalPages);
    } catch {
      toast.error("Error while fetching themes.");
      setHasMore(false);
    } finally {
      if (mode === "initial") {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchThemes(1, "initial");
  }, [fetchThemes]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    fetchThemes(page + 1, "more");
  }, [fetchThemes, hasMore, isLoading, isLoadingMore, page]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
  });

  const activeThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      await api.patch("/user-theme", { themeId });
    },
    onError: () => {
      toast.error("Failed to sync theme with your account.");
    },
  });

  const applyTheme = (theme: ThemeResponse) => {
    applyThemeClient(theme.colors);
    toast.success(`${theme.name} theme applied!`);

    if (user) {
      activeThemeMutation.mutate(theme.id);
    }
  };

  const resetThemeMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/user-theme");
    },
    onSuccess: () => {
      resetTheme();
      toast.success("Theme reset to defaults.");
    },
    onError: () => {
      resetTheme();
      toast.success("Theme reset locally.");
    },
  });

  const handleReset = () => {
    if (user) {
      resetThemeMutation.mutate();
    } else {
      resetTheme();
      toast.success("Theme reset to defaults.");
    }
  };

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Store</h1>
          <p className="text-muted-foreground">
            Discover and apply themes created by the community.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw /> Reset Theme
          </Button>
          <Button asChild>
            <a href="/themes/create">
              <ShoppingBag /> Create Theme
            </a>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {themes?.map((theme) => (
              <Card key={theme.id} className="py-0 overflow-hidden">
                <div
                  className="aspect-video w-full border-b border-border/50 bg-background"
                  style={{
                    ...Object.fromEntries(
                      themeColorsToCSSVars(theme.colors)
                        .split(";")
                        .map((pair) => pair.split(":").map((s) => s.trim()))
                        .filter((pair) => pair.length === 2),
                    ),
                  }}
                >
                  <div className="flex flex-col">
                    <div className="h-8 min-h-0 w-full border-b border-border/50 flex items-center px-3 justify-between shrink-0">
                      <div className="flex items-center gap-1.5 w-1/4">
                        <div className="h-3.5 w-3.5 rounded-full bg-primary" />
                        <div className="h-2.5 w-12 rounded bg-foreground/75" />
                      </div>
                      <div className="flex-1 flex justify-center max-w-[40%]">
                        <div className="h-3 w-full rounded-full bg-secondary/80 border border-border/50" />
                      </div>
                      <div className="flex items-center gap-1.5 w-1/4 justify-end">
                        <div className="h-2.5 w-8 rounded bg-primary/25" />
                        <div className="h-2.5 w-8 rounded bg-destructive/50" />
                        <div className="h-4 w-4 rounded-full bg-secondary/50" />
                      </div>
                    </div>

                    <div className="flex-1 flex min-h-0">
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="p-2 aspect-video">
                          <div className="h-full w-full bg-secondary rounded flex items-center justify-center" />
                        </div>
                        <div className="px-2 pt-1 pb-1">
                          <div className="h-3 w-3/4 rounded bg-secondary" />
                        </div>
                      </div>

                      <div className="min-w-[35%] p-2 flex flex-col gap-2">
                        <div className="h-3 w-1/4 rounded bg-secondary" />
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex gap-2 w-full">
                            <div className="w-14 shrink-0 aspect-video rounded bg-secondary/50" />
                            <div className="flex-1 flex flex-col gap-1.5 mt-0.5">
                              <div className="h-2 w-full rounded bg-secondary/80" />
                              <div className="h-1.5 w-2/3 rounded bg-secondary/50" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle>
                    <span className="text-xl font-bold">{theme.name}</span>
                    <br />
                    <span className="font-normal text-sm text-muted-foreground">
                      @{theme.author.username} | Created{" "}
                      {new Date(theme.createdAt).toLocaleDateString()}
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-2 text-secondary-foreground">
                    {theme.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="border-t border-border/50 bg-muted/50 p-4">
                  <Button className="flex-1" onClick={() => applyTheme(theme)}>
                    Apply Theme
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {themes?.length === 0 && (
              <div className="h-[50vh] col-span-3 flex items-center justify-center">
                <p className="text-muted-foreground text-center">No themes found.</p>
              </div>
            )}
          </div>
          <div ref={sentinelRef} className="h-1" />
          {isLoadingMore ? (
            <div className="w-full grid place-items-center py-6">
              <Spinner className="size-14" />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
