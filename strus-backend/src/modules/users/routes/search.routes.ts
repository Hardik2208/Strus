import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { SearchController } from "../controllers/search.controller.js";

const router = Router();

router.get(
  "/search",
  authenticate,
  SearchController.search
);

export default router;