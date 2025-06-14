-- filepath: c:\Users\SaremTadele\Downloads\Bingo\database\card_stats.sql
CREATE TABLE CardStats (
    card_id INTEGER PRIMARY KEY REFERENCES BingoCards(card_id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_payouts DECIMAL(12, 2) DEFAULT 0.00,
    last_win_date TIMESTAMP WITH TIME ZONE
);

-- Optional: Index on last_win_date for querying recent winners
CREATE INDEX idx_cardstats_last_win_date ON CardStats(last_win_date);
