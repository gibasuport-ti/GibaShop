# Security Specification for GIBASHOP

## Data Invariants
1. **Products**: Publicly readable. Creation, deletion, and general updates restricted to verified Admins. Static validation (schema) enforced.
2. **Orders**: Anyone can create (to allow guest checkout). Only Admins can read or modify.
3. **Users**: Users can only read/write their own profile unless they are Admins.
4. **Stock Protection**: Non-admins can only *decrement* stock (during purchase).

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Anonymous Admin Write**: Attempt to create a product without being logged in.
2. **Unverified Admin Write**: Attempt to create a product as 'gibasuporte@gmail.com' but with `email_verified: false`.
3. **Identity Spoofing**: Attempt to create a product with `authorId` pointing to someone else.
4. **Price Manipulation**: Attempt to set a negative price.
5. **Schema Poisoning**: Attempt to add extra fields (e.g., `isVerified: true`) to a product.
6. **Stock Injection**: Non-admin attempting to *increase* stock count.
7. **Order Scraping**: Non-admin attempting to list the `/orders` collection.
8. **Profile Hijacking**: User A attempting to read/write User B's profile.
9. **Admin Field Escalation**: User attempting to set their own `role` to 'admin'.
10. **ID Poisoning**: Attempting to create a document with an ID that is 1MB of junk characters.
11. **PII Leak**: Non-admin attempting to read sensitive user info.
12. **Recursive Cost Attack**: Unauthenticated user attempting complex queries to exhaust quota.

## Hardened Firewall Strategy
- **Master Gate**: All writes are validated against `isValid[Entity]` helpers.
- **Identity Integrity**: `email_verified == true` mandate for admin actions.
- **Relational Sync**: Sub-resource access checked against parent/owner.
- **Immutable Fields**: `createdAt` and `authorId` cannot be changed after creation.
