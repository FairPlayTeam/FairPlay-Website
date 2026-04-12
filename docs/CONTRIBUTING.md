# Contributing to FairPlay Frontend

Contributions are welcome. This document covers how to get started, what conventions to follow, and what to keep in mind before opening a pull request.

## Before You Start

- Check existing issues and pull requests to avoid duplicating work.
- For significant changes, open an issue first to discuss the approach before writing code.
- Keep contributions scoped. Focused pull requests are easier to review and merge.

## Getting Started

Fork the repository and clone your fork:

```bash
git clone https://github.com/your-username/fairplay-frontend.git
cd fairplay-frontend
npm install
```

Create a `.env.local` file at the project root:

```bash
NEXT_PUBLIC_API_BASE_URL=https://apiv2.fairplay.video
```

You can also point this at a local backend. See the [backend repository](https://github.com/FairPlayTeam/ts-backend) for setup instructions.

Start the development server:

```bash
npm run dev
```

## Branching

Create a focused branch from `main` for each contribution:

```bash
git checkout -b fix/video-player-seek
git checkout -b feat/channel-sort-options
```

Branch names should reflect the change. Prefix with `feat/`, `fix/`, `chore/`, or `docs/` as appropriate.

## Making Changes

Follow the conventions described in [docs/ARCHITECTURE.md](ARCHITECTURE.md). A few things worth keeping in mind:

- New client components belong under `components/app/` or `components/marketing/` depending on context.
- New shared UI primitives belong under `components/ui/`.
- API logic belongs in the appropriate domain module under `lib/`.
- Hooks shared across features belong in `hooks/`.
- File and folder names are primarily `kebab-case`. Component files use `PascalCase`.
- TypeScript runs in strict mode. Avoid `any` unless strictly necessary.
- Use path aliases (`@/*`) rather than relative paths where possible.

## Before Opening a Pull Request

Run linting, tests, and type checking locally:

```bash
npm run lint
npm run test
npm run typecheck
```

If you want to normalize formatting:

```bash
npm run format
```

All three checks must pass cleanly before submitting.

## Pull Request Guidelines

- Write a clear title and description explaining what changed and why.
- Reference any related issues.
- Include screenshots or short recordings for UI changes.
- Document any behavior changes that affect the backend contract or user-facing flows.
- Keep the diff focused. Avoid mixing unrelated changes in a single pull request.

## Tests

The repository includes a small automated test suite for critical pure logic such as auth session handling and redirect sanitization.

When you add behavior with meaningful branching or failure handling:

- prefer extracting the logic into small pure helpers
- add or extend tests under `tests/`
- keep `npm run test` green alongside lint and typecheck

## Commit Style

Use short, imperative commit messages:

```
fix: correct redirect loop on token expiry
feat: add sort controls to channel video grid
chore: update Tailwind config for new token
```

Squash commits before merging if the branch history is noisy.

## Questions

If something in the codebase is unclear, open an issue or start a discussion. Contributions that improve documentation or clarify conventions are as welcome as code changes.
