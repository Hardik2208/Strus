import { prisma } from './src/core/database/prisma.js';
import { redis, connectRedis } from './src/core/cache/redis.js';
import { SessionService } from './src/modules/auth/services/session.service.js';
import { DevicePlatform } from './src/generated/prisma/enums.js';
import { ProjectAssetCache } from './src/modules/execution/cache/project-asset.cache.js';
import { CloudinaryService } from './src/core/storage/cloudinary.service.js';
import { ExecutionAuditAction } from './src/generated/prisma/enums.js';
import crypto from 'node:crypto';

const BASE_URL = 'http://localhost:3000/api/v1/execution';

interface TestContext {
  clientUser: any;
  profUser1: any;
  profUser2: any;
  unrelatedUser: any;
  clientToken: string;
  prof1Token: string;
  prof2Token: string;
  unrelatedToken: string;
  workspace: any;
  project: any;
  agreement: any;
  participant1: any;
  participant2: any;
}

async function createTestSession(user: any): Promise<string> {
  const result = await SessionService.create({
    userId: user.id,
    profileCompleted: true,
    deviceIdentifier: 'device-' + user.id,
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    platform: DevicePlatform.WEB
  } as any);
  return result.accessToken;
}

async function setupTestData(): Promise<TestContext> {
  await connectRedis();

  const timestamp = Date.now().toString().slice(-8);
  const clientUser = await prisma.user.create({
    data: {
      email: 'cl_' + timestamp + '@test.com',
      passwordHash: 'dummyhash',
      status: 'ACTIVE',
      profileCompleted: true,
      profile: {
        create: {
          username: 'cl_' + timestamp,
          firstName: 'Client',
          lastName: 'Tester',
          countryCode: 'US',
          timezone: 'UTC'
        }
      }
    }
  });

  const profUser1 = await prisma.user.create({
    data: {
      email: 'p1_' + timestamp + '@test.com',
      passwordHash: 'dummyhash',
      status: 'ACTIVE',
      profileCompleted: true,
      profile: {
        create: {
          username: 'p1_' + timestamp,
          firstName: 'ProfOne',
          lastName: 'Tester',
          countryCode: 'US',
          timezone: 'UTC'
        }
      }
    }
  });

  const profUser2 = await prisma.user.create({
    data: {
      email: 'p2_' + timestamp + '@test.com',
      passwordHash: 'dummyhash',
      status: 'ACTIVE',
      profileCompleted: true,
      profile: {
        create: {
          username: 'p2_' + timestamp,
          firstName: 'ProfTwo',
          lastName: 'Tester',
          countryCode: 'US',
          timezone: 'UTC'
        }
      }
    }
  });

  const unrelatedUser = await prisma.user.create({
    data: {
      email: 'un_' + timestamp + '@test.com',
      passwordHash: 'dummyhash',
      status: 'ACTIVE',
      profileCompleted: true,
      profile: {
        create: {
          username: 'un_' + timestamp,
          firstName: 'Unrelated',
          lastName: 'User',
          countryCode: 'US',
          timezone: 'UTC'
        }
      }
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Workspace ' + timestamp,
      slug: 'ws-' + timestamp,
      workspaceType: 'TEAM',
      ownerId: clientUser.id,
      members: {
        create: [
          { userId: clientUser.id, role: 'OWNER' }
        ]
      }
    }
  });

  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      createdById: clientUser.id,
      title: 'Execution Project ' + timestamp,
      description: 'Phase 2 Test Project',
      status: 'DRAFT',
      setupStage: 'PROFESSIONALS_ASSIGNED'
    }
  });

  const agreement = await prisma.agreement.create({
    data: {
      projectId: project.id,
      createdById: clientUser.id,
      lastUpdatedById: clientUser.id,
      title: 'Agreement ' + timestamp,
      budget: 10000,
      expectedDuration: 30,
      participants: {
        create: [
          {
            userId: clientUser.id,
            role: 'CLIENT',
            invitationStatus: 'ACCEPTED'
          },
          {
            userId: profUser1.id,
            role: 'PROFESSIONAL',
            invitationStatus: 'ACCEPTED'
          },
          {
            userId: profUser2.id,
            role: 'PROFESSIONAL',
            invitationStatus: 'ACCEPTED'
          }
        ]
      }
    },
    include: {
      participants: true
    }
  });

  const participant1 = agreement.participants.find(p => p.userId === profUser1.id)!;
  const participant2 = agreement.participants.find(p => p.userId === profUser2.id)!;

  const clientToken = await createTestSession(clientUser);
  const prof1Token = await createTestSession(profUser1);
  const prof2Token = await createTestSession(profUser2);
  const unrelatedToken = await createTestSession(unrelatedUser);

  return {
    clientUser,
    profUser1,
    profUser2,
    unrelatedUser,
    clientToken,
    prof1Token,
    prof2Token,
    unrelatedToken,
    workspace,
    project,
    agreement,
    participant1,
    participant2
  };
}

async function cleanupTestData(ctx: TestContext) {
  try {
    await prisma.projectAsset.deleteMany({ where: { projectId: ctx.project.id } });
    await prisma.executionAudit.deleteMany({ where: { projectId: ctx.project.id } });
    await prisma.agreement.deleteMany({ where: { projectId: ctx.project.id } });
    await prisma.project.deleteMany({ where: { id: ctx.project.id } });
    await prisma.workspaceMember.deleteMany({ where: { workspaceId: ctx.workspace.id } });
    await prisma.workspace.deleteMany({ where: { id: ctx.workspace.id } });
    const userIds = [ctx.clientUser.id, ctx.profUser1.id, ctx.profUser2.id, ctx.unrelatedUser.id];
    await prisma.eventRecipient.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.event.deleteMany({ where: { createdById: { in: userIds } } });
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.device.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.userProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await ProjectAssetCache.invalidate(ctx.project.id);
  } catch (err) {
    console.error('Cleanup warning:', err);
  }
}

async function runTests() {
  console.log('🚀 Setting up Phase 2 test environment...');
  const ctx = await setupTestData();
  console.log('✅ Test context created for project:', ctx.project.id);

  let createdAssetId = '';
  let uploadedCloudinaryPublicIds: string[] = [];

  try {
    // -------------------------------------------------------------
    // Test 1: Authentication & Authorization on Create
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Authentication checks ---');
    const noAuthRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      method: 'POST'
    });
    console.log('No token status:', noAuthRes.status, '(expected 401)');
    if (noAuthRes.status !== 401) throw new Error('Expected 401 for missing token');

    const invalidAuthRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid.token.here' }
    });
    console.log('Invalid token status:', invalidAuthRes.status, '(expected 401)');
    if (invalidAuthRes.status !== 401) throw new Error('Expected 401 for invalid token');

    console.log('\n--- Test 2: Professional cannot create assets ---');
    const profForm = new FormData();
    profForm.append('files', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');
    profForm.append('visibleToParticipants', ctx.participant1.id);
    const profCreateRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ctx.prof1Token },
      body: profForm
    });
    console.log('Professional create status:', profCreateRes.status, '(expected 403)');
    if (profCreateRes.status !== 403) throw new Error('Expected 403 when professional creates asset');

    // -------------------------------------------------------------
    // Test 3: Validation checks
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Validation checks ---');
    // 3a. No files
    const noFilesForm = new FormData();
    noFilesForm.append('visibleToParticipants', ctx.participant1.id);
    const noFilesRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ctx.clientToken },
      body: noFilesForm
    });
    console.log('No files status:', noFilesRes.status, '(expected 400)');
    if (noFilesRes.status !== 400) throw new Error('Expected 400 when no files are provided');

    // 3b. Duplicate files in batch
    const dupForm = new FormData();
    dupForm.append('files', new Blob(['file 1'], { type: 'text/plain' }), 'duplicate.txt');
    dupForm.append('files', new Blob(['file 2'], { type: 'text/plain' }), 'duplicate.txt');
    dupForm.append('visibleToParticipants', ctx.participant1.id);
    const dupRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ctx.clientToken },
      body: dupForm
    });
    const dupBody = await dupRes.json();
    console.log('Duplicate files status:', dupRes.status, 'code:', dupBody?.code, '(expected 400 DUPLICATE_PROJECT_ASSET_FILE)');
    if (dupRes.status !== 400 || dupBody?.code !== 'DUPLICATE_PROJECT_ASSET_FILE') {
      throw new Error('Expected DUPLICATE_PROJECT_ASSET_FILE error');
    }

    // 3c. Duplicate participant in visibleToParticipants
    const dupPartForm = new FormData();
    dupPartForm.append('files', new Blob(['content'], { type: 'text/plain' }), 'unique.txt');
    dupPartForm.append('visibleToParticipants', ctx.participant1.id);
    dupPartForm.append('visibleToParticipants', ctx.participant1.id);
    const dupPartRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ctx.clientToken },
      body: dupPartForm
    });
    const dupPartBody = await dupPartRes.json();
    console.log('Duplicate participant status:', dupPartRes.status, 'code:', dupPartBody?.code, '(expected 400 DUPLICATE_PROJECT_ASSET_PARTICIPANT)');
    if (dupPartRes.status !== 400 || dupPartBody?.code !== 'DUPLICATE_PROJECT_ASSET_PARTICIPANT') {
      throw new Error('Expected DUPLICATE_PROJECT_ASSET_PARTICIPANT error');
    }

    // -------------------------------------------------------------
    // Test 4: Create Project Asset (Initial Upload)
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Create Project Asset (Client Upload) ---');
    const pngBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const validForm = new FormData();
    validForm.append('files', new Blob(['Brand Guidelines notes content'], { type: 'text/plain' }), 'brand.txt');
    validForm.append('files', new Blob([pngBytes], { type: 'image/png' }), 'logo.png');
    validForm.append('visibleToParticipants', ctx.participant1.id);

    const createRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ctx.clientToken },
      body: validForm
    });
    console.log('Create asset status:', createRes.status, '(expected 201)');
    const createBody = await createRes.json();
    if (createRes.status !== 201 || !createBody.success) {
      throw new Error('Failed to create asset: ' + JSON.stringify(createBody));
    }

    const createdAsset = createBody.data;
    createdAssetId = createdAsset.id;
    console.log('Asset created with ID:', createdAssetId);
    console.log('Asset files count:', createdAsset.files?.length);
    if (!createdAsset.files || createdAsset.files.length !== 2) {
      throw new Error('Expected 2 files on created asset');
    }

    for (const f of createdAsset.files) {
      console.log('File:', f.originalName, 'size:', typeof f.size, f.size, 'URL:', f.url.slice(0, 40) + '...');
      if (typeof f.size !== 'number') throw new Error('Expected file size to be number, got ' + typeof f.size);
      if (!f.publicId || !f.url) throw new Error('Expected Cloudinary publicId and url');
      uploadedCloudinaryPublicIds.push(f.publicId);
    }

    // Verify DB records
    const dbAsset = await prisma.projectAsset.findUnique({
      where: { id: createdAssetId },
      include: { files: true, visibleToParticipants: true }
    });
    if (!dbAsset || dbAsset.files.length !== 2 || dbAsset.visibleToParticipants.length !== 1) {
      throw new Error('Database records verification failed for created asset');
    }
    console.log('✅ DB records verified');

    // Verify Execution Audit
    const auditCreated = await prisma.executionAudit.findFirst({
      where: {
        projectId: ctx.project.id,
        action: ExecutionAuditAction.PROJECT_ASSET_CREATED
      }
    });
    if (!auditCreated) throw new Error('Audit record PROJECT_ASSET_CREATED not found');
    console.log('✅ Audit log created:', auditCreated.action, 'metadata:', auditCreated.metadata);

    // -------------------------------------------------------------
    // Test 5: List Assets & Redis Caching
    // -------------------------------------------------------------
    console.log('\n--- Test 5: List Assets & Redis Caching ---');
    const redisClientKey = ProjectAssetCache.key(ctx.project.id);

    // Initial cache miss
    const listRes1 = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      headers: { Authorization: 'Bearer ' + ctx.clientToken }
    });
    console.log('List status (1st call):', listRes1.status);
    const listData1 = await listRes1.json();
    if (listData1.data?.length !== 1) throw new Error('Expected 1 asset in list');

    // Check Redis population
    const cachedVal = await redis.get(redisClientKey);
    console.log('Redis key:', redisClientKey, 'exists in redis:', !!cachedVal);
    if (!cachedVal) throw new Error('Expected Redis key ' + redisClientKey + ' to be populated');

    // Second call: cache HIT
    const listRes2 = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      headers: { Authorization: 'Bearer ' + ctx.clientToken }
    });
    const listData2 = await listRes2.json();
    if (listData2.data?.length !== 1) throw new Error('Expected 1 asset in cached list');
    console.log('✅ Redis Cache HIT verified for client list');

    // -------------------------------------------------------------
    // Test 6: Professional Visibility Control
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Professional Visibility Control ---');
    // Prof 1 is authorized to see this asset
    const prof1ListRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      headers: { Authorization: 'Bearer ' + ctx.prof1Token }
    });
    const prof1List = await prof1ListRes.json();
    console.log('Prof 1 assets visible:', prof1List.data?.length, '(expected 1)');
    if (prof1List.data?.length !== 1) throw new Error('Prof 1 should see the shared asset');

    // Prof 2 was NOT shared this asset
    const prof2ListRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      headers: { Authorization: 'Bearer ' + ctx.prof2Token }
    });
    const prof2List = await prof2ListRes.json();
    console.log('Prof 2 assets visible:', prof2List.data?.length, '(expected 0)');
    if (prof2List.data?.length !== 0) throw new Error('Prof 2 should NOT see unshared asset');

    // Get Single Asset: Prof 1 accesses shared asset
    const prof1GetRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets/' + createdAssetId, {
      headers: { Authorization: 'Bearer ' + ctx.prof1Token }
    });
    console.log('Prof 1 GET single asset status:', prof1GetRes.status, '(expected 200)');
    if (prof1GetRes.status !== 200) throw new Error('Prof 1 failed to GET shared asset');

    // Get Single Asset: Prof 2 attempts inaccessible asset
    const prof2GetRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets/' + createdAssetId, {
      headers: { Authorization: 'Bearer ' + ctx.prof2Token }
    });
    console.log('Prof 2 GET inaccessible asset status:', prof2GetRes.status, '(expected 403)');
    if (prof2GetRes.status !== 403) throw new Error('Expected 403 for Prof 2 accessing unshared asset');
    console.log('✅ Visibility isolation verified for both list and single get');

    // -------------------------------------------------------------
    // Test 7: Add Files to Existing Asset
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Add Files to Existing Asset ---');
    // 7a. Professional attempts to add files -> 403
    const profAddForm = new FormData();
    profAddForm.append('files', new Blob(['extra'], { type: 'text/plain' }), 'extra.txt');
    const profAddRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets/' + createdAssetId + '/files', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ctx.prof1Token },
      body: profAddForm
    });
    console.log('Prof add files status:', profAddRes.status, '(expected 403)');
    if (profAddRes.status !== 403) throw new Error('Expected 403 when professional adds files');

    // 7b. Duplicate file protection: Client attempts to upload 'brand.pdf' which already exists
    const dupAddForm = new FormData();
    dupAddForm.append('files', new Blob(['brand duplicate'], { type: 'text/plain' }), 'brand.txt');
    const dupAddRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets/' + createdAssetId + '/files', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ctx.clientToken },
      body: dupAddForm
    });
    const dupAddBody = await dupAddRes.json();
    console.log('Duplicate add file status:', dupAddRes.status, 'code:', dupAddBody?.code, '(expected 400 DUPLICATE_PROJECT_ASSET_FILE)');
    if (dupAddRes.status !== 400 || dupAddBody?.code !== 'DUPLICATE_PROJECT_ASSET_FILE') {
      throw new Error('Expected DUPLICATE_PROJECT_ASSET_FILE when adding existing file');
    }

    // 7c. Successful add file: 'palette.pdf'
    const validAddForm = new FormData();
    validAddForm.append('files', new Blob(['Color palette details: primary #123456'], { type: 'text/plain' }), 'palette.txt');
    const validAddRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets/' + createdAssetId + '/files', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ctx.clientToken },
      body: validAddForm
    });
    console.log('Valid add file status:', validAddRes.status, '(expected 200)');
    if (validAddRes.status !== 200) throw new Error('Failed to add file');

    // Verify DB has 3 files
    const updatedAssetFiles = await prisma.projectAssetFile.findMany({
      where: { projectAssetId: createdAssetId }
    });
    console.log('Asset files count after add:', updatedAssetFiles.length, '(expected 3)');
    if (updatedAssetFiles.length !== 3) throw new Error('Expected 3 files after adding');
    for (const f of updatedAssetFiles) {
      if (!uploadedCloudinaryPublicIds.includes(f.publicId)) {
        uploadedCloudinaryPublicIds.push(f.publicId);
      }
    }

    // Verify Audit log PROJECT_ASSET_UPDATED
    const auditUpdated = await prisma.executionAudit.findFirst({
      where: {
        projectId: ctx.project.id,
        action: ExecutionAuditAction.PROJECT_ASSET_UPDATED
      }
    });
    if (!auditUpdated) throw new Error('Audit record PROJECT_ASSET_UPDATED not found');
    console.log('✅ Audit log created:', auditUpdated.action, 'metadata:', auditUpdated.metadata);

    // Verify Redis cache was invalidated
    const cachedAfterAdd = await redis.get(redisClientKey);
    console.log('Redis key after addFiles:', cachedAfterAdd, '(expected null)');
    if (cachedAfterAdd !== null) throw new Error('Expected Redis cache to be invalidated after adding files');

    // -------------------------------------------------------------
    // Test 8: Soft Delete Asset
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Soft Delete Asset ---');
    // Prof attempts to delete -> 403
    const profDelRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets/' + createdAssetId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + ctx.prof1Token }
    });
    console.log('Prof delete status:', profDelRes.status, '(expected 403)');
    if (profDelRes.status !== 403) throw new Error('Expected 403 when professional deletes asset');

    // Repopulate cache first
    await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      headers: { Authorization: 'Bearer ' + ctx.clientToken }
    });
    const cacheBeforeDel = await redis.get(redisClientKey);
    console.log('Cache before delete exists:', !!cacheBeforeDel);

    // Client deletes asset -> 200
    const clientDelRes = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets/' + createdAssetId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + ctx.clientToken }
    });
    console.log('Client delete status:', clientDelRes.status, '(expected 200)');
    if (clientDelRes.status !== 200) throw new Error('Failed to delete asset');

    // Verify DB soft deletion
    const softDeletedAsset = await prisma.projectAsset.findUnique({
      where: { id: createdAssetId }
    });
    console.log('Asset deletedAt:', softDeletedAsset?.deletedAt, '(expected non-null Date)');
    if (!softDeletedAsset?.deletedAt) throw new Error('Expected deletedAt to be populated');

    // Verify audit log PROJECT_ASSET_DELETED
    const auditDeleted = await prisma.executionAudit.findFirst({
      where: {
        projectId: ctx.project.id,
        action: ExecutionAuditAction.PROJECT_ASSET_DELETED
      }
    });
    if (!auditDeleted) throw new Error('Audit record PROJECT_ASSET_DELETED not found');
    console.log('✅ Audit log created:', auditDeleted.action);

    // Verify Redis cache was invalidated
    const cacheAfterDel = await redis.get(redisClientKey);
    console.log('Cache after delete:', cacheAfterDel, '(expected null)');
    if (cacheAfterDel !== null) throw new Error('Expected Redis cache to be invalidated after delete');

    // Verify asset disappears from active listing
    const listAfterDel = await (await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets', {
      headers: { Authorization: 'Bearer ' + ctx.clientToken }
    })).json();
    console.log('Active assets count after delete:', listAfterDel.data?.length, '(expected 0)');
    if (listAfterDel.data?.length !== 0) throw new Error('Deleted asset should not appear in active listings');

    // Verify GET single asset returns 404
    const getAfterDel = await fetch(BASE_URL + '/projects/' + ctx.project.id + '/assets/' + createdAssetId, {
      headers: { Authorization: 'Bearer ' + ctx.clientToken }
    });
    console.log('GET deleted asset status:', getAfterDel.status, '(expected 404)');
    if (getAfterDel.status !== 404) throw new Error('Expected 404 when retrieving deleted asset');

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 2 PROJECT ASSET TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
  } finally {
    console.log('🧹 Cleaning up test artifacts...');
    // Delete any Cloudinary files uploaded during test
    await Promise.all(
      uploadedCloudinaryPublicIds.map(pid =>
        CloudinaryService.delete(pid, 'raw').catch(() => {})
      )
    );
    await cleanupTestData(ctx);
    console.log('✅ Cleanup complete.');
  }
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
