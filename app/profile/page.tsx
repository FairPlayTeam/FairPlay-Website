"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import ChannelTab from "@/components/app/profile/ChannelTab";
import VideosTab from "@/components/app/profile/VideosTab";
import AccountTab from "@/components/app/profile/AccountTab";
import { useAuth } from "@/context/AuthContext";
import { MdOpenInNew } from "react-icons/md";

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
        <Spinner className="size-16" />
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
    ? (requestedTab ?? "channel")
    : "channel";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <a
          href={`/channel/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:ml-auto sm:w-auto"
        >
          <Button
            variant="ghost"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-5 py-2 text-sm font-semibold text-text-para transition hover:bg-white/10 sm:w-auto sm:px-6 sm:py-2.5"
          >
            <MdOpenInNew className="size-5" />
            <span>See Channel</span>
          </Button>
        </a>
      </div>
      <Tabs tabs={tabs} defaultTab={defaultTab} />
    </div>
  );
}
