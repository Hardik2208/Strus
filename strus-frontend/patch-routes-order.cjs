const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve('../strus-backend');
const routesPath = path.join(BACKEND_DIR, 'src/modules/workspace/routes/workspace.routes.ts');

let routesContent = fs.readFileSync(routesPath, 'utf8');

// Remove the wrongly placed route
routesContent = routesContent.replace(
  /\n\nrouter\.get\(\n  "\/invitations\/pending",\n  authenticate,\n  WorkspaceController\.getPendingInvitations\n\);/g,
  ''
);

// Insert it before /:workspaceId
routesContent = routesContent.replace(
  /router\.get\(\n  "\/:workspaceId",/g,
  `router.get(\n  "/invitations/pending",\n  authenticate,\n  WorkspaceController.getPendingInvitations\n);\n\nrouter.get(\n  "/:workspaceId",`
);

fs.writeFileSync(routesPath, routesContent);
console.log('Fixed route order');
