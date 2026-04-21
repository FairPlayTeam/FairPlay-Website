"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthUnavailableNotice } from "@/components/app/auth/auth-unavailable-notice";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { buildServiceUnavailableHref } from "@/lib/safe-redirect";
import UploadDropzone from "./components/video-dropzone";
import ThumbnailDropzone from "./components/thumbnail-dropzone";
import UploadProgress from "./components/upload-progress";
import UploadDetailsFormFields from "./components/details-fields";
import UploadStepScreen from "./components/upload-step";
import {
  DEFAULT_UPLOADING_LABEL,
  MAX_THUMBNAIL_BYTES,
  MAX_THUMBNAIL_MB,
  MAX_VIDEO_UPLOAD_TOTAL_BYTES,
  MAX_VIDEO_UPLOAD_TOTAL_MB,
  UPLOAD_STEPS,
  type UploadStep,
} from "./upload-constants";
import { uploadVideo } from "./upload-api";
import {
  createIdleUploadRequestState,
  getCombinedUploadState,
  resolveUploadErrorMessage,
  type UploadRequestState,
} from "./upload-helpers";
import { type UploadFormValues, uploadSchema } from "./upload-schema";

const primaryActionClassName = "flex-1";
const secondaryActionClassName = "flex-1";

const STEP_META: Record<UploadStep, { title: string; subtitle?: string }> = {
  1: { title: "Select your file" },
  2: { title: "Add details", subtitle: "Title, description, tags." },
  3: {
    title: "Choose a thumbnail",
    subtitle: "Optional. We recommend a 16:9 format (for example 1280x720).",
  },
  4: { title: "Upload video" },
};

export default function UploadPage() {
  const router = useRouter();
  const { user, isLoading, isUnavailable, errorMessage } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [videoRequest, setVideoRequest] = useState<UploadRequestState>(
    createIdleUploadRequestState,
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<UploadStep>(1);
  const uploadAbortControllerRef = useRef<AbortController | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      allowComments: true,
      license: "all_rights_reserved",
    },
  });

  const resetUploadSession = () => {
    setThumbnailFile(null);
    setThumbnailError(null);
    setVideoRequest(createIdleUploadRequestState());
  };

  const resetAll = () => {
    setFile(null);
    setFileError(null);
    resetUploadSession();
    setCurrentStep(1);
    reset();
  };

  useEffect(() => {
    return () => {
      uploadAbortControllerRef.current?.abort();
      uploadAbortControllerRef.current = null;
    };
  }, []);

  const handleFileSelect = (nextFile: File | null) => {
    resetUploadSession();
    setCurrentStep(1);

    if (!nextFile) {
      setFile(null);
      setFileError(null);
      return;
    }

    if (!nextFile.type.startsWith("video/")) {
      setFile(null);
      setFileError("The selected file must be a video.");
      return;
    }

    if (nextFile.size > MAX_VIDEO_UPLOAD_TOTAL_BYTES) {
      setFile(null);
      setFileError(`Videos are limited to ${MAX_VIDEO_UPLOAD_TOTAL_MB} MB.`);
      return;
    }

    setFile(nextFile);
    setFileError(null);
    setCurrentStep(2);
  };

  const handleThumbnailSelect = (nextFile: File | null) => {
    if (!nextFile) {
      setThumbnailFile(null);
      setThumbnailError(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      setThumbnailFile(null);
      setThumbnailError("The selected file must be an image.");
      return;
    }

    if (nextFile.size > MAX_THUMBNAIL_BYTES) {
      setThumbnailFile(null);
      setThumbnailError(`Thumbnails are limited to ${MAX_THUMBNAIL_MB} MB.`);
      return;
    }

    setThumbnailFile(nextFile);
    setThumbnailError(null);
  };

  const onSubmit = async (data: UploadFormValues) => {
    if (!file) {
      setFileError("Video file is required.");
      setCurrentStep(1);
      return;
    }

    setCurrentStep(4);
    setVideoRequest({
      state: "uploading",
      progress: 0,
      error: null,
      uploadingLabel: DEFAULT_UPLOADING_LABEL,
    });

    try {
      const controller = new AbortController();
      uploadAbortControllerRef.current = controller;

      await uploadVideo({
        file,
        thumbnail: thumbnailFile,
        values: data,
        signal: controller.signal,
        onProgress: ({ progress, label }) => {
          setVideoRequest((prev) => ({
            ...prev,
            progress,
            uploadingLabel: label,
          }));
        },
      });

      setVideoRequest({
        state: "done",
        progress: 100,
        error: null,
        uploadingLabel: DEFAULT_UPLOADING_LABEL,
      });

      toast.success(
        thumbnailFile
          ? "Upload complete! Video and thumbnail uploaded successfully."
          : "Upload complete! Your video is being processed.",
      );
    } catch (error) {
      const message = resolveUploadErrorMessage(error);
      setVideoRequest((prev) => ({
        ...prev,
        state: "error",
        error: message,
        uploadingLabel: DEFAULT_UPLOADING_LABEL,
      }));
      toast.error(message);
    } finally {
      uploadAbortControllerRef.current = null;
    }
  };

  const submitUpload = handleSubmit(onSubmit);
  const goToThumbnailStep = handleSubmit(() => setCurrentStep(3));

  const isUploading = videoRequest.state === "uploading";
  const totalTransitions = Math.max(1, UPLOAD_STEPS.length - 1);
  const stepProgress = Math.round(((currentStep - 1) / totalTransitions) * 100);
  const combinedUpload = getCombinedUploadState({ video: videoRequest });

  const { title, subtitle } = STEP_META[currentStep];

  if (isUnavailable && !user) {
    return (
      <AuthUnavailableNotice
        description={
          errorMessage ??
          "FairPlay could not confirm your session right now, so uploads are temporarily unavailable."
        }
        actionHref={buildServiceUnavailableHref("/upload")}
      />
    );
  }

  if (isLoading || !user) {
    return (
      <div className="h-[calc(100vh-5rem)] w-full grid place-items-center">
        <Spinner className="size-18" />
      </div>
    );
  }

  const stepContent: ReactNode = (() => {
    switch (currentStep) {
      case 1:
        return (
          <UploadDropzone
            file={file}
            error={fileError}
            disabled={isUploading}
            onFileSelect={handleFileSelect}
          />
        );
      case 2:
        return (
          <UploadDetailsFormFields
            file={file}
            disabled={isUploading}
            register={register}
            control={control}
            errors={errors}
            onChangeFile={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <ThumbnailDropzone
            file={thumbnailFile}
            error={thumbnailError}
            disabled={isUploading}
            onFileSelect={handleThumbnailSelect}
          />
        );
      case 4:
        return (
          <UploadProgress
            state={combinedUpload.state}
            progress={combinedUpload.progress}
            error={combinedUpload.error}
            labels={combinedUpload.labels}
            doneMessage="Your video is now being processed by our server. You can close this browser tab."
          />
        );
    }
  })();

  const stepActions: ReactNode = (() => {
    switch (currentStep) {
      case 2:
        return (
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={isUploading}
              className={secondaryActionClassName}
              onClick={() => setCurrentStep(1)}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={isUploading || !file}
              className={primaryActionClassName}
              onClick={goToThumbnailStep}
            >
              Next
            </Button>
          </>
        );
      case 3:
        return (
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={isUploading}
              className={secondaryActionClassName}
              onClick={() => setCurrentStep(2)}
            >
              Back to details
            </Button>
            <Button
              type="button"
              className={primaryActionClassName}
              onClick={() => submitUpload()}
              disabled={isUploading}
            >
              Start upload
            </Button>
          </>
        );
      case 4:
        return (
          <>
            {isUploading && (
              <Button
                type="button"
                variant="ghost"
                className={secondaryActionClassName}
                onClick={() => uploadAbortControllerRef.current?.abort()}
              >
                Cancel upload
              </Button>
            )}
            {videoRequest.state === "error" && (
              <Button
                type="button"
                className={primaryActionClassName}
                disabled={isUploading}
                onClick={() => submitUpload()}
              >
                Retry upload
              </Button>
            )}
            {combinedUpload.state === "done" && (
              <Button
                type="button"
                className={primaryActionClassName}
                disabled={isUploading}
                onClick={() => {
                  resetAll();
                  router.push("/profile?tab=videos");
                }}
              >
                Manage videos
              </Button>
            )}
          </>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="container px-5 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">Upload Video</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (currentStep === 4) submitUpload();
          }}
          className="space-y-6"
        >
          <UploadStepScreen
            title={title}
            subtitle={subtitle}
            stepProgress={stepProgress}
            actions={stepActions}
          >
            {stepContent}
          </UploadStepScreen>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Make sure to read our guidelines before publishing any video.
        </p>
      </div>
    </div>
  );
}
