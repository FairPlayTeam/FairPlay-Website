import { Suspense } from "react";
import RegisterClient from "./registerClient";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  );
}
