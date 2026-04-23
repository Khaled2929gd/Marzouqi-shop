-- ============================================================================
-- Auth Query Optimization
-- ============================================================================
-- This migration adds indexes to optimize profile lookups for faster auth.
-- The primary benefit is for the useAdminAuth hook which queries profiles by ID.

-- Note: The 'id' column already has an index as it's the PRIMARY KEY
-- Note: The 'email' column already has an index as it's marked UNIQUE

-- Add index on role for faster filtering by role (useful for admin queries)
create index if not exists idx_profiles_role
  on public.profiles(role);

-- Add composite index for common query patterns (id + role)
-- This helps queries that check both user ID and role simultaneously
create index if not exists idx_profiles_id_role
  on public.profiles(id, role);

-- Add comment documenting the optimization
comment on table public.profiles is
  'User profiles with optimized indexes for auth lookups. Primary key on id ensures O(1) lookup by user ID.';

-- Analyze the table to update query planner statistics
analyze public.profiles;
