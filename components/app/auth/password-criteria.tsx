import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/auth/forms";

export function PasswordCriteria({ password }: { password: string }) {
  if (!password) {
    return null;
  }

  return (
    <ul className="mt-1 flex flex-col gap-1">
      {PASSWORD_RULES.map(({ label, test }) => {
        const met = test(password);

        return (
          <li
            key={label}
            className={`flex items-center gap-2 text-xs ${met ? "text-green-500" : "text-muted-foreground"}`}
          >
            {met ? (
              <Check className="size-3 shrink-0 text-green-500" />
            ) : (
              <X className="size-3 shrink-0 text-muted-foreground" />
            )}
            {label}
          </li>
        );
      })}
    </ul>
  );
}
