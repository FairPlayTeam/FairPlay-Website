import { Suspense } from "react";
import RegisterClient from "./registerClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  );
}