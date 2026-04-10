# FairPlay Frontend

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-149ECA)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4)
![License](https://img.shields.io/badge/License-GNU%20AGPLv3-blue.svg)

The FairPlay web frontend, built with Next.js App Router, TypeScript, Tailwind CSS v4, React Query, and Zustand.

## What This Repository Contains

- A marketing homepage at `/`
- Authentication flows at `/login`, `/register`, and `/verify-email`
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
- `npm run format` formats the repository with Prettier

## Recommended Local Checks

Before opening a pull request, run:

```bash
npm run lint
npx tsc --noEmit
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
- The in-app `/docs` routes now redirect to the repository documentation on GitHub.
- Product pages mix server-side bootstrapping with client-side interactivity.
- Authentication is handled with bearer tokens persisted in a Zustand store.
- The API client attaches the session token automatically on each request.
- Sensitive areas are prefiltered server-side with auth hint cookies and reinforced client-side with sanitized callback URLs.
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
- Authenticated requests use a bearer token stored in persisted client state
- Lightweight session and role hint cookies are mirrored client-side to support route gating in Next.js layouts
- Redirect targets are sanitized to reduce open redirect risk
- Admin and moderator routes are excluded from indexing through metadata and `robots.ts`

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on branching, conventions, and the pull request process.

## License

This project is licensed under the GNU AGPLv3.

See the LICENSE file for details.
