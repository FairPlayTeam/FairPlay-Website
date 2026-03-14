import type { ComponentProps, HTMLInputTypeAttribute } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AuthTextFieldProps = {
  id: string
  label: string
  placeholder?: string
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  inputMode?: ComponentProps<'input'>['inputMode']
  registration: UseFormRegisterReturn
  error?: string
  autoFocus?: boolean
  descriptionId?: string
}

export function AuthTextField({
  id,
  label,
  placeholder,
  type = 'text',
  autoComplete,
  inputMode,
  registration,
  error,
  autoFocus,
  descriptionId,
}: AuthTextFieldProps) {
  const errorId = `${id}-error`
  const describedBy = [descriptionId, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        autoFocus={autoFocus}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className="border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        {...registration}
      />
      {error ? (
        <p id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
