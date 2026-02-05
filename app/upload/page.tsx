"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/Toast/toast-utils";
import UploadDropzone from "./components/UploadDropzone";
import ThumbnailDropzone from "./components/ThumbnailDropzone";
import UploadProgress from "./components/UploadProgress";
import UploadDetailsFormFields from "./components/UploadDetailsFormFields";
import UploadStepScreen from "./components/UploadStepScreen";
import { UPLOAD_STEPS, type UploadStep } from "./upload-constants";
import { uploadVideo } from "./upload-api";
import {
  createIdleUploadRequestState,
  getCombinedUploadState,
  resolveUploadErrorMessage,
  type UploadRequestState,
} from "./upload-helpers";
import { uploadSchema, type UploadFormValues } from "./upload-schema";

const primaryActionClassName =
  "w-full rounded-lg sm:min-w-50 hover:shadow-[0_0_25px_rgba(0,0,0,0.3)]";
const secondaryActionClassName =
  "inline-flex items-center justify-center px-[40px] py-3 text-[15px] rounded-lg sm:min-w-50";

export default function UploadPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [videoRequest, setVideoRequest] = useState<UploadRequestState>(
    createIdleUploadRequestState
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<UploadStep>(1);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?callbackUrl=/upload`);
    }
  }, [user, isLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
  });

  const resetVideoRequest = () => {
    setVideoRequest(createIdleUploadRequestState());
  };

  const resetUploadSession = () => {
    setThumbnailFile(null);
    setThumbnailError(null);
    resetVideoRequest();
  };

  const resetAll = () => {
    setFile(null);
    setFileError(null);
    resetUploadSession();
    reset();
  };

  const handleFileSelect = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null);
      setFileError(null);
      resetUploadSession();
      setCurrentStep(1);
      return;
    }

    if (!nextFile.type.startsWith("video/")) {
      setFile(null);
      setFileError("The selected file must be a video.");
      resetUploadSession();
      setCurrentStep(1);
      return;
    }

    setFile(nextFile);
    setFileError(null);
    resetUploadSession();
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
    });

    try {
      await uploadVideo({
        file,
        thumbnail: thumbnailFile,
        values: data,
        onProgress: (progress) => {
          setVideoRequest((prev) => ({
            ...prev,
            progress,
          }));
        },
      });

      setVideoRequest({
        state: "done",
        progress: 100,
        error: null,
      });

      toast.success(
        thumbnailFile
          ? "Upload complete! Video and thumbnail uploaded successfully."
          : "Upload complete! Your video is being processed."
      );
    } catch (error) {
      const message = resolveUploadErrorMessage(error);
      setVideoRequest((prev) => ({
        ...prev,
        state: "error",
        error: message,
      }));
      toast.error("Upload failed.");
    }
  };

  const submitUpload = handleSubmit(onSubmit);
  const goToThumbnailStep = handleSubmit(() => setCurrentStep(3));

  const isUploading = videoRequest.state === "uploading";
  const totalTransitions = Math.max(1, UPLOAD_STEPS.length - 1);
  const stepProgress = Math.round(((currentStep - 1) / totalTransitions) * 100);
  const combinedUpload = getCombinedUploadState({ video: videoRequest });

  let stepTitle = "Select your file";
  let stepSubtitle: string | undefined;
  let stepActions: ReactNode;
  let stepContent: ReactNode = (
    <UploadDropzone
      file={file}
      error={fileError}
      disabled={isUploading}
      onFileSelect={handleFileSelect}
    />
  );

  if (currentStep === 2) {
    stepTitle = "Add details";
    stepSubtitle = "Title, description, tags.";
    stepActions = (
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
          variant="donateSecondary"
          disabled={isUploading || !file}
          className={primaryActionClassName}
          onClick={goToThumbnailStep}
        >
          Next
        </Button>
      </>
    );
    stepContent = (
      <UploadDetailsFormFields
        file={file}
        disabled={isUploading}
        register={register}
        errors={errors}
        onChangeFile={() => setCurrentStep(1)}
      />
    );
  }

  if (currentStep === 3) {
    stepTitle = "Choose a thumbnail";
    stepSubtitle = "Optional. We recommend a 16:9 format (for example 1280x720).";
    stepActions = (
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
          variant="donateSecondary"
          className={primaryActionClassName}
          onClick={() => submitUpload()}
          disabled={isUploading}
        >
          Start upload
        </Button>
      </>
    );
    stepContent = (
      <ThumbnailDropzone
        file={thumbnailFile}
        error={thumbnailError}
        disabled={isUploading}
        onFileSelect={handleThumbnailSelect}
      />
    );
  }

  if (currentStep === 4) {
    stepTitle = "Upload video";
    stepActions = (
      <>
        {videoRequest.state === "error" && (
          <Button
            type="button"
            variant="donateSecondary"
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
            variant="donateSecondary"
            className={primaryActionClassName}
            disabled={isUploading}
            onClick={() => {
                resetAll();
                router.push("/profile?tab=videos");
              }
            }
          >
            Manage videos
          </Button>
        )}
      </>
    );
    stepContent = (
      <div className="space-y-6">
        <UploadProgress
          state={combinedUpload.state}
          progress={combinedUpload.progress}
          error={combinedUpload.error}
          labels={combinedUpload.labels}
          doneMessage={
            "Your video is now being processed by our server. You can close this browser tab."
          }
        />
      </div>
    );
  }

  return (
    <div className="container px-5 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Upload Video</h1>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (currentStep === 4) {
              submitUpload();
            }
          }}
          className="space-y-6"
        >
          <UploadStepScreen
            title={stepTitle}
            subtitle={stepSubtitle}
            stepProgress={stepProgress}
            actions={stepActions}
          >
            {stepContent}
          </UploadStepScreen>
        </form>
        <p className="text-center text-xs text-text-amount">
          Make sure to read our guidelines before publishing any video.
        </p>
      </div>
    </div>
  );
}
