const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve('../strus-backend');
const repoPath = path.join(BACKEND_DIR, 'src/modules/workspace/repositories/workspace.repository.ts');
const servicePath = path.join(BACKEND_DIR, 'src/modules/workspace/services/workspace.service.ts');
const controllerPath = path.join(BACKEND_DIR, 'src/modules/workspace/controllers/workspace.controller.ts');
const routesPath = path.join(BACKEND_DIR, 'src/modules/workspace/routes/workspace.routes.ts');
const ioPath = path.join(BACKEND_DIR, 'src/core/realtime/socket.ts');

// 1. Repository
let repoContent = fs.readFileSync(repoPath, 'utf8');
if (!repoContent.includes('findPendingInvitationsByUserId')) {
  repoContent = repoContent.replace(
    'static async findInvitationsForUser',
    'static async findPendingInvitationsByUserId'
  );
  fs.writeFileSync(repoPath, repoContent);
  console.log('Updated repository');
}

// 2. Service
let svcContent = fs.readFileSync(servicePath, 'utf8');
if (!svcContent.includes('getPendingInvitationsForUser')) {
  // First, we need to import Redis Cache if not present
  if (!svcContent.includes('redis.client.js')) {
    // Add import at the top
    svcContent = `import { redisClient } from "../../../core/redis/redis.client.js";\n` + svcContent;
  }
  
  // Replace old method with new cached method
  const oldMethodRegex = /static async getInvitationsForUser[\s\S]*?}/m;
  const newMethod = `
  static async getPendingInvitationsForUser(userId: string) {
    const cacheKey = \`workspace:invitations:pending:\${userId}\`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const invitations = await WorkspaceRepository.findPendingInvitationsByUserId(userId);
    const result = invitations.map(WorkspaceInvitationMapper.toResponse);
    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);
    return result;
  }`;
  
  svcContent = svcContent.replace(oldMethodRegex, newMethod);
  
  // Now add cache invalidation to accept, decline, cancel
  svcContent = svcContent.replace(
    /return WorkspaceInvitationMapper\.toResponse\(accepted\);/,
    `await redisClient.del(\`workspace:invitations:pending:\${userId}\`);\n    return WorkspaceInvitationMapper.toResponse(accepted);`
  );
  
  svcContent = svcContent.replace(
    /return WorkspaceInvitationMapper\.toResponse\(declined\);/,
    `await redisClient.del(\`workspace:invitations:pending:\${userId}\`);\n    return WorkspaceInvitationMapper.toResponse(declined);`
  );
  
  svcContent = svcContent.replace(
    /return WorkspaceInvitationMapper\.toResponse\(cancelled\);/,
    `await redisClient.del(\`workspace:invitations:pending:\${invitation.invitedUserId}\`);\n    return WorkspaceInvitationMapper.toResponse(cancelled);`
  );
  
  // Create invitation
  svcContent = svcContent.replace(
    /return WorkspaceInvitationMapper\.toResponse\(invitation\);/,
    `await redisClient.del(\`workspace:invitations:pending:\${data.invitedUserId}\`);\n    return WorkspaceInvitationMapper.toResponse(invitation);`
  );
  
  fs.writeFileSync(servicePath, svcContent);
  console.log('Updated service');
}

// 3. Controller
let ctrlContent = fs.readFileSync(controllerPath, 'utf8');
if (!ctrlContent.includes('getPendingInvitations')) {
  const oldMethodRegex = /static async getMyInvitations[\s\S]*?}/m;
  const newMethod = `
  static async getPendingInvitations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;
      const invitations = await WorkspaceService.getPendingInvitationsForUser(userId);
      res.status(200).json({
        success: true,
        data: {
          invitations,
          count: invitations.length
        },
      });
    } catch (error) {
      next(error);
    }
  }`;
  
  ctrlContent = ctrlContent.replace(oldMethodRegex, newMethod);
  fs.writeFileSync(controllerPath, ctrlContent);
  console.log('Updated controller');
}

// 4. Routes
let routesContent = fs.readFileSync(routesPath, 'utf8');
routesContent = routesContent.replace(
  /router\.get\(\n\s*"\/invitations\/me"[\s\S]*?\);/,
  `router.get(\n  "/invitations/pending",\n  authenticate,\n  WorkspaceController.getPendingInvitations\n);`
);
fs.writeFileSync(routesPath, routesContent);
console.log('Updated routes');
