"use client";

export default function ExtensionPreview() {
  return (
    <div className="w-full max-w-80 rounded-2xl border border-border bg-card/95 px-4 py-5 text-foreground shadow-xl sm:px-6">
      <h1 className="mb-5 text-center text-3xl font-semibold text-foreground">FairPlay</h1>

      <div className="space-y-3 text-sm">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 cursor-pointer rounded border-border bg-transparent accent-primary"
          />
          <span className="text-muted-foreground">YouTube Shorts</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-border bg-transparent accent-primary"
          />
          <span className="text-muted-foreground">Snapchat Spotlights</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-border bg-transparent accent-primary"
          />
          <span className="text-muted-foreground">Instagram Reels (WIP)</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-border bg-transparent accent-primary"
          />
          <span className="text-muted-foreground">TikTok</span>
        </label>
      </div>

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-medium text-foreground">Block custom website</h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/60 px-3 py-2 text-sm">
            <span className="text-foreground">x.com</span>
            <span className="cursor-default text-muted-foreground">x</span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/60 px-3 py-2 text-sm">
            <span className="min-w-0 truncate text-foreground">twitter.com</span>
            <span className="cursor-default text-muted-foreground">x</span>
          </div>

          <input
            type="text"
            placeholder="e.g. example.com"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <button className="mt-5 w-full cursor-pointer rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform duration-150 hover:-translate-y-px hover:bg-primary-400 hover:shadow-lg">
        Add
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        by <span className="font-medium text-primary">fairplay.video</span>
      </p>
    </div>
  );
}
