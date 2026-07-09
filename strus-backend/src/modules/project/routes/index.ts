import { Router } from "express";

import projectRoutes from "./project.routes.js";

const router = Router();

router.use(projectRoutes);

export default router;
