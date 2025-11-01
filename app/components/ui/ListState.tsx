"use client";

import { ReactNode } from "react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 w-8 h-8" />
    </div>
  );
}

export function ErrorState(props: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <span className="text-gray-700 mb-2">
        {props.message || "Something went wrong"}
      </span>
      {props.onRetry && (
        <button
          type="button"
          onClick={props.onRetry}
          className="mt-2 border border-gray-400 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function ListState(props: { loading?: boolean; error?: string | null; onRetry?: () => void; children: ReactNode }) {
  if (props.loading) return <LoadingState />;
  if (props.error) return <ErrorState message={props.error} onRetry={props.onRetry} />;
  return <>{props.children}</>;
}