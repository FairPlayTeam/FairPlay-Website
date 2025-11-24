"use client";

export default function ExtensionPreview() {
  return (
    <div
      className="p-5 w-[300px] 
                bg-linear-to-b from-(--gray-700-transparent) to-(--gray-700)/80
                backdrop-blur-md 
                text-text 
                rounded-2xl 
                shadow-lg ring-1 ring-accent-dark"
    >
      <div className="text-center mb-4">
        <h1 className="py-3 text-3xl font-semibold text-accent">FairPlay</h1>
      </div>

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            defaultChecked
            id="ytShorts"
            className="mr-3 accent-accent-dark"
          />
          <span className="text-text-para">YouTube Shorts</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            id="blockTikTok"
            className="mr-3 accent-accent-dark"
          />
          <span className="text-text-para">TikTok</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            id="snapVert"
            className="mr-3 accent-accent-dark"
          />
          <span className="text-text-para">Snapchat Spotlights</span>
        </label>
      </div>

      <h4 className="mt-6 mb-2 text-text-bold font-medium">Custom website</h4>
      <input
        type="text"
        id="customDomain"
        placeholder="e.g. example.com"
        className="w-full bg-gray-500 border border-border text-text rounded-md p-3 placeholder-text-amount focus:outline-none focus:ring-2 focus:ring-accent-dark"
      />

      <ul id="customDomainList" className="list-none p-0 mt-3 text-text-para" />

      <button
        id="addDomain"
        className="mt-4 w-full bg-accent-dark rounded-xl p-3 text-text font-medium transition duration-200 hover:shadow-lg"
      >
        Add / Delete
      </button>
    </div>
  );
}
