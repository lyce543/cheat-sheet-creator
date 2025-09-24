-- Create table for storing user queries and results
CREATE TABLE IF NOT EXISTS public.user_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  topics JSONB,
  cheat_sheet_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_queries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_queries table
CREATE POLICY "users_can_view_own_queries" 
  ON public.user_queries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_queries" 
  ON public.user_queries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_queries" 
  ON public.user_queries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_queries" 
  ON public.user_queries FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_queries_user_id ON public.user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_created_at ON public.user_queries(created_at DESC);
