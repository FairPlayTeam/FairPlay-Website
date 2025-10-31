"use client";

import { ChangeEvent, KeyboardEvent } from "react";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  returnKeyType?: "search" | "done" | "go" | "next" | "send";
};

export function SearchInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search",
  returnKeyType = "search",
}: Props) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChangeText(e.target.value);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      onSubmit &&
      (e.key === "Enter" ||
        (returnKeyType === "search" && e.key === "Enter"))
    ) {
      onSubmit();
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="border rounded-lg px-3 py-2 text-base text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}