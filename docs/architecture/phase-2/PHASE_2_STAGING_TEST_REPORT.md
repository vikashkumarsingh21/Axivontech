# PHASE 2 — STAGING TEST REPORT

## Testing Strategy
After the Staging DBs are populated by the ETL script, the application must be booted using the Staging Environment Variables. The following E2E matrix must be manually and automatically verified before advancing to Production.

### Test Matrix
1. **Authentication**: Login, Logout, Session Expiry, Password Reset.
2. **RBAC & Isolation**: 
   - Verify Partner A cannot view Partner B's projects.
   - Verify Client A cannot view Client B's projects.
   - Verify Broker commissions are strictly scoped.
3. **Cross-Database Workflows**:
   - *Broker Onboarding*: Form Submit (Broker) → Approval → User Creation (Core) → BrokerProfile (Broker).
   - *Lead Conversion*: Lead (Client) → Opportunity (Client) → CrmClient & Project (Client).
   - *Project Execution*: Approve Project (Client) → Generate Tasks (Employee) → Generate Commissions (Broker).

**Current Status:** PENDING STAGING EXECUTION.
