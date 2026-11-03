const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve('../strus-backend');
const routePath = path.join(BACKEND_DIR, 'src/modules/dashboard/routes/professional-dashboard.routes.ts');

let routeContent = fs.readFileSync(routePath, 'utf8');
if (!routeContent.includes('/pending-invitations')) {
  const routeToAdd = `
router.get(
  "/pending-invitations",
  authenticate,
  ProfessionalDashboardController.getPendingInvitations
);
`;
  routeContent = routeContent.replace('router.get(\n  "/quick-actions",', routeToAdd + '\nrouter.get(\n  "/quick-actions",');
  fs.writeFileSync(routePath, routeContent);
  console.log('Updated professional-dashboard.routes.ts');
}
