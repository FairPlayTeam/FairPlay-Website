"use client"

import { useEffect, useRef } from 'react';
import { getCachedToken } from '@/services/token';
import Hls from 'hls.js';

type VideoPlayerProps = { uri: string; };

export function VideoPlayer({ uri }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !uri) return;

    let hls: Hls | null = null;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      try {
        video.crossOrigin = 'use-credentials';
      } catch (e) {
        console.warn("Impossible de définir crossOrigin sur le lecteur vidéo.", e);
      }
      video.src = uri;
    }
    else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
          const token = getCachedToken();
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
        },
      });

      hls.loadSource(uri);
      hls.attachMedia(video);
    }
    else {
      video.src = uri;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [uri]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full aspect-video bg-black"
    />
  );
}