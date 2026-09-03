const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, '../prisma/seed.ts');
let seed = fs.readFileSync(seedFile, 'utf8');

const additionalPermissions = [
    { name: 'admin.dashboard.view', description: 'View Admin Dashboard' },
    { name: 'employee.view', description: 'View employees' },
    { name: 'employee.create', description: 'Create employee' },
    { name: 'employee.update', description: 'Update employee' },
    { name: 'employee.disable', description: 'Disable employee' },
    { name: 'employee.role.assign', description: 'Assign roles to employee' },
    { name: 'attendance.view_all', description: 'View all attendance' },
    { name: 'attendance.correct', description: 'Correct attendance' },
    { name: 'attendance.export', description: 'Export attendance' },
    { name: 'project.view', description: 'View projects' },
    { name: 'project.create', description: 'Create projects' },
    { name: 'project.update', description: 'Update projects' },
    { name: 'project.manage_members', description: 'Manage project members' },
    { name: 'task.view_all', description: 'View all tasks' },
    { name: 'task.create', description: 'Create tasks' },
    { name: 'task.assign', description: 'Assign tasks' },
    { name: 'task.update', description: 'Update tasks' },
    { name: 'work_report.view_all', description: 'View all work reports' },
    { name: 'work_report.review', description: 'Review work reports' },
    { name: 'leave.view_all', description: 'View all leaves' },
    { name: 'leave.approve', description: 'Approve leaves' },
    { name: 'leave.reject', description: 'Reject leaves' },
    { name: 'announcement.create', description: 'Create announcement' },
    { name: 'announcement.publish', description: 'Publish announcement' },
    { name: 'announcement.archive', description: 'Archive announcement' },
    { name: 'notification.create', description: 'Create notification' },
    { name: 'document.view_all', description: 'View all documents' },
    { name: 'document.upload', description: 'Upload document' },
    { name: 'document.archive', description: 'Archive document' },
    { name: 'report.view', description: 'View reports' },
    { name: 'report.export', description: 'Export reports' },
    { name: 'audit.view', description: 'View audit logs' }
];

if (!seed.includes('admin@axivon.dev')) {
    const permString = additionalPermissions.map(p => `  { name: "${p.name}", description: "${p.description}" },`).join('\n');
    seed = seed.replace('const permissionsData = [', 'const permissionsData = [\n' + permString);
    
    const adminCode = `
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || 'AxivonAdmin@2024', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@axivon.dev' },
    update: {},
    create: {
      email: 'admin@axivon.dev',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      department: 'Management',
      designation: 'Administrator',
      status: 'ACTIVE',
      organizationId: organization.id
    }
  });
  
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id }
  });
  console.log('Seeded Admin account: admin@axivon.dev');
`;
    seed = seed.replace(/console\.log\('Database has been seeded successfully'\);/, adminCode + '\n  console.log(\'Database has been seeded successfully\');');
    
    fs.writeFileSync(seedFile, seed);
    console.log("Updated seed file.");
} else {
    console.log("Seed file already contains admin user.");
}
