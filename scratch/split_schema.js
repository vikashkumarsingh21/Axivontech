const fs = require('fs');

const schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const coreModels = ['Organization', 'User', 'Role', 'Permission', 'UserRole', 'RolePermission', 'Session', 'AuditLog', 'SecurityEvent', 'OrganizationSetting', 'Notification', 'BackgroundJob', 'EmailLog', 'EmailTemplate', 'CommunicationTemplate', 'UserPreference', 'Activity', 'Document', 'DocumentVersion', 'DocumentPermission', 'PartnerDocument', 'PaymentSettings', 'KnowledgeDocument', 'ChatKnowledgeGap', 'ChatFeedback', 'PortfolioProject'];

const employeeModels = ['Attendance', 'AttendanceBreak', 'AttendancePolicy', 'RegularizationRequest', 'Holiday', 'Task', 'TaskComment', 'WorkReport', 'LeaveRequest', 'Project', 'ProjectMember', 'ExecutiveProfile', 'ApprovalRequest', 'Reminder', 'Announcement', 'AutomationWorkflow', 'AutomationExecution', 'QaIssue'];

const clientModels = ['PartnerProject', 'PartnerProjectMilestone', 'PartnerProjectMember', 'PartnerContract', 'PartnerContractVersion', 'PartnerPayment', 'Lead', 'LeadActivity', 'FollowUp', 'LeadNote', 'LeadMeeting', 'PipelineStage', 'Opportunity', 'Proposal', 'CrmClient', 'ClientContact'];

const brokerModels = ['BrokerProfile', 'CommissionRule', 'Commission', 'BusinessPartnerApplication', 'ApplicationMeeting', 'ApplicationStatusHistory'];

const blocks = schema.split('\n\n');

function extractModels(modelNames, dbName) {
    let out = `generator client {\n  provider = "prisma-client-js"\n  output   = "../../node_modules/@prisma/client/${dbName}"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("${dbName.toUpperCase()}_DATABASE_URL")\n}\n\n`;
    
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i].trim();
        if (block.startsWith('model ')) {
            const modelName = block.split(' ')[1];
            if (modelNames.includes(modelName)) {
                // VERY BASIC SANITIZATION FOR CROSS-DB RELATIONS
                // This is a naive cleanup. A full cleanup requires AST parsing.
                // For Phase 1 Foundation, we will comment out cross DB relations or replace them.
                // We'll leave them as is, but Next JS compilation might fail if they are invalid.
                // Let's just include them and then manually fix the few errors.
                out += block + '\n\n';
            }
        } else if (block.startsWith('enum ')) {
             // add enums to all just in case
             out += block + '\n\n';
        }
    }
    return out;
}

fs.writeFileSync('prisma/core/schema.prisma', extractModels(coreModels, 'core'));
fs.writeFileSync('prisma/employee/schema.prisma', extractModels(employeeModels, 'employee'));
fs.writeFileSync('prisma/client/schema.prisma', extractModels(clientModels, 'client'));
fs.writeFileSync('prisma/broker/schema.prisma', extractModels(brokerModels, 'broker'));

console.log("Splitting done.");
