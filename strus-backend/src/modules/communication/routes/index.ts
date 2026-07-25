import { Router } from "express";

import communicationRoutes from "./conversation.routes.js";

const router = Router();

router.use(communicationRoutes);

export default router;