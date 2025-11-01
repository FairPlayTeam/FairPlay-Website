'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-2 p-6">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-gray-600">Page not found</p>
      <Link 
        href="/" 
        replace 
        className="mt-2 font-semibold text-black hover:underline"
      >
        Go home
      </Link>
    </div>
  );
}