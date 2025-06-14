CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hashed password
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'agent', 'cashier')),
    created_by INTEGER REFERENCES Users(user_id) ON DELETE SET NULL, -- Links agent/cashier to admin
    parent_agent_id INTEGER REFERENCES Users(user_id) ON DELETE SET NULL, -- Links cashier to their parent agent
    commission_rate DECIMAL(5, 4), -- e.g., 0.1000 for 10.00%
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a check constraint to ensure commission_rate is set only for agents
ALTER TABLE Users
ADD CONSTRAINT chk_commission_rate_role
CHECK ((role = 'agent' AND commission_rate IS NOT NULL) OR (role != 'agent' AND commission_rate IS NULL));

-- Add a check constraint to ensure parent_agent_id is set only for cashiers and refers to an agent
-- This might require a trigger or more complex check if we need to verify the role of parent_agent_id strictly at DB level upon insertion.
-- For simplicity, we'll rely on application logic or a simpler check for now.
ALTER TABLE Users
ADD CONSTRAINT chk_parent_agent_id_role
CHECK ((role = 'cashier' AND parent_agent_id IS NOT NULL) OR (role != 'cashier'));

-- Indexes for performance
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_users_created_by ON Users(created_by);
CREATE INDEX idx_users_parent_agent_id ON Users(parent_agent_id);
