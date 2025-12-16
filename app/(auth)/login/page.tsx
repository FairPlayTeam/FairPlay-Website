import { Suspense } from "react";
import LoginClient from "./loginClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
