'use client'

import { useCallback, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, X } from 'lucide-react'
import { AuthPageShell } from '@/components/app/auth/auth-page-shell'
import { AuthPasswordField } from '@/components/app/auth/auth-password-field'
import { AuthTextField } from '@/components/app/auth/auth-text-field'
import { useAuth } from '@/context/auth-context'
import { useAuthSubmit } from '@/hooks/use-auth-submit'
import { api } from '@/lib/api'
import { buildAuthHref, getSafeCallbackUrl } from '@/lib/safe-redirect'
import { setToken } from '@/lib/token'

const SPECIAL_CHARACTER_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'At least one number', test: (p) => /[0-9]/.test(p) },
  { label: 'At least one special character (!@#$...)', test: (p) => SPECIAL_CHARACTER_REGEX.test(p) },
]

const passwordSchema = z.string().min(1, 'Password is required').superRefine((value, ctx) => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: rule.label,
      })
    }
  }
})

const registerFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email('Invalid email')
      .transform((value) => value.toLowerCase()),
    username: z.string().trim().min(3, 'Username is too short'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

const REGISTER_FORM_ID = 'register-form'
const REGISTER_FORM_ERROR_ID = 'register-form-error'
const PASSWORD_CRITERIA_ID = 'register-password-criteria'

function PasswordCriteria({ password }: { password: string }) {
  if (!password) return null

  return (
    <ul className="mt-1 flex flex-col gap-1">
      {PASSWORD_RULES.map(({ label, test }) => {
        const met = test(password)
        return (
          <li
            key={label}
            className={`flex items-center gap-2 text-xs ${
              met ? 'text-green-500' : 'text-muted-foreground'
            }`}
          >
            {met ? (
              <Check className="size-3 shrink-0 text-green-500" />
            ) : (
              <X className="size-3 shrink-0 text-muted-foreground" />
            )}
            {label}
          </li>
        )
      })}
    </ul>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = getSafeCallbackUrl(params.get('callbackUrl'))
  const { user, isLoading, refetchUser } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(callbackUrl)
    }
  }, [callbackUrl, isLoading, router, user])

  const submitRegistration = useCallback(
    async (values: RegisterFormValues) => {
      const response = await api.post('/auth/register', {
        email: values.email,
        username: values.username,
        password: values.password,
      })

      setToken(response.data.sessionKey)
      await refetchUser()
      router.replace(callbackUrl)
    },
    [callbackUrl, refetchUser, router],
  )

  const { onSubmit, error, isSubmitting, clearError } =
    useAuthSubmit<RegisterFormValues>(submitRegistration)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    shouldFocusError: true,
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = useWatch({
    control: form.control,
    name: 'password',
    defaultValue: '',
  })

  return (
    <AuthPageShell
      title="Create Account"
      switchHref={buildAuthHref('/login', callbackUrl)}
      switchLabel="Login"
      formId={REGISTER_FORM_ID}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Register"
      submitPendingLabel="Creating..."
      isSubmitting={isSubmitting}
      error={error}
      errorId={REGISTER_FORM_ERROR_ID}
    >
      <AuthTextField
        id="email"
        label="Email"
        type="email"
        placeholder="nealmohan@youtube.com"
        autoComplete="email"
        autoFocus
        registration={form.register('email', { onChange: clearError })}
        error={form.formState.errors.email?.message}
      />

      <AuthTextField
        id="username"
        label="Username"
        type="text"
        placeholder="your_username"
        autoComplete="username"
        registration={form.register('username', { onChange: clearError })}
        error={form.formState.errors.username?.message}
      />

      <AuthPasswordField
        id="password"
        label="Password"
        placeholder="Password"
        autoComplete="new-password"
        registration={form.register('password', { onChange: clearError })}
        error={form.formState.errors.password?.message}
        helper={<PasswordCriteria password={passwordValue} />}
        helperId={PASSWORD_CRITERIA_ID}
      />

      <AuthPasswordField
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm Password"
        autoComplete="new-password"
        registration={form.register('confirmPassword', { onChange: clearError })}
        error={form.formState.errors.confirmPassword?.message}
      />
    </AuthPageShell>
  )
}