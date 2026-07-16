import { Router } from "express";

import executionRoutes from "./execution.routes.js";
import submissionRoutes from "./submission.routes.js";

const router = Router();

router.use(executionRoutes);
router.use(submissionRoutes);

export default router;