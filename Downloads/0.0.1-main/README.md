# OpenStream

This project uses **Next.js** with **Supabase** for backend services. All application code lives under the `src/` directory.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file at the project root and provide your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

3. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser to see the app.

## Scripts

- `npm run dev` – start the Next.js dev server
- `npm run build` – build the application for production
- `npm run lint` – run ESLint

## Project structure

- `src/pages` – application pages
- `src/components` – reusable React components
- `src/lib` – shared utilities such as the Supabase client
- `src/lib/recommend.ts` – suggestion algorithm combining user theme preferences and video ratings
- `src/app` – Next.js root layout and global styles

## Public API

The application exposes a public API under `/api/v1`. Currently the following endpoint is available:

- `GET /api/v1/videos` – list all uploaded videos

Videos can have several tags. When uploading, type `/` in the tag field to get suggestions based on existing tags.

Feel free to adapt and extend this project for your own needs.
