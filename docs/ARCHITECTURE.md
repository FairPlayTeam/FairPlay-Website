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
- persisted preferences and session token management

## 3. Route Topology

The routing model is organized around user-facing areas.

### Public-facing routes

- `/` renders the marketing homepage
- `/docs` redirects to repository-hosted documentation on GitHub
- `/terms` contains terms content
- `/channel/[username]` exposes public creator pages
- `/video/[id]` exposes public watch pages

### Auth routes

- `/login`
- `/register`
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

- `baseURL` from `NEXT_PUBLIC_API_BASE_URL`
- request-time bearer token injection
- no cookie-based session transport

The app remains API-token based. The cookies introduced by the frontend are only lightweight route-gating hints for Next.js layouts, not an authoritative backend session mechanism.

If the environment variable is missing, the app throws early.

### Domain modules

The API surface is organized by domain module rather than by route folder:

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

Authentication is entirely token-based on the frontend.

### Token storage

- the bearer token is stored in a persisted Zustand store in `lib/stores/auth.ts`
- helper functions in `lib/auth/session.ts` read, set, and clear the token
- the Axios client reads the token synchronously before each request

### Auth hint cookies

To reduce flashes of protected UI during server rendering, the frontend mirrors a minimal auth state into client-set cookies in `lib/auth/cookies.ts`:

- `fairplay_session_hint`
- `fairplay_role_hint`

These cookies are synchronized when the session changes and are consumed by `lib/auth/server-guard.ts` inside protected Next.js layouts. They help the frontend decide whether to redirect early, but backend authorization still remains the source of truth.

### Auth hydration

`AuthProvider` in `context/auth-context.tsx` waits for Zustand persistence hydration before enabling the current-user query.

Once hydrated:

- it fetches `/auth/me`
- a `401` clears the token and resolves to an unauthenticated state
- authenticated sections can safely wait on `isReady`

### Redirect safety

`lib/safe-redirect.ts` sanitizes callback URLs to prevent unsafe redirects. Invalid or blocked callback targets fall back to `/explore`.

This logic is used across:

- login redirects
- auth guard flows
- upload and protected page access checks

Protected route layouts now combine that redirect safety with server-side gating:

- `app/profile/layout.tsx`
- `app/upload/layout.tsx`
- `app/(feed)/subscriptions/layout.tsx`
- `app/moderator/layout.tsx`
- `app/admin/layout.tsx`

## 7. State Management

The project uses three complementary state layers.

### React Query

React Query manages asynchronous server state such as:

- current user data
- refetch flows after login or session changes

The shared query client lives in `lib/query-client.ts`.

### Zustand

Two persisted stores are currently central:

- `auth-store`
  - session token
  - hydration readiness
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

Repository documentation now lives in markdown under `docs/`, while the application-level `/docs` routes simply redirect to the GitHub-hosted documentation entry points.

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

These pages are present in the frontend, and protected layouts now prefilter access during server rendering using auth hint cookies. Final authorization still depends on the backend enforcing roles and permissions.

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
- public routes favor server-side bootstrapping when that benefits metadata or first paint
- interactive flows favor small hooks and feature helpers over large monolithic utilities

Naming tends to follow:

- `PascalCase` for React component files
- `kebab-case` for many shared files and folders
- `camelCase` for utilities, hooks, and functions

## 12. Tests

The project does not currently have an automated test suite. When adding logic that would benefit from unit or integration tests, structure it so tests can be attached later, small pure functions, explicit dependencies, and minimal side effects at the module boundary are good foundations.

## 13. Security Considerations

Important security-related behaviors already present:

- unsafe callback URLs are rejected
- authenticated requests only attach a token when one exists
- protected screens redirect unauthenticated users toward login, including in sensitive server-rendered layouts
- non-public surfaces are flagged as non-indexable
- role-sensitive layouts can reject unauthorized users before client hydration by reading auth hint cookies

Important tradeoff to understand:

- the bearer token is persisted client-side, which is simple and explicit, but means frontend code must remain careful about storage, logout behavior, and session invalidation semantics
- auth hint cookies improve UX for route gating, but they are frontend-managed hints and must never be treated as a replacement for backend authorization

Recommended practices when working in this area:

- always call the logout helper rather than clearing state directly, so token removal and query cache invalidation happen together
- avoid reading the token outside of `lib/auth/session.ts` and the Axios interceptor
- ensure new protected routes both redirect unauthenticated users and are marked as non-indexable in route metadata
