"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const getCachedToken = () => {
    try {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("token");
    } catch {
        return null;
    }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type VideoCardProps = {
    thumbnailUrl: string | null;
    title: string;
    displayName?: string | null;
    subtitle?: string;
    meta?: string;
    onPress?: () => void;
    className?: string;
    variant?: "grid" | "list";
};

export function VideoCard({
    thumbnailUrl,
    title,
    displayName,
    subtitle,
    meta,
    onPress,
    className,
    variant = "grid",
}: VideoCardProps) {
    const isGrid = variant === "grid";
    const token = getCachedToken();
    const isApiUrl = !!thumbnailUrl && thumbnailUrl.startsWith(API_BASE_URL);
    const isSigned = !!thumbnailUrl && /[?&](X-Amz-|Signature=)/.test(thumbnailUrl);

    const [fetchedSrc, setFetchedSrc] = useState<string | null>(null);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        const resetTimer = setTimeout(() => setFetchedSrc(null), 0);

        if (!thumbnailUrl) {
            return () => clearTimeout(resetTimer);
        }

        if (isApiUrl && token && !isSigned) {
            let mounted = true;
            fetch(thumbnailUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch image");
                    return res.blob();
                })
                .then((blob) => {
                    if (!mounted) return;
                    const url = URL.createObjectURL(blob);
                    objectUrlRef.current = url;
                    setFetchedSrc(url);
                })
                .catch(() => {
                    if (mounted) setFetchedSrc(thumbnailUrl);
                });
            return () => {
                mounted = false;
                clearTimeout(resetTimer);
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                    objectUrlRef.current = null;
                }
            };
        } else {
            clearTimeout(resetTimer);
            const setTimer = setTimeout(() => setFetchedSrc(thumbnailUrl), 0);
            return () => clearTimeout(setTimer);
        }
    }, [thumbnailUrl, isApiUrl, isSigned, token]);

    const handlePress = (e: React.MouseEvent) => {
        e.preventDefault();
        onPress?.();
    };

    const imgSrc = fetchedSrc ?? undefined;

    return isGrid ? (
        <div
            onClick={handlePress}
            className={cn(
                "flex flex-col gap-2 flex-1 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors mb-3",
                className
            )}
        >
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-200 relative">
                {imgSrc ? (
                    <Image src={imgSrc} alt={title} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-300" />
                )}
            </div>
            <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
            <div>
                {displayName && (
                    <p className="text-sm font-medium text-gray-600 line-clamp-1">{displayName}</p>
                )}
                {meta && <p className="text-xs text-gray-500 line-clamp-1">{meta}</p>}
            </div>
        </div>
    ) : (
        <div
            onClick={handlePress}
            className={cn(
                "flex flex-row gap-3 rounded-lg p-2.5 cursor-pointer hover:bg-gray-50 transition-colors",
                className
            )}
        >
            <div className="w-36 h-20 rounded-md overflow-hidden bg-gray-200 relative">
                {imgSrc ? (
                    <Image src={imgSrc} alt={title} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-300" />
                )}
            </div>
            <div className="flex flex-col justify-center gap-1 flex-1">
                <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
                {subtitle && <p className="text-sm text-gray-600 line-clamp-1">{subtitle}</p>}
                {meta && <p className="text-xs text-gray-500 line-clamp-1">{meta}</p>}
            </div>
        </div>
    );
}