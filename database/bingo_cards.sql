CREATE TABLE BingoCards (
    card_id SERIAL PRIMARY KEY,
    game_session_id INTEGER REFERENCES GameSessions(game_session_id) ON DELETE CASCADE,
    player_identifier VARCHAR(255), -- Could be a player account ID or a temporary ID for anonymous players
    card_data JSONB NOT NULL, -- Stores the 5x5 grid, e.g., {"B": [1,2,3,4,5], "I": [16,17,18,19,20], ... "O": [61,...], "free_space": true}
    is_winner BOOLEAN DEFAULT FALSE,
    purchase_price DECIMAL(10,2) DEFAULT 0.00,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_id INTEGER REFERENCES Transactions(transaction_id) ON DELETE SET NULL -- Link to the buy-in transaction
);

-- Indexes for performance
CREATE INDEX idx_bingocards_game_session_id ON BingoCards(game_session_id);
CREATE INDEX idx_bingocards_player_identifier ON BingoCards(player_identifier);
