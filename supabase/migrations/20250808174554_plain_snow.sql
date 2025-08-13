/*
  # Create stories table for Glimmer app

  1. New Tables
    - `stories`
      - `id` (text, primary key) - Unique story identifier
      - `title` (text, not null) - Story title
      - `content` (text, not null) - Generated story content
      - `scenes` (jsonb, not null) - Story scenes with symbols and metadata
      - `created_at` (timestamptz, default now()) - Creation timestamp
      - `mood` (text, not null) - Story emotional mood/tone
      - `audio_url` (text, nullable) - URL to generated audio file

  2. Security
    - Enable RLS on `stories` table
    - Add policy for anonymous users to manage their own stories
    - Allow full CRUD operations for demo purposes

  3. Indexes
    - Index on created_at for efficient ordering
    - Index on mood for filtering by emotion
*/

-- Create the stories table
CREATE TABLE IF NOT EXISTS stories (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  scenes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  mood text NOT NULL DEFAULT 'neutral',
  audio_url text
);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users full access (for demo purposes)
-- In production, you might want to restrict this based on user authentication
CREATE POLICY "Allow anonymous access to stories"
  ON stories
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users (if you add auth later)
CREATE POLICY "Allow authenticated users full access to stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON stories (created_at DESC);
CREATE INDEX IF NOT EXISTS stories_mood_idx ON stories (mood);

-- Add helpful comments
COMMENT ON TABLE stories IS 'Stores AI-generated stories created by children using visual symbols';
COMMENT ON COLUMN stories.id IS 'Unique identifier for each story';
COMMENT ON COLUMN stories.title IS 'Human-readable title for the story';
COMMENT ON COLUMN stories.content IS 'The full generated story text';
COMMENT ON COLUMN stories.scenes IS 'JSON array containing story scenes with symbols and metadata';
COMMENT ON COLUMN stories.mood IS 'Emotional tone of the story (happy, calm, excited, etc.)';
COMMENT ON COLUMN stories.audio_url IS 'URL to the generated audio narration file';