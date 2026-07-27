import { Router } from "express";

import eventRoutes from "./event.routes.js";

const router = Router();

router.use("", eventRoutes);

export default router;