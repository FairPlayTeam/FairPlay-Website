import { Suspense } from "react";
import LoginClient from "./loginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
