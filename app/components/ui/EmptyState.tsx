"use client";

export function EmptyState(props: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <span className="text-gray-700 opacity-80">{props.message}</span>
    </div>
  );
}