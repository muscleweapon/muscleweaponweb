-- ==============================================================================
-- ADD VERIFIED STATUS TO VERIFICATION CODES
-- ==============================================================================

-- We must add 'verified' to the code_status enum to enforce atomic consumption
-- in the verification API.

ALTER TYPE code_status ADD VALUE IF NOT EXISTS 'verified';
