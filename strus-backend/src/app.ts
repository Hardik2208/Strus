import express from "express";

import {
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware,
} from "./core/plugins/index.js";

import healthRoutes from "./routes/health.routes.js";

import {
  errorMiddleware,
  notFoundMiddleware,
  requestIdMiddleware,
  requestLoggerMiddleware,
} from "./core/middleware/index.js";

import { authRoutes } from "./modules/auth/index.js";
import { userRoutes } from "./modules/users/index.js";
import { workspaceRoutes } from "./modules/workspace/index.js";
import { projectRoutes } from "./modules/project/index.js";
import { agreementRoutes } from "./modules/agreement/index.js";
import { executionRoutes } from "./modules/execution/index.js"
import { dashboardRoutes } from "./modules/dashboard/index.js";
const app = express();

app.use(helmetMiddleware);

app.use(corsMiddleware);

app.use(compressionMiddleware);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(requestIdMiddleware);

app.use(requestLoggerMiddleware);

app.use("/api/v1", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/agreement", agreementRoutes);
app.use("/api/v1/execution", executionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;