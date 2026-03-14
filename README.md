# FairPlay Frontend

FairPlay's web frontend, built with Next.js App Router, TypeScript, Tailwind CSS v4, React Query, and Zustand.

## Overview

This repository contains the full client-side experience for:

- Authentication (`/login`, `/register`)
- Discovery feed (`/explore`, `/search`)
- Video playback (`/video/[id]`)
- Public channels (`/channel/[username]`)
- User profile management (`/profile`)
- Upload flow (`/upload`)
- Moderation and admin tools (`/moderator`, `/admin`)

## Tech Stack

- Next.js `16` (App Router)
- React `19`
- TypeScript (strict mode)
- Tailwind CSS v4 + `tw-animate-css`
- Radix UI primitives + custom UI layer
- TanStack Query (React Query)
- Zustand (persistent client stores)
- Axios for API calls
- Zod + React Hook Form for form validation
- Sonner for toast notifications

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Environment Variables

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Install and Run

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Scripts

- `npm run dev`: Start local dev server
- `npm run build`: Create production build
- `npm run start`: Run production build
- `npm run lint`: Run ESLint checks

## Recommended Checks Before Push

```bash
npm run lint
npx tsc --noEmit
```

## Project Structure

```text
app/          Route segments, pages, and layouts (App Router)
components/   Reusable UI + domain components
context/      React context providers (auth, sidebar)
hooks/        Shared custom hooks
lib/          API clients, stores, utilities, domain types
public/       Static assets
```

## Architecture Docs

For a full technical walkthrough, see:

- [Architecture Guide](docs/ARCHITECTURE.md)

## Conventions

- File names: `kebab-case`
- React components and types: `PascalCase`
- Variables and functions: `camelCase`
- Shared imports use alias: `@/*`
- UI state patterns are standardized (`idle/loading/ready/error`)

## Security Notes

- Frontend auth uses a Bearer token transport.
- `callbackUrl` redirects are sanitized via `lib/safe-redirect.ts`.
- Unauthorized access is handled by route-level guards and auth context.

## Contributing

1. Create a branch from `main`.
2. Keep changes scoped and consistent with existing conventions.
3. Run lint and type checks locally.
4. Open a pull request with:
   - problem summary
   - implementation details
   - screenshots/videos for UI updates

## License

No license file is currently defined in this repository.
