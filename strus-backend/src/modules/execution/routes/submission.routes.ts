import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";
import { MilestoneController } from "../controllers/milestone.controller.js";
import { MilestoneExtensionController } from "../controllers/milestone-extension.controller.js";
import { ProjectAssetController } from "../controllers/project-asset.controller.js";
import { SubmissionController } from "../controllers/submission.controller.js";
import { uploadProjectAssets } from "../middleware/project-asset-upload.middleware.js";
import { uploadSubmissionAttachments } from "../middleware/submission-upload.middleware.js";
import { SubmissionReviewController } from "../controllers/submission-review.controller.js";

const router = Router();

// ==================================================
// Execution Plan
// ==================================================

router.post(
  "/projects/:projectId/execution-plan",
  authenticate,
  MilestoneController.createPlan
);

router.get(
  "/projects/:projectId/execution-plan",
  authenticate,
  MilestoneController.getPlan
);

router.patch(
  "/projects/:projectId/execution-plan",
  authenticate,
  MilestoneController.updatePlan
);

router.delete(
  "/projects/:projectId/execution-plan",
  authenticate,
  MilestoneController.deletePlan
);


// ==================================================
// Milestone Extensions
// ==================================================

router.post(
  "/projects/:projectId/milestone-extensions",
  authenticate,
  MilestoneExtensionController.create
);

// ==================================================
// Project Assets
// ==================================================

router.post(
  "/projects/:projectId/assets",
  authenticate,
  uploadProjectAssets,
  ProjectAssetController.create
);

router.get(
  "/projects/:projectId/assets",
  authenticate,
  ProjectAssetController.list
);

router.get(
  "/projects/:projectId/assets/:assetId",
  authenticate,
  ProjectAssetController.get
);

router.post(
  "/projects/:projectId/assets/:assetId/files",
  authenticate,
  uploadProjectAssets,
  ProjectAssetController.addFiles
);

router.delete(
  "/projects/:projectId/assets/:assetId",
  authenticate,
  ProjectAssetController.delete
);

// ==================================================
// Milestone Submissions
// ==================================================

router.post(
  "/milestones/:milestoneId/submissions",
  authenticate,
  uploadSubmissionAttachments,
  SubmissionController.create
);

router.get(
  "/milestones/:milestoneId/submissions",
  authenticate,
  SubmissionController.list
);

router.get(
  "/submissions/:submissionId",
  authenticate,
  SubmissionController.get
);

// ==================================================
// Submission Review
// ==================================================

router.patch(
  "/submissions/:submissionId/approve",
  authenticate,
  SubmissionReviewController.approve
);

router.patch(
  "/submissions/:submissionId/request-revision",
  authenticate,
  SubmissionReviewController.requestRevision
);

router.get(
  "/workspaces/:workspaceId/pending-reviews",
  authenticate,
  SubmissionReviewController.getPendingReviews
);

export default router;