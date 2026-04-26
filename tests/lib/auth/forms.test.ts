import assert from "node:assert/strict";
import test from "node:test";
import {
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
} from "../../../lib/auth/forms";

test("forgotPasswordFormSchema trims and normalizes the email", () => {
  const result = forgotPasswordFormSchema.parse({
    email: "  USER@Example.com ",
  });

  assert.equal(result.email, "user@example.com");
});

test("resetPasswordFormSchema rejects mismatched confirmation", () => {
  const result = resetPasswordFormSchema.safeParse({
    password: "Secure1!",
    confirmPassword: "Secure2!",
  });

  assert.equal(result.success, false);
  if (result.success) {
    throw new Error("Expected resetPasswordFormSchema to reject mismatched passwords.");
  }

  assert.equal(result.error.issues[0]?.path.join("."), "confirmPassword");
  assert.equal(result.error.issues[0]?.message, "Passwords do not match");
});
