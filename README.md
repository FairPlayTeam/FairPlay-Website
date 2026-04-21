# FairPlay Frontend

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-149ECA)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4)
![License](https://img.shields.io/badge/License-GNU%20AGPLv3-blue.svg)

The FairPlay web frontend, built with Next.js App Router, TypeScript, Tailwind CSS v4, React Query, and Zustand.

## What This Repository Contains

- A marketing homepage at `/`
- Authentication flows at `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/verify-email`
- Discovery and search experiences at `/explore`, `/subscriptions`, and `/search`
- Video playback pages at `/video/[id]`
- Public creator pages at `/channel/[username]`
- Authenticated account management at `/profile`
- A multi-step upload flow at `/upload`
- Moderator and admin tooling at `/moderator` and `/admin`

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS v4
- Radix UI primitives with a custom component layer
- TanStack Query for async server state
- Zustand for persisted client-side state
- Axios for API requests
- React Hook Form + Zod for form handling and validation
- Framer Motion for motion and transitions
- Sonner for toast notifications

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local` at the project root with:

```bash
NEXT_PUBLIC_API_BASE_URL=https://apiv2.fairplay.video
```

This variable is required. The app throws at startup if `NEXT_PUBLIC_API_BASE_URL` is missing.

You can also point the frontend to a local or custom backend implementation. The current documentation references the TypeScript backend at [FairPlayTeam/ts-backend](https://github.com/FairPlayTeam/ts-backend).

You can start from the included `.env.example`.

### Run the Development Server

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Available Scripts

- `npm run dev` starts the Next.js development server
- `npm run build` creates a production build
- `npm run start` serves the production build
- `npm run lint` runs ESLint
- `npm run test` runs the automated unit test suite
- `npm run typecheck` runs the TypeScript checker without emitting files
- `npm run format` formats the repository with Prettier

## Recommended Local Checks

Before opening a pull request, run:

```bash
npm run lint
npm run test
npm run typecheck
```

If you want to normalize formatting before committing:

```bash
npm run format
```

## Project Structure

```text
app/          Next.js routes, layouts, metadata, sitemap, and page entry points
components/   Reusable UI, app features, and marketing sections
context/      React providers for auth and layout state
hooks/        Shared client hooks
lib/          API clients, domain types, stores, utilities, and SEO helpers
public/       Static assets used by the marketing site and metadata
docs/         Repository-level technical documentation
```

## Architecture Highlights

- The app uses the Next.js App Router with a hybrid rendering model.
- Marketing pages are public and SEO-oriented.
- Product pages mix server-side bootstrapping with client-side interactivity.
- Authentication is mediated by Next.js route handlers that store the backend session key in an `HttpOnly` cookie.
- Login and verification handlers forward client IP and user-agent metadata to the backend so auth rate limiting and session history stay accurate behind the frontend BFF.
- Client-side API requests are proxied through same-origin Next.js routes that attach the bearer token server-side.
- Sensitive areas are checked server-side against the backend session and reinforced client-side with sanitized callback URLs.
- Protected routes distinguish between an expired session and a temporarily unavailable auth backend, redirecting the latter to a dedicated recovery screen instead of treating it as a logout.
- Client-side auth hydration preserves a distinct "service unavailable" state so public surfaces do not misleadingly fall back to login prompts when the auth backend is down.
- Uploads are sent as multipart form data to the backend.

For a more detailed technical walkthrough, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Conventions

- Path aliases use `@/*`
- TypeScript runs in strict mode
- Shared utilities live in `lib/`
- Reusable UI primitives live in `components/ui/`
- Domain-specific feature components are grouped under `components/app/` and `components/marketing/`
- File and folder names are primarily `kebab-case`

## Security Notes

- The frontend expects a public API base URL via `NEXT_PUBLIC_API_BASE_URL`
- Authenticated requests flow through same-origin Next.js proxy routes
- The backend session key is stored only in an `HttpOnly` cookie
- Redirect targets are sanitized to reduce open redirect risk
- Admin and moderator routes are excluded from indexing through metadata and `robots.ts`

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines on branching, conventions, and the pull request process.

## License

This project is licensed under the GNU AGPLv3.

See the LICENSE file for details.
