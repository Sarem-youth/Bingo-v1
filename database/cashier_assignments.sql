CREATE TABLE CashierAssignments (
    assignment_id SERIAL PRIMARY KEY,
    cashier_user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES Companies(company_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE, -- If the assignment itself is active
    UNIQUE (cashier_user_id, company_id), -- A cashier should ideally be assigned to a company once at a time if active
    UNIQUE (cashier_user_id) WHERE is_active = TRUE -- A cashier can only be actively assigned to one company (PostgreSQL 15+ feature for partial unique index)
                                                -- For broader compatibility, this unique constraint might be handled at application level or by ensuring only one active assignment per cashier.
);

-- Add checks to ensure cashier_user_id refers to a user with the 'cashier' role.
-- This also typically requires application-level logic or a trigger.

-- Indexes for performance
CREATE INDEX idx_cashierassignments_cashier_user_id ON CashierAssignments(cashier_user_id);
CREATE INDEX idx_cashierassignments_company_id ON CashierAssignments(company_id);
