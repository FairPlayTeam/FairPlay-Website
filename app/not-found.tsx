'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

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
    <SidebarProvider>
          <div className="min-h-screen bg-background text-text">
            <Topbar />
            <div className="flex pt-16">
              <Sidebar />
              <main className="flex-1 lg:ml-60">{
                <div className="min-h-screen flex flex-col items-center justify-center">
                  <h1 className="text-5xl font-bold">404 — Page not found</h1>
                  <p className="mt-4 text-gray-600">The page you’re looking for doesn’t exist.</p>
                  <Link href="/" className="mt-6 text-blue-600">Back to home</Link>
                  <Link href={`https://lab.fairplay.video/${path}`} className="mt-6 text-blue-600">Try on the old version of the site</Link>
                </div>
            }</main>
            </div>
          </div>
        </SidebarProvider>
    
  )
}