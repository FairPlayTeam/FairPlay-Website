"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs"
import ChannelTab from "@/components/app/profile/ChannelTab";
import VideosTab from "@/components/app/profile/VideosTab";
import AccountTab from "@/components/app/profile/AccountTab";
import { useAuth } from "@/context/AuthContext";
import { FaExternalLinkAlt } from "react-icons/fa";

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
    ? requestedTab ?? "channel"
    : "channel";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <a
          href={`/channel/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto"
        >
          <Button
            variant="ghost"
            className="rounded-full text-text-para hover:bg-white/5
            inline-flex items-center justify-center px-6.25 py-2 gap-3"
          >
            <FaExternalLinkAlt /> See Channel
          </Button>
        </a>
      </div>
      <Tabs tabs={tabs} defaultTab={defaultTab} />
    </div>
  );
}
