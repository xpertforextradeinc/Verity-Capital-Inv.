# Security Specification: Quantix Exchange Rules Engine

## 1. Data Invariants & Authorization Logic
- **Identity Integrity**: `/users/{userId}` can only be created by the owner with role `'CUSTOMER'` and status `'ACTIVE'`. Role escalation (`'ADMIN'`) or status changes (`'SUSPENDED'`) can only be performed by administrators.
- **Relational Ownership**: Subcollections `/users/{userId}/portfolio/*`, `/users/{userId}/positions/*`, `/users/{userId}/orders/*`, and `/users/{userId}/watchlists/*` require `request.auth.uid == userId` or `isAdmin()`.
- **Instrument Controls**: Market catalog `/instruments/{instrumentId}` is readable by all active users, but writes/halts/edits require administrative role.
- **Audit Ledger Immutability**: `/audit_events/{eventId}` can only be written; updates and deletions are universally forbidden (`allow update, delete: if false`).
- **AI Insights Security**: `/ai_insights/{insightId}` is published by backend/admin systems with strict character bounds and disclaimer clauses.
- **Admin Bootstrapping**: User email `hassanluckman5@gmail.com` and admin documents are recognized as authorized administrators.

## 2. The Dirty Dozen Attack Payloads (Must Return PERMISSION_DENIED)
1. **Self-Promote to Admin**: Customer attempts `setDoc(/users/usr_victim, { role: 'ADMIN' })`.
2. **Unsuspend Own Account**: Suspended user attempts `updateDoc(/users/usr_suspended, { status: 'ACTIVE' })`.
3. **Cross-User Portfolio Drain**: User A attempts to read or mutate `/users/userB/portfolio/main`.
4. **Order Spoofing**: User A attempts `setDoc(/users/userB/orders/ord_1, { side: 'BUY', symbol: 'NVDA' })`.
5. **Junk Path ID Poisoning**: Attempt to write to `/users/{junk_id_1000_chars}`.
6. **Market Instrument Tampering**: Non-admin attempts `updateDoc(/instruments/AAPL, { price: 0.01, status: 'HALTED' })`.
7. **Audit Trail Deletion**: Attacker attempts `deleteDoc(/audit_events/evt_1)`.
8. **Audit Trail Modification**: Attacker attempts `updateDoc(/audit_events/evt_1, { metadataJson: 'cleared' })`.
9. **Negative Order Quantity Injection**: Attempt to create order with `quantity: -500`.
10. **Shadow Key Injection**: Attempt to write ghost fields e.g. `{ isSuperUser: true }` on user documents.
11. **Blanket Query Scraping**: Attempt to list all `/users` without admin privileges.
12. **Unverified Email Impersonation**: Attacker with unverified email attempts admin writes.
