"use client";

export default function ExtensionPreview() {
  return (
    <div
      className="w-[320px] rounded-2xl 
                 bg-(--gray-900)/95 
                 border border-(--gray-700) 
                 px-6 py-5 
                 text-text shadow-xl"
    >
      <h1 className="mb-5 text-center text-3xl font-semibold text-accent">
        FairPlay
      </h1>

      <div className="space-y-3 text-sm">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 cursor-pointer rounded border-(--gray-500) bg-transparent accent-accent-dark"
          />
          <span className="text-text-para">YouTube Shorts</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-(--gray-500) bg-transparent accent-accent-dark"
          />
          <span className="text-text-para">Snapchat Spotlights</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-(--gray-500) bg-transparent accent-accent-dark"
          />
          <span className="text-text-para">Instagram Reels (WIP)</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-(--gray-500) bg-transparent accent-accent-dark"
          />
          <span className="text-text-para">TikTok</span>
        </label>
      </div>

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-medium text-text-bold">
          Block custom website
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-(--gray-700) bg-(--gray-850) px-3 py-2 text-sm">
            <span className="text-text">x.com</span>
            <span className="cursor-default text-text-amount">x</span>
          </div>

          <div className="flex items-center justify-between rounded-md border border-(--gray-700) bg-(--gray-850) px-3 py-2 text-sm">
            <span className="text-text">twitter.com</span>
            <span className="cursor-default text-text-amount">x</span>
          </div>

          <input
            type="text"
            placeholder="e.g. example.com"
            className="mt-1 w-full rounded-md border border-(--gray-700) 
                       bg-(--gray-900) px-3 py-2 text-sm 
                       text-text placeholder:text-text-amount 
                       focus:outline-none focus:ring-2 focus:ring-accent-dark"
          />
        </div>
      </div>

      <button
        className="cursor-pointer mt-5 w-full rounded-md bg-accent-dark 
                   py-3 text-sm font-semibold text-white 
                   transition-transform duration-150 
                   hover:-translate-y-px hover:shadow-lg"
      >
        Add
      </button>

      <p className="mt-4 text-center text-xs text-text-amount">
        by <span className="font-medium text-accent">fairplay.video</span>
      </p>
    </div>
  );
}
