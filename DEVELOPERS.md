# Developer Guide

This guide will help you get started with contributing to this repo.

## Local development

### Fork the repo

Start by creating a fork of this repo.

### Clone the repo

1. Clone your GitHub forked repo:

```sh
git clone https://github.com/<github_username>/FairPlay-Website.git
```

2. Navigate to the project directory:

```sh
cd FairPlay-Website
```

### Install dependencies

1. Install NodeJS and NPM:

Follow the instructions [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install NodeJS and NPM on your machine.

2. Install all the necessary dependencies:

```sh
npm install # or pnpm install
```

3. Copy the example `.env.example` file to `.env.local`:

```sh
cp .env.example .env.local # on Windows, will not work when using cmd.exe as your terminal: replace it with copy
```

4. Start the development server:

```sh
npm run dev # or pnpm dev
```

### Open a pull request

After making changes, you can go ahead and open a pull request. Write a short description of what you've changed. If your PR fixes an existing Issue(s), please mention it in the PR. Once you submit your PR, the FairPlay team will review it.

## Contribution Rules

### Use of Artificial Intelligence

Using AI to write code is discouraged.

- The use of AI is limited to CSS generation or information research.

- AI generated code must undergo rigorous review by a team member.

- AI should not be used to write critical code (security, authentication, network infrastructure).

### Code Conventions

FairPlay follows consistent code practices to maintain code quality.

1. Readability: code must be understandable by any contributor.

2. Language: all variable, functions, and class names, as well as comments must be in American English.

3. Comments: comment on complex parts of the code.

4. Tests: any new code added must be accompanied by unit tests when applicable.

5. Dependency Management: avoid adding unnecessary libraries, prefer native and lightweight solutions.

### Security & Quality

- No API keys or sensitive data must be committed to the repository. Use a .env file instead.

- Any detected security vulnerability must be reported immediately and fixed as a priority.

- The project aims for transparency: major decisions (technical or organizational) must be discussed publicly on Discord.

### Naming Conventions

#### Variable Naming Convention

All variables must be in **camelCase**, except constants which can be in all caps.

React components and pages must be in **PascalCase**.

#### File and Folder Naming Convention

All files and folders must follow the same naming convention to avoid errors, especially on case-sensitive systems (Linux).

**General Rules**

- Follow **kebab-case** or **camelCase**.

- Avoid spaces, accents, and special characters.

- The file extension must always be lowercase.

**Specific rules for Next.js/React**

React component files must always be in **PascalCase**.

eg. `VideoPlayer.tsx`, `UserCard.tsx`

Utility, hooks, and service files must remain in **camelCase**.

eg. `useFetch.ts`, `authService.ts`

**Folders**

Folders should be in **kebab-case**.

### Linting & Formatting

Ensure your code passes linting and formatting checks before submitting a PR:

```sh
npm run lint # or pnpm lint
npm run format # or pnpm format
```

This project uses Prettier for formatting and ESLint for linting to maintain a consistent style across the codebase.
