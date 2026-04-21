import assert from "node:assert/strict";
import test from "node:test";
import {
  createIdleUploadRequestState,
  getCombinedUploadState,
  resolveUploadErrorMessage,
} from "../../../app/upload/upload-helpers";

test("createIdleUploadRequestState keeps the default uploading label", () => {
  assert.deepEqual(createIdleUploadRequestState(), {
    state: "idle",
    progress: 0,
    error: null,
    uploadingLabel: "Uploading video",
  });
});

test("resolveUploadErrorMessage returns a friendly message for canceled uploads", () => {
  assert.equal(resolveUploadErrorMessage({ code: "ERR_CANCELED" }), "Upload canceled.");
});

test("getCombinedUploadState uses the current upload label while uploading", () => {
  const combined = getCombinedUploadState({
    video: {
      state: "uploading",
      progress: 42,
      error: null,
      uploadingLabel: "Finalizing upload",
    },
  });

  assert.equal(combined.labels.uploading, "Finalizing upload");
  assert.equal(combined.progress, 42);
});
