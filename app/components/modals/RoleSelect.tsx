"use client";

import { ReactNode } from "react";

type Props = {
  visible: boolean;
  onRequestClose: () => void;
  onSelect: (role: "user" | "moderator" | "admin") => void;
  acting?: boolean;
};

export function RoleSelectModal({
  visible,
  onRequestClose,
  onSelect,
  acting,
}: Props) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-6">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col gap-4">
        <h2 className="text-white text-lg font-semibold mb-2">Set role</h2>

        <div className="flex flex-row gap-3 mb-2">
          <button
            type="button"
            className={`border border-gray-600 rounded-lg px-4 py-2 text-white font-medium ${acting ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-800"}`}
            disabled={acting}
            onClick={() => onSelect("user")}
          >
            User
          </button>
          <button
            type="button"
            className={`border border-gray-600 rounded-lg px-4 py-2 text-white font-medium ${acting ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-800"}`}
            disabled={acting}
            onClick={() => onSelect("moderator")}
          >
            Moderator
          </button>
          <button
            type="button"
            className={`border border-gray-600 rounded-lg px-4 py-2 text-white font-medium ${acting ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-800"}`}
            disabled={acting}
            onClick={() => onSelect("admin")}
          >
            Admin
          </button>
        </div>

        <button
          type="button"
          className="border border-gray-600 rounded-lg px-4 py-2 text-white font-medium hover:bg-gray-800"
          onClick={onRequestClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}