import { Suspense } from "react";
import SearchClient from "./search-client";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  );
}
