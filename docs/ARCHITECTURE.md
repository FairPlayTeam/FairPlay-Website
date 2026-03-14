# FairPlay Frontend Architecture

This document describes how the FairPlay frontend is organized, how core flows work, and which engineering conventions are used.

## 1. High-Level Architecture

The frontend is a Next.js App Router application with:

- Route-driven page composition in `app/`
- Domain-focused UI components in `components/app/`
- Shared design-system components in `components/ui/`
- Centralized API/domain modules in `lib/`
- Cross-cutting concerns in `context/` and `hooks/`

Core runtime model:

- Server components are used for metadata and initial prefetch in selected routes.
- Client components handle interactivity, authenticated calls, infinite scroll, and mutations.

## 2. Runtime and Core Technologies

- Framework: Next.js 16 (App Router)
- Rendering: React 19
- Language: TypeScript (strict)
- Styling: Tailwind CSS v4, CSS variables, `tw-animate-css`
- UI primitives: Radix + custom wrappers
- Data layer: Axios + React Query
- Local persistent state: Zustand
- Form stack: React Hook Form + Zod
- Notifications: Sonner

## 3. Repository Layout

```text
app/
  (auth)/
  (feed)/
  admin/
  channel/
  moderator/
  profile/
  search/
  upload/
components/
  app/
  ui/
context/
hooks/
lib/
public/
```

## 4. Routing Model

### Route groups and sections

- `app/(auth)`: authentication pages and wrappers
- `app/(feed)`: explore, subscriptions, watch pages
- `app/channel/[username]`: public channel pages
- `app/profile`: account settings tabs
- `app/upload`: multi-step upload workflow
- `app/moderator`: moderation tools
- `app/admin`: admin tools

### Root behavior

- `/` redirects to `/explore`.

## 5. App Shell and Navigation

Main authenticated-like experience is wrapped by `AppShell`:

- Top navigation (`AppTopbar`)
- Sidebar (`AppSidebar`)
- Global readiness overlay while auth state hydrates

`AppShell` is applied in layouts such as:

- feed-level layout
- channel layout
- profile layout
- moderator/admin/upload/search layouts

## 6. Authentication and Session Model

### Token transport

- Bearer token is stored in a persisted Zustand store.
- Axios request interceptor attaches `Authorization: Bearer <token>`.

### Hydration and identity

- `AuthProvider` reads hydration status from store persistence.
- Once hydrated, it fetches `/auth/me` with React Query.
- 401 flow:
  - retries once
  - on repeated 401: clears token and treats user as unauthenticated
- 403 flow:
  - returns `null` user without deleting token (for forbidden-resource scenarios)

### Route guarding

Protected pages perform client-side guard checks:

- If unauthenticated, user is redirected to login with a safe callback URL.
- Redirect logic uses `buildAuthHref` + callback sanitization from `safe-redirect.ts`.

## 7. Data Layer and API Modules

API modules are separated by domain:

- `lib/users.ts`
- `lib/videos.ts`
- `lib/comments.ts`
- `lib/moderation.ts`
- `lib/admin.ts`
- `lib/uploads/images.ts`

Patterns used:

- Typed request/response contracts
- Query-string builders with `URLSearchParams`
- `encodeURIComponent` for route params
- Domain-specific helper utilities per module

## 8. Rendering Strategy

The app uses a hybrid approach:

- Server-side prefetch for selected pages:
  - explore initial videos
  - video metadata and existence checks
  - channel metadata and initial data
- Client-side continuation for:
  - infinite scroll
  - authenticated mutations
  - live user-specific state

This balances performance, SEO metadata quality, and interactive behavior.

## 9. Feature Areas

### 9.1 Auth

- Login/register forms with Zod validation
- Shared auth page shell and reusable auth field components
- Error handling through `useAuthSubmit`

### 9.2 Explore and Search

- Infinite scroll with deduplication
- Error and empty states
- Optional development popup behavior on explore

### 9.3 Video Watch Page

- Video player + info + comments + related videos
- Parallel initial fetches (video, related list, comments)
- Pagination for related videos

### 9.4 Channel Page

- Banner/avatar/profile stats
- Follow/unfollow behavior
- Followers/following modal lists
- Video grid with incremental loading

### 9.5 Profile

Tabs:

- Channel tab
- Videos tab (includes upload entry card and delete flow)
- Account tab (session list, revoke actions)

### 9.6 Upload

Multi-step state machine:

1. Select video
2. Enter details
3. Add optional thumbnail
4. Upload and monitor progress

Validation and normalization include:

- title/description limits
- tag normalization
- license selection

### 9.7 Moderator and Admin

- Moderator:
  - filterable queue
  - approve/reject actions
  - delete capability
- Admin:
  - user search/filter
  - role changes
  - ban/unban actions
  - per-user expanded details

## 10. State Management

### React Query

- Server-state fetch lifecycle and caching
- Auth identity query keyed as `['me']`

### Zustand stores

- `auth` store:
  - token
  - hydration readiness
  - persistence in `localStorage`
- `preference` store:
  - player volume/mute preferences

### Local component state

Used for UI transitions, dialogs, request-status flags, and optimistic updates.

## 11. Styling and Design System

### Tokens and theme

- Global CSS variables in `app/globals.css`
- semantic color mapping (`background`, `foreground`, `primary`, etc.)
- dark mode class support

### Component styling

- Utility classes through Tailwind
- Variants built with `class-variance-authority`
- Helper `cn` for class merging (`clsx` + `tailwind-merge`)

## 12. Conventions and Patterns

### Naming

- Files/directories: `kebab-case`
- Components/types: `PascalCase`
- Variables/functions: `camelCase`

### Type and state patterns

- Strict typing for API payloads
- Standardized loading status enums (`idle`, `loading`, `ready`, `error`)
- Helper-based deduplication for paged lists

### Safety patterns

- Request-sequence or cancellation guards to avoid stale updates
- Sanitized redirects for callback URLs
- Graceful auth fallback behavior

## 13. Accessibility Practices

Current patterns include:

- `aria-*` attributes on form fields and errors
- dialog semantics for confirmations
- keyboard handling on interactive cards
- SR-only live regions for async status in search

## 14. SEO and Metadata

Metadata is configured at:

- root level (`app/layout.tsx`)
- feature layouts and pages for canonical URLs, robots, Open Graph, and Twitter cards

Dynamic metadata generation is used for:

- channel pages
- video pages

## 15. Error Handling Strategy

- API errors normalized via `lib/api-error.ts`
- User-facing toasts for operational feedback
- Dedicated empty/error/loading UI states in major pages
- Conservative fallback behavior on failed pagination fetches

## 16. Local Development Workflow

### Setup

```bash
npm install
npm run dev
```

### Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Quality checks

```bash
npm run lint
npx tsc --noEmit
```

## 17. Notes and Future Improvements

Potential next improvements:

- Add automated tests (unit/integration/e2e)
- Split very large page components into smaller feature modules
- Add explicit docs for API contract versioning
- Add a formal `LICENSE` file
- Add contribution templates (`.github/ISSUE_TEMPLATE`, PR template)
