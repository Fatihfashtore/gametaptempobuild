-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins DECIMAL(10,2) DEFAULT 10.00,
  energy INTEGER DEFAULT 5,
  max_energy INTEGER DEFAULT 5,
  high_score INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  base_stats JSONB DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_pets table (junction table)
CREATE TABLE IF NOT EXISTS player_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, pet_id)
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  coins_earned DECIMAL(10,2) DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  obstacles_passed INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  pet_used UUID REFERENCES pets(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'reward', 'transfer_sent', 'transfer_received', 'gacha')),
  item_type TEXT CHECK (item_type IN ('energy', 'coins', 'pet', 'gacha_pull')),
  item_id UUID,
  amount DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  from_player_id UUID REFERENCES players(id),
  to_player_id UUID REFERENCES players(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES players(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, friend_id)
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  rank INTEGER,
  period TEXT DEFAULT 'all_time' CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pets
INSERT INTO pets (name, type, rarity, image_url) VALUES
('Chirpy', 'bird', 'common', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bird1'),
('Fluffy', 'cat', 'common', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cat1'),
('Buddy', 'dog', 'common', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dog1'),
('Sparky', 'bird', 'rare', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bird2'),
('Shadow', 'cat', 'rare', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cat2'),
('Rex', 'dog', 'rare', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dog2'),
('Phoenix', 'bird', 'epic', 'https://api.dicebear.com/7.x/avataaars/svg?seed=phoenix'),
('Luna', 'cat', 'epic', 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna'),
('Thunder', 'dog', 'epic', 'https://api.dicebear.com/7.x/avataaars/svg?seed=thunder'),
('Celestial', 'bird', 'legendary', 'https://api.dicebear.com/7.x/avataaars/svg?seed=celestial'),
('Mystic', 'cat', 'legendary', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mystic'),
('Titan', 'dog', 'legendary', 'https://api.dicebear.com/7.x/avataaars/svg?seed=titan');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_level ON players(level);
CREATE INDEX IF NOT EXISTS idx_players_coins ON players(coins);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_score ON game_sessions(player_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_player_id ON transactions(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(score DESC);
CREATE INDEX IF NOT EXISTS idx_player_pets_player_id ON player_pets(player_id);
CREATE INDEX IF NOT EXISTS idx_friends_player_id ON friends(player_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table pets;
alter publication supabase_realtime add table player_pets;
alter publication supabase_realtime add table game_sessions;
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table friends;
alter publication supabase_realtime add table leaderboards;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON leaderboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update leaderboard after game session
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all-time leaderboard
    INSERT INTO leaderboards (player_id, score, period)
    VALUES (NEW.player_id, NEW.score, 'all_time')
    ON CONFLICT (player_id) WHERE period = 'all_time'
    DO UPDATE SET 
        score = GREATEST(leaderboards.score, NEW.score),
        updated_at = NOW()
    WHERE leaderboards.score < NEW.score;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for leaderboard updates
CREATE TRIGGER update_leaderboard_trigger
    AFTER INSERT ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_leaderboard();
