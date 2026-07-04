import { Router } from "express";

import profileRoutes from "./profile.routes.js";
import usernameRoutes from "./username.routes.js";
import avatarRoutes from "./avatar.routes.js"

const router = Router();

router.use(profileRoutes);
router.use(usernameRoutes);
router.use(avatarRoutes);

export default router;