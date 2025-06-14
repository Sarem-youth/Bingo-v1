CREATE TABLE Companies (
    company_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    registered_by_agent_id INTEGER REFERENCES Users(user_id) ON DELETE RESTRICT, -- An agent must exist
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a check to ensure registered_by_agent_id refers to a user with the 'agent' role.
-- This typically requires application-level logic or a trigger, as direct cross-table conditional foreign keys are complex.
-- For now, this FK ensures the user exists. Application logic must validate the role.

-- Indexes for performance
CREATE INDEX idx_companies_registered_by_agent_id ON Companies(registered_by_agent_id);
