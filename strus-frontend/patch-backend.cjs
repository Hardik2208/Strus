const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve('../strus-backend');
const workspaceServicePath = path.join(BACKEND_DIR, 'src/modules/workspace/services/workspace.service.ts');
const workspaceControllerPath = path.join(BACKEND_DIR, 'src/modules/workspace/controllers/workspace.controller.ts');
const workspaceRoutesPath = path.join(BACKEND_DIR, 'src/modules/workspace/routes/workspace.routes.ts');

// 1. Update workspace.service.ts
let serviceContent = fs.readFileSync(workspaceServicePath, 'utf8');
if (!serviceContent.includes('getInvitationsForUser')) {
  const methodToAdd = `
static async getInvitationsForUser(userId: string) {
  const invitations = await WorkspaceRepository.findInvitationsForUser(userId);
  return invitations.map(WorkspaceInvitationMapper.toResponse);
}
`;
  serviceContent = serviceContent.replace('static async getWorkspaceInvitations(', methodToAdd + '\nstatic async getWorkspaceInvitations(');
  fs.writeFileSync(workspaceServicePath, serviceContent);
  console.log('Updated workspace.service.ts');
}

// 2. Update workspace.controller.ts
let controllerContent = fs.readFileSync(workspaceControllerPath, 'utf8');
if (!controllerContent.includes('getMyInvitations')) {
  const methodToAdd = `
static async getMyInvitations(
  req: AuthenticatedRequest<any>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;
    const invitations = await WorkspaceService.getInvitationsForUser(userId);
    res.status(200).json({
      success: true,
      data: { invitations }
    });
  } catch (error) {
    next(error);
  }
}
`;
  controllerContent = controllerContent.replace('static async getInvitations(', methodToAdd + '\nstatic async getInvitations(');
  fs.writeFileSync(workspaceControllerPath, controllerContent);
  console.log('Updated workspace.controller.ts');
}

// 3. Update workspace.routes.ts
let routesContent = fs.readFileSync(workspaceRoutesPath, 'utf8');
if (!routesContent.includes('/invitations/me')) {
  const routeToAdd = `
router.get(
  "/invitations/me",
  authenticate,
  WorkspaceController.getMyInvitations
);
`;
  routesContent = routesContent.replace('router.get(\n  "/:workspaceId/invitations",', routeToAdd + '\nrouter.get(\n  "/:workspaceId/invitations",');
  fs.writeFileSync(workspaceRoutesPath, routesContent);
  console.log('Updated workspace.routes.ts');
}

console.log('Patch complete.');
