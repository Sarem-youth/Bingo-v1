CREATE TABLE BingoCards (
    card_id INTEGER PRIMARY KEY, -- Changed from SERIAL, (1 to 255)
    card_data JSONB NOT NULL, -- e.g., {"B": [1, ...], "I": [16, ...], ...}
    qr_code_data TEXT UNIQUE NOT NULL -- Added
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_bingocards_qr_code_data ON BingoCards(qr_code_data); -- Added
