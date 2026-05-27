-- ==========================================
-- NEON POSTGRES: MASTER RLS SETUP SCRIPT
-- ==========================================
-- RUN THIS IN YOUR NEON SQL EDITOR
-- This script enables Row Level Security (RLS) on all core tables to ensure data isolation.

-- 1. Enable RLS on core tables
-- Use FORCE to ensure the database 'owner' (neondb_owner) also obeys RLS during app requests.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports FORCE ROW LEVEL SECURITY;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews FORCE ROW LEVEL SECURITY;


-- 2. Define Security Policies
-- These policies use the 'app.current_user_id' variable set by the FastAPI backend on every request.

-- USERS TABLE: User can only see/update their own profile
DROP POLICY IF EXISTS user_isolation_policy ON users;
CREATE POLICY user_isolation_policy ON users
USING (id::text = current_setting('app.current_user_id', True))
WITH CHECK (id::text = current_setting('app.current_user_id', True));

-- BOOKINGS TABLE: User can only see their own bookings
DROP POLICY IF EXISTS booking_isolation_policy ON bookings;
CREATE POLICY booking_isolation_policy ON bookings
USING (user_id::text = current_setting('app.current_user_id', True))
WITH CHECK (user_id::text = current_setting('app.current_user_id', True));

-- PAYMENTS TABLE: User can only see their own transactions
DROP POLICY IF EXISTS payment_isolation_policy ON payments;
CREATE POLICY payment_isolation_policy ON payments
USING (user_id::text = current_setting('app.current_user_id', True));

-- REPORTS TABLE: User can only see reports belonging to their bookings
DROP POLICY IF EXISTS report_isolation_policy ON reports;
CREATE POLICY report_isolation_policy ON reports
USING (EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = reports.booking_id 
    AND bookings.user_id::text = current_setting('app.current_user_id', True)
));

-- REVIEWS TABLE: User can see all, but only edit their own
DROP POLICY IF EXISTS review_edit_policy ON reviews;
CREATE POLICY review_edit_policy ON reviews
FOR ALL
USING (true)
WITH CHECK (user_id::text = current_setting('app.current_user_id', True));


-- 3. Admin Override (Optional but suggested)
-- If a user has an admin role, they should be able to bypass RLS.
-- This requires a 'role' column in your users table.
/*
CREATE POLICY admin_all_policy ON bookings
USING (current_setting('app.user_role', True) = 'admin');
*/

-- ==========================================
-- SETUP COMPLETE
-- ==========================================
