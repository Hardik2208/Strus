import { Router } from "express";

import agreementRoutes from "./agreement.routes.js";

const router = Router();

router.use(agreementRoutes);

export default router;
