# FairPlay Frontend Architecture

This document describes how the FairPlay frontend is structured, how data and UI responsibilities are split, and which conventions shape the current codebase.

## 1. System Overview

This project is a Next.js 16 application built with the App Router. It serves three broad responsibilities from a single frontend codebase:

- the public marketing website
- the product experience for viewers and creators
- internal back-office surfaces for moderation and administration

At a high level:

- `app/` defines route segments, layouts, metadata, sitemap generation, and page entry points
- `components/` contains reusable UI and feature-specific presentation logic
- `lib/` holds API modules, domain types, utilities, SEO helpers, and persisted stores
- `context/` and `hooks/` provide cross-cutting client behavior such as authentication, sidebar state, scrolling, and upload helpers

## 2. Runtime Model

The codebase uses a hybrid rendering strategy.

### Server-side responsibilities

Server components are used where they add SEO or perceived performance value:

- route metadata generation
- initial fetching for selected public pages
- sitemap generation
- existence checks for dynamic resources such as videos and channels

Examples:

- `app/(feed)/explore/page.tsx` fetches the initial list of videos on the server
- `app/(feed)/video/[id]/page.tsx` resolves metadata and 404 behavior for a video
- `app/channel/[username]/page.tsx` fetches the initial channel payload and metadata

### Client-side responsibilities

Client components handle interactive and session-aware behavior:

- login and registration forms
- infinite scroll
- mutations such as follow, rate, comment, upload, moderation actions, and admin actions
- local UI state
- persisted preferences and session-aware behavior

## 3. Route Topology

The routing model is organized around user-facing areas.

### Public-facing routes

- `/` renders the marketing homepage
- `/terms` contains terms content
- `/channel/[username]` exposes public creator pages
- `/video/[id]` exposes public watch pages

### Auth routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/register/verify`
- `/verify-email`

These routes live under `app/(auth)/`.

### Product routes

- `/explore`
- `/subscriptions`
- `/search`
- `/profile`
- `/upload`

### Internal routes

- `/moderator`
- `/admin`

These use the same application shell as the product surfaces, but are marked as non-indexable in route metadata and in the robots configuration.

## 4. Layout Architecture

The root layout in `app/layout.tsx` provides:

- global metadata defaults
- global CSS import
- the React Query provider
- the theme provider
- the auth provider
- the global toast outlet

The app-like sections use `AppShell`, which assembles:

- `AppTopbar`
- `AppSidebar`
- a loading overlay while auth hydration completes
- layout adjustments for the video watch page

`AppShell` is used by:

- `app/(feed)/layout.tsx`
- `app/channel/layout.tsx`
- `app/profile/layout.tsx`
- `app/search/layout.tsx`
- `app/upload/layout.tsx`
- `app/moderator/layout.tsx`
- `app/admin/layout.tsx`

The marketing routes use a separate top-level presentation layer centered around:

- `MarketingTopbar`
- `MarketingFooter`
- section-based content under `components/marketing/`

## 5. Data and API Layer

### API client

`lib/api.ts` exports a shared Axios instance configured with:

- a same-origin `/api/proxy` base URL
- `withCredentials: true`

Authenticated browser requests flow through Next.js route handlers. Those handlers read the session key from an `HttpOnly` cookie and attach the backend bearer token server-side before forwarding the request upstream.

If the environment variable is missing, the app throws early.

### Domain modules

The API surface is organized by domain module:

- `lib/auth/api.ts`
- `lib/video.ts`
- `lib/comments.ts`
- `lib/users.ts`
- `lib/moderation.ts`
- `lib/admin.ts`
- `lib/uploads/images.ts`

Common patterns across these modules:

- typed response payloads
- `URLSearchParams` for query construction
- `encodeURIComponent` for dynamic path segments
- small server-side fetch helpers where SSR or metadata generation needs them

### Server fetch helpers

Public routes that need server-side data use `fetch()` directly against the configured API base URL. This is visible in helpers such as:

- `getVideosServer`
- `getVideoServer`
- `getUserServer`
- `getUserVideosServer`

This keeps SEO-relevant routes functional without depending on client-only state.

## 6. Authentication and Session Flow

Authentication is session-based from the frontend's point of view, while the backend still receives bearer-token authorization.

### Session storage

- the backend session key is stored in a server-managed `HttpOnly` cookie
- login and email-verification flows are mediated by Next.js route handlers under `app/api/auth/`
- client-side JavaScript never reads or writes the session key directly

### Auth proxy layer

The frontend uses a lightweight BFF-style layer:

- `app/api/auth/login/route.ts` exchanges credentials for a backend session key and stores it in the `HttpOnly` cookie
- `app/api/auth/forgot-password/route.ts` forwards password reset requests with the original client metadata headers preserved
- `app/api/auth/reset-password/route.ts` completes password resets and clears any stale local session cookie after success
- `app/api/auth/verify-email/route.ts` does the same after email verification
- `app/api/auth/logout/route.ts` revokes the current backend session before clearing the cookie, so client logout success stays aligned with backend revocation
- `app/api/proxy/[...path]/route.ts` forwards authenticated API calls and injects the bearer token server-side
- `app/api/media/[...path]/route.ts` proxies authenticated media requests such as HLS manifests and segments when the media URL originates from the configured API base

The auth session-creation handlers also forward client metadata headers such as `user-agent`, `x-forwarded-for`, and `x-real-ip` to the backend. This keeps backend rate limiting and session device/IP history accurate even though login and verification are mediated by the frontend.

### Auth hydration

`AuthProvider` in `context/auth-context.tsx` resolves the current user with React Query.

Once mounted:

- it fetches `/auth/me`
- a `401` clears the server-side session cookie and resolves to an unauthenticated state
- transport failures and `5xx` responses are treated as auth-service outages, not as user logout
- the backend auth middleware preserves that distinction by returning `503` when session validation itself is temporarily unavailable, instead of collapsing those failures into `401`
- the client auth context exposes that outage as a dedicated `unavailable` state, allowing the UI to avoid misleading login prompts or infinite loading states
- authenticated sections can safely wait on `isReady`

### Redirect safety

`lib/safe-redirect.ts` sanitizes callback URLs to prevent unsafe redirects. Invalid or blocked callback targets fall back to `/explore`.

This logic is used across:

- login redirects
- auth guard flows
- upload and protected page access checks

Protected route layouts combine that redirect safety with server-side gating:

- `app/profile/layout.tsx`
- `app/upload/layout.tsx`
- `app/(feed)/subscriptions/layout.tsx`
- `app/moderator/layout.tsx`
- `app/admin/layout.tsx`

If the backend cannot validate the current session because it is unavailable, protected routes redirect to `/service-unavailable` instead of redirecting users to `/login`.

## 7. State Management

The project uses three complementary state layers.

### React Query

React Query manages asynchronous server state such as:

- current user data
- refetch flows after login or session changes

The shared query client lives in `lib/query-client.ts`.

### Zustand

One persisted store is currently central:

- `preference-storage`
  - volume
  - mute state
  - theatre mode
  - playback rate
  - looping
  - preferred quality
  - ambilight preference

### Local component state

Feature components still own ephemeral state for:

- dialogs
- in-progress mutations
- step transitions
- pagination state
- error presentation

## 8. Feature Modules

### Marketing

The homepage is built from section-oriented components under `components/marketing/`.

Notable characteristics:

- animated marketing shell
- custom section composition
- theme toggle support
- integrated screenshots and static media from `public/`

### Explore

The explore page fetches an initial server-rendered batch, then continues on the client for interaction and incremental loading.

Key traits:

- page-based API pagination
- resilient fallback when the initial request fails
- SEO-friendly first render

### Search

Search is client-driven and query-string based.

Key traits:

- reads `q` from `useSearchParams()`
- uses infinite scroll
- merges paginated results without duplicates
- supports mixed result types from the backend response format

### Video Watch

The watch experience is centered on the player and supporting engagement surfaces:

- HLS playback
- ratings
- comments and replies
- related videos
- player preferences stored in Zustand

The route resolves metadata server-side before hydrating the interactive page client.

Comment deletion follows an explicit contract:

- comments without replies are hard-deleted
- comments with replies are soft-deleted and kept as `[deleted]` placeholders
- the delete response exposes a `deletionMode` field so the client does not have to infer behavior from a free-form message

### Channel

The channel page combines:

- creator identity and banner
- follower/following surfaces
- follow actions
- paginated video grids

It uses server-rendered initial data, then client-side updates and pagination.

### Profile

The profile surface groups personal account management, including:

- editable profile information
- videos management
- session management

### Upload

The upload flow is implemented as a client-side multi-step process:

1. choose a video file
2. fill in details
3. optionally add a thumbnail
4. upload and monitor progress

The actual upload request is sent as `multipart/form-data` to `/upload/video-bundle`.

### Moderator and Admin

Internal tools use dedicated domain modules:

- moderators work with video review queues and moderation actions
- admins manage users, roles, and ban state

These pages are present in the frontend, and protected layouts verify the current session server-side through `lib/auth/server-session.ts`. Final authorization still depends on the backend enforcing roles and permissions.

### Hook conventions per feature

Feature-level hooks follow a consistent naming pattern. Hooks that encapsulate a mutation are named `use<Action>` (for example, `useFollowChannel`, `useSubmitRating`). Hooks that manage a query or derived state are named `use<Resource>` (for example, `useVideoComments`, `useChannelData`). When adding a new feature, place its hooks in a co-located `hooks/` folder under the relevant `components/app/` directory, or in the top-level `hooks/` folder if the hook is shared across more than one feature.

## 9. Rendering, Metadata, and SEO

SEO is an intentional part of the architecture for public routes.

### Metadata

`lib/seo.ts` centralizes:

- site URL
- site name
- default description
- Open Graph defaults
- Twitter defaults

Dynamic metadata is generated for:

- video pages
- channel pages

### Sitemap

`app/sitemap.ts` builds a sitemap from:

- static pages such as `/`, `/explore`, and `/terms`
- paginated video data fetched from the backend API

### Robots

`app/robots.ts` allows general crawling while disallowing:

- `/admin`
- `/moderator`

Route-level metadata further marks sensitive product areas such as profile and upload as non-indexable.

## 10. Styling and Design System

The design layer combines Tailwind CSS v4 with reusable UI primitives.

### Foundations

- global styles live in `app/globals.css`
- design tokens are exposed through CSS variables
- theming is managed with `next-themes`

### Reusable UI

`components/ui/` contains shared primitives such as:

- buttons
- inputs
- dialogs
- badges
- sliders
- tabs
- switches

These components use patterns such as:

- `class-variance-authority`
- `clsx`
- `tailwind-merge`

### Motion

Framer Motion is used primarily in the marketing experience and interactive layout transitions.

## 11. Conventions and Engineering Practices

Current conventions reflected in the codebase:

- TypeScript strict mode is enabled
- path aliases use `@/*`
- most shared UI state uses explicit status values like `idle`, `loading`, `ready`, and `error`
- API shapes are typed close to their request modules
- backend admin and moderation routes validate dynamic sort fields against allow-lists instead of passing arbitrary values through to Prisma
- public routes favor server-side bootstrapping when that benefits metadata or first paint
- interactive flows favor small hooks and feature helpers over large monolithic utilities

Naming tends to follow:

- `PascalCase` for React component files
- `kebab-case` for many shared files and folders
- `camelCase` for utilities, hooks, and functions

## 12. Tests

The project includes a lightweight automated test suite powered by TypeScript compilation plus Node's built-in test runner.

Current coverage focuses on small, critical, pure modules such as:

- auth session resolution logic
- safe redirect handling

Run the suite with:

```bash
npm run test
```

This is small for now, but it establishes a real regression net and CI entry point for the most failure-prone control-flow code.

## 13. Security Considerations

Important security-related behaviors already present:

- unsafe callback URLs are rejected
- authenticated browser requests are forwarded through same-origin Next.js handlers that attach the bearer token server-side
- protected screens redirect unauthenticated users toward login, including in sensitive server-rendered layouts
- non-public surfaces are flagged as non-indexable
- role-sensitive layouts can reject unauthorized users before client hydration by verifying the current backend session

Important tradeoff to understand:

- the backend session format is still token-based, so the Next.js auth proxy must remain aligned with the backend contract
- server-side proxying adds a small amount of infrastructure complexity, but it removes the need to expose the session key to client-side JavaScript

Recommended practices when working in this area:

- always call the logout helper rather than clearing cache state directly, so backend revocation and cookie cleanup happen together
- keep authenticated browser requests on the same-origin proxy layer instead of calling the backend directly from client code
- ensure new protected routes both redirect unauthenticated users and are marked as non-indexable in route metadata
