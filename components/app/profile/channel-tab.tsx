"use client";

import Image from "next/image";
import { ChangeEvent, useRef } from "react";
import { Pencil } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useImagesUpload } from "@/hooks/use-images-upload";
import { useAuth } from "@/context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import UserAvatar from "@/components/ui/user-avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/users";
import { User } from "@/lib/users";
import { z } from "zod";

interface ChannelTabProps {
  user: User;
}

const channelFormSchema = z.object({
  username: z.string().min(1, "Username is required").min(3, "Username is too short"),
  displayName: z
    .union([z.string().min(3, "Display name is too short"), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  bio: z
    .union([z.string().min(3, "Bio is too short"), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
});

type ChannelFormValues = z.input<typeof channelFormSchema>;

export default function ChannelTab({ user }: ChannelTabProps) {
  const { uploadUserAvatar, uploadUserBanner } = useImagesUpload();
  const { refetchUser } = useAuth();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelFormSchema),
    defaultValues: {
      username: user.username,
      displayName: user.displayName || "",
      bio: user.bio || "",
    },
  });

  const onSubmit: SubmitHandler<ChannelFormValues> = async (values) => {
    try {
      await updateProfile(values);
      toast.success("Profile updated successfully!");
      await refetchUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleImageChange =
    (type: "avatar" | "banner") => async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      try {
        if (type === "avatar") {
          await uploadUserAvatar(file);
          toast.success("Avatar uploaded successfully!");
        } else {
          await uploadUserBanner(file);
          toast.success("Banner uploaded successfully!");
        }

        refetchUser();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        e.target.value = "";
      }
    };

  return (
    <div className="space-y-8">
      <div className="relative w-full h-48 md:h-64 bg-muted rounded-lg overflow-hidden group">
        {user.bannerUrl ? (
          <Image src={user.bannerUrl} alt="Channel banner" fill className="object-cover" />
        ) : (
          <div className="grid size-full place-items-center bg-muted text-muted-foreground">
            <span>No Banner</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => bannerInputRef.current?.click()}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Change Banner"
          aria-label="Change banner"
        >
          <Pencil className="size-4" />
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageChange("banner")}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 px-4 -mt-12 md:-mt-16 relative z-10">
        <div className="relative group self-center md:self-start">
          <div className="rounded-full p-1 bg-background">
            <UserAvatar user={user} className="size-30" />
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="absolute inset-0 grid place-items-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Change Avatar"
            aria-label="Change avatar"
          >
            <Pencil className="size-6" />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange("avatar")}
          />
        </div>

        <div className="flex-1 pt-4 md:pt-16 space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                autoComplete="name"
                aria-invalid={!!form.formState.errors.username}
                {...form.register("username")}
                disabled
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Display Name"
                autoComplete="name"
                aria-invalid={!!form.formState.errors.displayName}
                {...form.register("displayName")}
              />
              {form.formState.errors.displayName && (
                <p className="text-sm text-red-500">{form.formState.errors.displayName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="A short description about yourself"
                aria-invalid={!!form.formState.errors.bio}
                {...form.register("bio")}
              />
              {form.formState.errors.bio && (
                <p className="text-sm text-red-500">{form.formState.errors.bio.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="block ml-auto"
              disabled={form.formState.isSubmitting}
              aria-busy={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Updating..." : "Update"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
