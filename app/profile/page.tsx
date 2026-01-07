"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Tabs from "@/components/ui/Tabs"
import ChannelTab from "@/components/app/profile/ChannelTab";
import VideosTab from "@/components/app/profile/VideosTab";
import AccountTab from "@/components/app/profile/AccountTab";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?callbackUrl=/profile`);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    {
      id: "channel",
      label: "Channel",
      content: <ChannelTab user={user} />,
    },
    {
      id: "videos",
      label: "Videos",
      content: <VideosTab user={user} />,
    },
    {
      id: "account",
      label: "Account",
      content: <AccountTab user={user} />,
    },
  ];

  const requestedTab = searchParams.get("tab");
  const defaultTab = tabs.some((tab) => tab.id === requestedTab)
    ? requestedTab ?? "channel"
    : "channel";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <Tabs tabs={tabs} defaultTab={defaultTab} />
    </div>
  );
}
