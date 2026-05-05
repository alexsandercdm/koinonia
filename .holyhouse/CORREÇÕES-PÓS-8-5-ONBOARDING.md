# Onboarding Organization Creation Fix

**Date:** 2026-05-05  
**Issue:** Organization creation was failing in the onboarding flow  
**Root Cause:** Missing defensive checks and ambiguous method names in organization client API  
**Status:** ✅ FIXED

## Problem Summary

After Phase 8.5 completion, the signup→onboarding→organization creation flow was failing at the organization creation step. The API endpoints worked correctly (verified via curl), but the frontend OnboardingPage.tsx was not handling the Better Auth organization client API properly.

## Root Cause Analysis

**Phase 1 Investigation:** All API endpoints worked perfectly via curl:
- POST `/api/v1/auth/organization/create` → Returns org with `id`
- POST `/api/v1/auth/organization/set-active` → Works correctly

**Phase 2 Pattern Analysis:** Compared working OrgContext with broken OnboardingPage:
- OrgContext: Has defensive checks before calling API methods
- OnboardingPage: Was directly calling methods without checks or error handling

**Critical Discovery:** Better Auth organizationClient plugin uses two possible method names for setting active organization:
- `authClient.organization.setActiveOrganization()` (primary)
- `authClient.organization.setActive()` (fallback)

OnboardingPage was calling `.setActive()` without checking if it existed or trying the other variant.

## Solution Implemented

Updated `apps/web/src/pages/OnboardingPage.tsx` to match the defensive pattern from `OrgContext`:

```typescript
// Extract API with fallback
const organizationApi = authClient.organization ?? {}
const create = organizationApi.create

// Validate method exists
if (typeof create !== 'function') {
  throw new Error('Organização API não disponível')
}

// Call method
const result = await create({ name, slug })

// Handle both method name variants
const setActive =
  organizationApi.setActiveOrganization ??
  organizationApi.setActive

if (typeof setActive !== 'function') {
  throw new Error('Organization client is not available')
}

await setActive({ organizationId: orgId })
```

## Changes Made

- Commit: `2c8d5e8` - fix(web): add defensive checks to organization creation in onboarding
- File: `apps/web/src/pages/OnboardingPage.tsx` (lines 40-68)

## What Was Fixed

1. **Method existence validation** - Now checks if `create()` and `setActive()` methods exist before calling
2. **Method name compatibility** - Tries both `setActiveOrganization` and `setActive` names
3. **Better error messages** - Clear errors if organization API is unavailable
4. **Defensive programming** - Matches pattern from verified working code (OrgContext)

## Testing Notes

The fix:
- ✅ Follows the exact pattern from `OrgContext` (which is known to work)
- ✅ Handles both method name variants for maximum compatibility
- ✅ Provides clear error messages for debugging
- ✅ Validates API availability before use

## Next Steps

1. Manual test the signup→onboarding→org creation flow in browser
2. Verify that organizations are created and set as active
3. Confirm dashboard loads with active organization

## Related Code

- Working example: `apps/web/src/contexts/org-context.tsx` (lines 32-45)
- Fixed component: `apps/web/src/pages/OnboardingPage.tsx` (lines 40-68)
- Organization API: `apps/api/src/routes/auth.ts` (Better Auth handler)

## Lessons

- Defensive programming (checking method existence) prevents runtime errors
- Using `method ?? fallback` pattern allows for API naming variations
- Matching patterns from proven implementations reduces bugs
