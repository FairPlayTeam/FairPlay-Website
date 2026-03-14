'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import ChannelTab from '@/components/app/profile/channel-tab'
import VideosTab from '@/components/app/profile/videos-tab'
import AccountTab from '@/components/app/profile/account-tab'
import { useAuth } from '@/context/auth-context'
import { buildAuthHref } from '@/lib/safe-redirect'

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(buildAuthHref('/login', '/profile'))
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-18" />
      </div>
    )
  }

  const tabs = [
    { id: 'channel', label: 'Channel', content: <ChannelTab user={user} /> },
    { id: 'videos', label: 'Videos', content: <VideosTab user={user} /> },
    { id: 'account', label: 'Account', content: <AccountTab user={user} /> },
  ]

  const requestedTab = searchParams.get('tab')
  const defaultTab = tabs.some((tab) => tab.id === requestedTab)
    ? (requestedTab ?? 'channel')
    : 'channel'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Link
          href={`/channel/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:ml-auto sm:w-auto"
        >
          <Button
            variant="outline"
            className="w-full rounded-full gap-2 px-5 py-2 text-sm font-semibold"
          >
            <ExternalLink className="size-4" />
            <span>See Channel</span>
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={defaultTab} className="gap-8">
        <TabsList variant="line" className="border-b border-border gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative rounded-none px-4 py-3 text-sm font-medium bg-transparent shadow-none
                                text-muted-foreground
                                data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none
                                after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5
                                after:scale-x-0 data-[state=active]:after:scale-x-100
                                after:bg-primary after:transition-transform after:duration-300 after:ease-spring"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

