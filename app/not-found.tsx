'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
}

function NotFoundContent() {
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()
  const search = searchParams ? `?${searchParams.toString()}` : ''
  const path = `${pathname}${search}`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold">404 — Page not found</h1>
      <p className="mt-4 text-gray-600">The page you’re looking for doesn’t exist.</p>
      <a href="/" className="mt-6 text-blue-600">Back to home</a>
      <a href={`https://lab.fairplay.video/${path}`} className="mt-6 text-blue-600">Try on the old version of the site</a>
    </div>
  )
}