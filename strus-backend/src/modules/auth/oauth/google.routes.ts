import { Router } from "express";

import { GoogleController } from "./google.controller.js";

const router = Router();

router.post(
  "/google",
  GoogleController.login
);

export default router;