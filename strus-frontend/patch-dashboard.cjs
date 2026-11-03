const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve('../strus-backend');
const svcPath = path.join(BACKEND_DIR, 'src/modules/dashboard/services/professional-dashboard.service.ts');
const ctrlPath = path.join(BACKEND_DIR, 'src/modules/dashboard/controllers/professional-dashboard.controller.ts');
const routePath = path.join(BACKEND_DIR, 'src/modules/dashboard/routes/dashboard.routes.ts');

let svcContent = fs.readFileSync(svcPath, 'utf8');
if (!svcContent.includes('getPendingInvitations(')) {
  const methodToAdd = `
static async getPendingInvitations(userId: string) {
  const invites = await ProfessionalDashboardRepository.getPendingInvitations(userId);
  return invites.map(invite => ({
    id: invite.id,
    title: invite.agreement.project.title,
    clientName: invite.agreement.createdBy.profile ? \`\${invite.agreement.createdBy.profile.firstName} \${invite.agreement.createdBy.profile.lastName}\` : '',
    projectId: invite.agreement.project.id
  }));
}
`;
  svcContent = svcContent.replace('static getQuickActions', methodToAdd + '\nstatic getQuickActions');
  fs.writeFileSync(svcPath, svcContent);
  console.log('Updated professional-dashboard.service.ts');
}

let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');
if (!ctrlContent.includes('getPendingInvitations(')) {
  const methodToAdd = `
static async getPendingInvitations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const invites = await ProfessionalDashboardService.getPendingInvitations(req.user.id);
    res.status(200).json({ success: true, data: { invitations: invites } });
  } catch (err) { next(err); }
}
`;
  ctrlContent = ctrlContent.replace('static async getQuickActions', methodToAdd + '\nstatic async getQuickActions');
  fs.writeFileSync(ctrlPath, ctrlContent);
  console.log('Updated professional-dashboard.controller.ts');
}

let routeContent = fs.readFileSync(routePath, 'utf8');
if (!routeContent.includes('/professional/pending-invitations')) {
  const routeToAdd = `
router.get(
  "/professional/pending-invitations",
  authenticate,
  ProfessionalDashboardController.getPendingInvitations
);
`;
  routeContent = routeContent.replace('router.get(\n  "/professional/quick-actions",', routeToAdd + '\nrouter.get(\n  "/professional/quick-actions",');
  fs.writeFileSync(routePath, routeContent);
  console.log('Updated dashboard.routes.ts');
}

console.log('Patch complete.');
