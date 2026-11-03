const fs = require('fs');
const file = '../strus-backend/src/modules/users/repositories/profile.repository.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace the return block of searchProfiles
content = content.replace(
  /select: \{\n          id: true,\n          username: true,\n          firstName: true,\n          lastName: true,\n          avatarUrl: true,\n        \},/g,
  `select: {
          userId: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },`
);

content = content.replace(
  /return \{\n    items,\n    total,\n  \};/g,
  `return {
    items: items.map(item => ({
      id: item.userId,
      username: item.username,
      firstName: item.firstName,
      lastName: item.lastName,
      avatarUrl: item.avatarUrl,
    })),
    total,
  };`
);

fs.writeFileSync(file, content);
console.log('Patched');
