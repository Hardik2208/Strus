import { Router } from "express";

import executionRoutes from "./execution.routes.js";

const router = Router();

router.use(executionRoutes);

export default router;